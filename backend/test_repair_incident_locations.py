import datetime
import unittest
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.models import Base, Incident, Media
from backend.repair_incident_locations import repair_recent_locations


class RepairIncidentLocationsTests(unittest.TestCase):
    def setUp(self):
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(engine)
        self.db = sessionmaker(bind=engine)()

    def tearDown(self):
        self.db.close()

    def test_repairs_generic_municipality_position_from_article_body(self):
        incident = Incident(
            id="romagnano-test",
            type="incident",
            title="Pauroso frontale nella notte",
            description="Descrizione breve",
            severity="high",
            latitude=43.8639857,
            longitude=12.2083964,
            address="Sant'Agata Feltria",
            city="Sant'Agata Feltria",
            status="active",
            source="riminitoday-diretto",
            source_event_id="romagnano-test",
            source_trust="local-news",
            created_date=datetime.datetime.now(datetime.UTC).replace(tzinfo=None),
        )
        incident.media.append(Media(url="https://example.test/article", type="source"))
        self.db.add(incident)
        self.db.commit()

        body = "Incidente sulla SP 146 Sapigno - Romagnano, nel comune di Sant'Agata Feltria."
        resolved = (
            43.9219111,
            12.1674664,
            "Sant'Agata Feltria",
            "SP 146, Romagnano, Sant'Agata Feltria",
            True,
        )
        with (
            patch(
                "backend.repair_incident_locations.fetch_article_context",
                return_value=(body, None),
            ),
            patch(
                "backend.repair_incident_locations.coordinates_for",
                return_value=resolved,
            ),
        ):
            result = repair_recent_locations(self.db, limit=1)

        self.assertEqual(result["location_articles_checked"], 1)
        self.assertEqual(result["precise_locations_repaired"], 1)
        self.assertEqual(incident.address, "SP 146, Romagnano, Sant'Agata Feltria")
        self.assertAlmostEqual(incident.latitude, 43.9219111)
        self.assertIn("location-checked", incident.source_trust)

    def test_replaces_wrong_city_even_when_only_new_municipality_is_known(self):
        incident = Incident(
            id="wrong-city-test",
            type="incident",
            title="Intervento dei vigili del fuoco",
            description="Descrizione breve",
            severity="medium",
            latitude=45.4642,
            longitude=9.1900,
            address="Milano",
            city="Milano",
            status="active",
            source="riminitoday-diretto",
            source_event_id="wrong-city-test",
            source_trust="local-news",
            created_date=datetime.datetime.now(datetime.UTC).replace(tzinfo=None),
        )
        incident.media.append(Media(url="https://example.test/ravenna", type="source"))
        self.db.add(incident)
        self.db.commit()

        analysis = {
            "category": "fire",
            "municipality": "Ravenna",
            "place": "",
            "location_evidence": "nel comune di Ravenna",
            "category_evidence": "incendio",
        }
        corrected = (44.4184, 12.2035, "Ravenna", "Ravenna", True)
        with (
            patch(
                "backend.repair_incident_locations.fetch_article_context",
                return_value=("Incendio nel comune di Ravenna.", None),
            ),
            patch("backend.repair_incident_locations.analyze_article", return_value=analysis),
            patch(
                "backend.repair_incident_locations.coordinates_from_analysis",
                return_value=corrected,
            ),
        ):
            result = repair_recent_locations(self.db, limit=1)

        self.assertEqual(result["precise_locations_repaired"], 1)
        self.assertEqual(incident.city, "Ravenna")
        self.assertEqual(incident.address, "Ravenna")
        self.assertAlmostEqual(incident.latitude, 44.4184)


if __name__ == "__main__":
    unittest.main()
