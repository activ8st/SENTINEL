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
    },
    "incidents": {
        "fake_votes": "INTEGER NOT NULL DEFAULT 0",
    },
}


def ensure_schema_compatibility(target_engine=engine):
    """Add known backward-compatible columns without replacing user data."""
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
                connection.execute(text(
                    f'ALTER TABLE "{table_name}" ADD COLUMN "{column_name}" {definition}'
                ))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
