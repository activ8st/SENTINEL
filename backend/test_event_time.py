import datetime as dt
import unittest
from zoneinfo import ZoneInfo

from backend.event_time import extract_event_time
from backend.fetch_live_incidents import detect_city_evidence


class EventTimeTests(unittest.TestCase):
    timezone = ZoneInfo("Europe/Rome")
    published = dt.datetime(2026, 9, 6, 10)

    def extract(self, text):
        return extract_event_time(text, self.published, self.timezone)

    def test_explicit_date_and_italian_timezone(self):
        self.assertEqual(self.extract("Incidente avvenuto il 05/09/2026 alle 23:30."), dt.datetime(2026, 9, 5, 21, 30))
        self.assertEqual(self.extract("Incendio scoppiato il 5 settembre 2026 alle 23.30."), dt.datetime(2026, 9, 5, 21, 30))

    def test_relative_date_uses_publication_not_fetch_date(self):
        self.assertEqual(self.extract("Incidente avvenuto ieri alle 23:30."), dt.datetime(2026, 9, 5, 21, 30))

    def test_ambiguous_or_unrelated_times_are_not_invented(self):
        for text in (
            "Incidente avvenuto nella notte alle 02:00.",
            "Incidente avvenuto oggi verso le 09:00.",
            "Incidente avvenuto oggi alle 23:00.",
            "Incidente a Rimini. Conferenza stampa oggi alle 09:00.",
            "Incidente avvenuto oggi alle 09:00. Incendio scoppiato ieri alle 22:00.",
        ):
            with self.subTest(text=text):
                self.assertIsNone(self.extract(text))

    def test_description_event_location_overrides_hospital_in_title(self):
        self.assertEqual(detect_city_evidence("Feriti ricoverati a Cesena", "Incidente a Rimini, due auto coinvolte.")[0], "Rimini")


if __name__ == "__main__":
    unittest.main()
