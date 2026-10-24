import unittest

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend import models
from backend.database import Base
from backend.main import get_incident


class IncidentDetailEndpointTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        cls.session_factory = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=cls.engine,
        )

    def setUp(self):
        Base.metadata.create_all(bind=self.engine)

    @classmethod
    def tearDownClass(cls):
        cls.engine.dispose()

    def tearDown(self):
        Base.metadata.drop_all(bind=self.engine)

    def add_incident(self, incident_id, status):
        session = self.session_factory()
        incident = models.Incident(
            id=incident_id,
            type="crime",
            title=f"Evento {status}",
            description=(
                "Evento verificato per il test del dettaglio. Fonte: Test Source. "
                "Localizzazione: Roma. Data e ora mostrate: pubblicazione."
            ),
            severity="medium",
            latitude=45.4642,
            longitude=9.1900,
            address="Via Test 1, Milano",
            city="Milano",
            status=status,
            source="Test Source",
        )
        incident.media.append(models.Media(url="https://example.com/source", type="link"))
        session.add(incident)
        session.commit()
        session.close()

    def test_active_and_monitoring_incidents_are_public(self):
        for status in ("active", "monitoring"):
            incident_id = f"detail-{status}"
            self.add_incident(incident_id, status)
            session = self.session_factory()

            incident = get_incident(incident_id, session)

            self.assertEqual(incident.status, status)
            self.assertEqual(incident.media_urls, ["https://example.com/source"])
            self.assertIn("Localizzazione: Via Test 1, Milano.", incident.description)
            session.close()

    def test_non_public_incident_is_not_exposed(self):
        self.add_incident("detail-pending", "pending_review")
        session = self.session_factory()

        with self.assertRaises(HTTPException) as raised:
            get_incident("detail-pending", session)

        self.assertEqual(raised.exception.status_code, 404)
        session.close()


if __name__ == "__main__":
    unittest.main()
