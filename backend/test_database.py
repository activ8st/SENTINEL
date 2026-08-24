import unittest

from sqlalchemy import create_engine, inspect, text

from backend.database import ensure_schema_compatibility


class SchemaCompatibilityTests(unittest.TestCase):
    def test_missing_columns_are_added_without_replacing_tables(self):
        test_engine = create_engine("sqlite://")
        with test_engine.begin() as connection:
            connection.execute(text(
                "CREATE TABLE users (id VARCHAR PRIMARY KEY, name VARCHAR, karma INTEGER)"
            ))
            connection.execute(text(
                "CREATE TABLE incidents (id VARCHAR PRIMARY KEY, title VARCHAR)"
            ))
            connection.execute(text(
                "INSERT INTO users (id, name, karma) VALUES ('existing', 'Existing', 100)"
            ))

        ensure_schema_compatibility(test_engine)

        user_columns = {column["name"] for column in inspect(test_engine).get_columns("users")}
        incident_columns = {
            column["name"] for column in inspect(test_engine).get_columns("incidents")
        }
        self.assertTrue({"strikes", "is_read_only", "role"}.issubset(user_columns))
        self.assertIn("fake_votes", incident_columns)

        with test_engine.connect() as connection:
            existing_user = connection.execute(
                text("SELECT id, karma FROM users WHERE id = 'existing'")
            ).one()
        self.assertEqual(existing_user, ("existing", 100))


if __name__ == "__main__":
    unittest.main()
