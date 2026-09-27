import unittest
from unittest.mock import patch
from backend.gemini_news import analyze_article, validate_result


class GeminiNewsTests(unittest.TestCase):
    def test_requires_evidence_in_body(self):
        body = 'Incendio a Milano in via Torino.'
        result = dict(category='fire', category_evidence='Incendio',
                      municipality='Milano', place='via Torino', location_evidence=body)
        self.assertEqual(validate_result(result, body), result)
        self.assertIsNone(validate_result({**result, 'municipality': 'Roma'}, body))
        self.assertIsNone(validate_result({**result, 'category': 'invented'}, body))

    @patch.dict('os.environ', {'SENTINEL_GEMINI_ENABLED': 'false'})
    @patch('backend.gemini_news.requests.post')
    def test_disabled_never_calls_api(self, post):
        self.assertIsNone(analyze_article('Titolo', 'Testo'))
        post.assert_not_called()
