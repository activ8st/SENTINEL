import unittest

from backend.location_resolver import extract_location_candidates, resolve_text_location


class LocationResolverTests(unittest.TestCase):
    def test_route_endpoints_are_extracted_from_article_body(self):
        description = (
            "L'incidente e avvenuto lungo la Sp 146 Sapigno - Romagnano, "
            "nel territorio del comune di Sant'Agata Feltria."
        )
        candidates = extract_location_candidates("Frontale nella notte", description, "Sant'Agata Feltria")
        self.assertEqual(candidates[0].name, "Romagnano")
        self.assertEqual(candidates[0].address, "SP 146, Romagnano, Sant'Agata Feltria")

    def test_prose_in_corso_di_accertamento_is_not_a_street(self):
        candidates = extract_location_candidates(
            "Frontale nella notte",
            "Per cause ancora in corso di accertamento una vettura ha invaso la carreggiata.",
            "Sant'Agata Feltria",
        )
        self.assertEqual(candidates, [])

    def test_geocoded_hamlet_must_be_near_its_municipality(self):
        description = "Incidente lungo la SP 146 Sapigno - Romagnano, nel comune di Sant'Agata Feltria."

        result = resolve_text_location(
            "Frontale",
            description,
            "Sant'Agata Feltria",
            (43.8639857, 12.2083964),
            lambda query: (43.9219111, 12.1674664) if query.startswith("Romagnano") else None,
        )

        self.assertIsNotNone(result)
        self.assertEqual(result[:3], (43.9219111, 12.1674664, "SP 146, Romagnano, Sant'Agata Feltria"))

    def test_distant_homonym_is_rejected(self):
        description = "Incidente lungo la SP 146 Sapigno - Romagnano, nel comune di Sant'Agata Feltria."
        result = resolve_text_location(
            "Frontale",
            description,
            "Sant'Agata Feltria",
            (43.8639857, 12.2083964),
            lambda _query: (45.0, 9.0),
        )
        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main()
