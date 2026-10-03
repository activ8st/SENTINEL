import unittest
from unittest.mock import Mock

from backend.incident_enrichment import (
    EnrichedIncident,
    PrecisePosition,
    apply_resolved_location,
    build_enriched_incident,
    location_precision_for,
    resolve_incident,
)


class IncidentEnrichmentTests(unittest.TestCase):
    def setUp(self):
        self.analysis = {
            "category": "accident",
            "municipality": "Sant'Agata Feltria",
            "place": "Romagnano",
            "location_evidence": "a Romagnano, nel comune di Sant'Agata Feltria",
            "category_evidence": "incidente frontale",
        }

    def test_builds_event_object_with_verified_precise_position(self):
        def resolve(place, municipality):
            self.assertEqual(place, "Romagnano")
            self.assertEqual(municipality, "Sant'Agata Feltria")
            return PrecisePosition(
                latitude=43.9219111,
                longitude=12.1674664,
                address="Romagnano, Sant'Agata Feltria",
                precision="locality",
            )

        event = build_enriched_incident(self.analysis, resolve)

        self.assertIsNotNone(event)
        self.assertEqual(event.event_type, "accident")
        self.assertEqual(event.place, "Romagnano")
        self.assertEqual(
            event.coordinates(),
            (43.9219111, 12.1674664, "Sant'Agata Feltria", "Romagnano, Sant'Agata Feltria", True),
        )

    def test_rejects_city_only_or_unverified_position(self):
        resolver_calls = []
        city_only = {**self.analysis, "place": ""}

        self.assertIsNone(
            build_enriched_incident(city_only, lambda *args: resolver_calls.append(args))
        )
        self.assertEqual(resolver_calls, [])
        self.assertIsNone(build_enriched_incident(self.analysis, lambda *_args: None))

    def test_shared_resolution_prefers_verified_ai_object_for_ingestion(self):
        enriched = EnrichedIncident(
            event_type="accident",
            municipality="Sant'Agata Feltria",
            place="Romagnano",
            latitude=43.9219111,
            longitude=12.1674664,
            address="Romagnano, Sant'Agata Feltria",
            precision="locality",
            location_evidence="a Romagnano",
            category_evidence="incidente frontale",
        )
        text_resolver = Mock(return_value=(43.86, 12.20, "Sant'Agata Feltria", "Sant'Agata Feltria", True))

        result = resolve_incident(
            title="Frontale a Romagnano",
            description="Due feriti.",
            source_name="riminitoday-diretto",
            default_event_type="other",
            classify_event=lambda *_args: "other",
            resolve_from_text=text_resolver,
            analyze_with_ai=lambda *_args: self.analysis,
            build_from_analysis=lambda _analysis: enriched,
            prefer_ai=True,
        )

        self.assertEqual(result.method, "ai-precise")
        self.assertEqual(result.event_type, "accident")
        self.assertTrue(result.has_precise_position)
        text_resolver.assert_not_called()

    def test_shared_resolution_calls_ai_once_when_unresolved(self):
        analyzer = Mock(return_value=None)
        result = resolve_incident(
            title="Intervento in corso",
            description="Informazioni insufficienti.",
            source_name="news",
            default_event_type="other",
            classify_event=lambda *_args: "other",
            resolve_from_text=lambda *_args: None,
            analyze_with_ai=analyzer,
            build_from_analysis=lambda _analysis: None,
            prefer_ai=True,
        )

        self.assertEqual(result.method, "unresolved")
        self.assertEqual(analyzer.call_count, 1)

    def test_location_precision_never_treats_municipality_center_as_precise(self):
        self.assertEqual(location_precision_for("Rimini", "Rimini"), "municipality")
        self.assertEqual(location_precision_for("Rimini", "Marebello, Rimini"), "precise")

        incident = type("IncidentRecord", (), {})()
        apply_resolved_location(
            incident,
            (44.0417567, 12.608035, "Rimini", "Marebello, Rimini", True),
            "rapina a Marebello",
        )
        self.assertEqual(incident.location_precision, "precise")
        self.assertEqual(incident.location_evidence, "rapina a Marebello")


if __name__ == "__main__":
    unittest.main()
