import unittest
from unittest.mock import patch

from backend.fetch_live_incidents import (
    VERONA_ROWS, VERONA_CITIES, CITY_COORDS, SOURCES,
    allowed_area_for, detect_city_evidence, coordinates_for,
)


class VeronaCoverageTests(unittest.TestCase):
    def test_all_provincial_municipalities_are_recognized(self):
        self.assertEqual(len(VERONA_ROWS), 98)
        self.assertEqual(len(VERONA_CITIES), 98)
        for name in VERONA_CITIES:
            self.assertEqual(allowed_area_for(name, *CITY_COORDS[name]), "Verona")
        self.assertIsNone(allowed_area_for("Vicenza", 45.55, 11.54))

    def test_incident_municipality_beats_hospital_and_police_locations(self):
        title = "Pauroso frontale nella notte, due giovani feriti"
        body = (
            "Trasportati al Bufalini di Cesena. L'incidente lungo la SP 146 "
            "Sapigno - Romagnano, nel territorio del comune di Sant'Agata Feltria, "
            "e' seguito dai carabinieri di Novafeltria."
        )
        self.assertEqual(detect_city_evidence(title, body)[0], "Sant'Agata Feltria")
        with patch("backend.fetch_live_incidents.geocode_place", return_value=None), patch("backend.fetch_live_incidents.time.sleep"):
            result = coordinates_for(title, body)
        self.assertEqual(result[2], "Sant'Agata Feltria")
        self.assertAlmostEqual(result[0], 43.8639857)

    def test_direct_feeds_do_not_assign_publisher_city(self):
        for name in ("riminitoday-diretto", "veronasera-diretto"):
            source = next(source for source in SOURCES if source.name == name)
            self.assertTrue(source.enrich_article)
            self.assertIsNone(source.publisher_city)


if __name__ == "__main__":
    unittest.main()
