import os

from sqlalchemy import create_engine, event, inspect, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sentinel.db").strip()
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgres://", "postgresql+psycopg://", 1
    )
elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgresql://", "postgresql+psycopg://", 1
    )

IS_SQLITE = SQLALCHEMY_DATABASE_URL.startswith("sqlite")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 30} if IS_SQLITE else {},
    pool_pre_ping=not IS_SQLITE,
)


if IS_SQLITE:
    @event.listens_for(engine, "connect")
    def configure_sqlite(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=30000")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


SCHEMA_COMPAT_COLUMNS = {
    "users": {
        "strikes": "INTEGER NOT NULL DEFAULT 0",
        "is_read_only": "BOOLEAN NOT NULL DEFAULT FALSE",
        "role": "VARCHAR DEFAULT 'user'",
        "email": "VARCHAR",
        "phone": "VARCHAR",
        "first_name": "VARCHAR",
        "last_name": "VARCHAR",
        "birth_year": "INTEGER",
        "created_at": "DATETIME",
        "updated_at": "DATETIME",
        "last_login_at": "DATETIME",
    },
    "incidents": {
        "fake_votes": "INTEGER NOT NULL DEFAULT 0",
        "location_precision": "VARCHAR NOT NULL DEFAULT 'unknown'",
        "location_evidence": "VARCHAR",
        "verification_status": "VARCHAR DEFAULT 'unverified'",
        "confidence_score": "FLOAT DEFAULT 0.5",
        "source_type": "VARCHAR DEFAULT 'rss'",
        "source_url": "VARCHAR",
        "published_at": "DATETIME",
        "updated_at": "DATETIME",
        "resolved_at": "DATETIME",
        "resolution_reason": "VARCHAR",
        "last_verified_at": "DATETIME",
    },
}

SCHEMA_COMPAT_INDEXES = {
    "ix_incidents_status_created_date": {
        "table": "incidents",
        "columns": {"status", "created_date"},
        "statement": (
            "CREATE INDEX IF NOT EXISTS ix_incidents_status_created_date "
            "ON incidents (status, created_date DESC)"
        ),
    },
    "ix_media_incident_id": {
        "table": "media",
        "columns": {"incident_id"},
        "statement": (
            "CREATE INDEX IF NOT EXISTS ix_media_incident_id "
            "ON media (incident_id)"
        ),
    },
}


def schema_definition_for_dialect(definition: str, dialect_name: str) -> str:
    """Translate portable compatibility definitions for the active database."""
    if dialect_name == "postgresql":
        return definition.replace("DATETIME", "TIMESTAMP")
    return definition


def ensure_schema_compatibility(target_engine=engine):
    """Add known backward-compatible columns without replacing user data."""
    Base.metadata.create_all(bind=target_engine)
    inspector = inspect(target_engine)
    existing_tables = set(inspector.get_table_names())

    with target_engine.begin() as connection:
        for table_name, expected_columns in SCHEMA_COMPAT_COLUMNS.items():
            if table_name not in existing_tables:
                continue
            current_columns = {
                column["name"] for column in inspect(target_engine).get_columns(table_name)
            }
            for column_name, definition in expected_columns.items():
                if column_name in current_columns:
                    continue
                dialect_definition = schema_definition_for_dialect(
                    definition,
                    target_engine.dialect.name,
                )
                connection.execute(text(
                    f'ALTER TABLE "{table_name}" ADD COLUMN "{column_name}" {dialect_definition}'
                ))

        refreshed_inspector = inspect(target_engine)
        refreshed_tables = set(refreshed_inspector.get_table_names())
        for index_spec in SCHEMA_COMPAT_INDEXES.values():
            table_name = index_spec["table"]
            if table_name not in refreshed_tables:
                continue
            table_columns = {
                column["name"]
                for column in refreshed_inspector.get_columns(table_name)
            }
            if index_spec["columns"].issubset(table_columns):
                connection.execute(text(index_spec["statement"]))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
