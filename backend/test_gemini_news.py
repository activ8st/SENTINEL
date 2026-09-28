import datetime as dt
import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path
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

    def test_waits_between_requests_instead_of_skipping_article(self):
        body = 'Incendio a Milano in via Torino.'
        api_result = dict(
            category='fire',
            category_evidence='Incendio',
            municipality='Milano',
            place='via Torino',
            location_evidence=body,
        )
        response = unittest.mock.Mock(status_code=200)
        response.json.return_value = {
            'candidates': [{'content': {'parts': [{'text': json.dumps(api_result)}]}}],
        }

        with tempfile.TemporaryDirectory() as directory:
            cache_path = Path(directory) / 'gemini.sqlite3'
            day = dt.datetime.now(dt.timezone.utc).date().isoformat()
            with closing(sqlite3.connect(cache_path)) as db:
                db.execute('CREATE TABLE quota (day TEXT PRIMARY KEY, used INTEGER, last REAL, blocked INTEGER)')
                db.execute('INSERT INTO quota VALUES (?,0,100,0)', (day,))
                db.commit()

            with (
                patch.dict('os.environ', {
                    'GEMINI_API_KEY': 'test-key',
                    'SENTINEL_GEMINI_ENABLED': 'true',
                    'SENTINEL_GEMINI_CACHE': str(cache_path),
                    'SENTINEL_GEMINI_MIN_INTERVAL_SECONDS': '6',
                }),
                patch('backend.gemini_news.time.time', side_effect=[102, 106]),
                patch('backend.gemini_news.time.sleep') as sleep,
                patch('backend.gemini_news.requests.post', return_value=response) as post,
            ):
                self.assertEqual(analyze_article('Titolo', body), api_result)

            sleep.assert_called_once_with(4)
            post.assert_called_once()
