"""
Scraper INGV - Osservatorio Nazionale Terremoti.

Fonte: https://webservices.ingv.it/fdsnws/event/1/query
Formato: FDSN standard, qui usiamo 'text' (pipe-separated) perche' e'
il piu' semplice da parsare senza dipendenze aggiuntive.

Esempio di riga restituita dal servizio:
#EventID|Time|Latitude|Longitude|Depth/Km|Author|Catalog|Contributor|
ContributorID|MagType|Magnitude|MagAuthor|EventLocationName|EventType
46230122|2026-06-15T12:28:45.130000|38.2683|15.1548|10|SURVEY-INGV||||
ML|1.4|SURVEY-INGV|Costa Siciliana nord-orientale (Messina)|earthquake
"""

from datetime import datetime, timedelta, timezone

import httpx

from backend.bot.scraper import BaseScraper

INGV_URL = "https://webservices.ingv.it/fdsnws/event/1/query"

# Sotto questa magnitudo un terremoto in Italia raramente viene percepito:
# pubblicarli tutti riempirebbe la mappa di rumore. Soglia regolabile.
MIN_MAGNITUDE = 2.0

# Quanto indietro guardare ad ogni poll. Va tenuto piu' largo dell'intervallo
# di polling stesso, cosi' se un ciclo salta per un errore di rete non perdi
# eventi nel mezzo (l'upsert su source_event_id evita i duplicati).
LOOKBACK_HOURS = 6


class IngvScraper(BaseScraper):
    source_name = "ingv"

    async def fetch(self) -> str:
        now = datetime.now(timezone.utc)
        start = now - timedelta(hours=LOOKBACK_HOURS)

        params = {
            "starttime": start.strftime("%Y-%m-%dT%H:%M:%S"),
            "endtime": now.strftime("%Y-%m-%dT%H:%M:%S"),
            "minmagnitude": MIN_MAGNITUDE,
            "format": "text",
            "orderby": "time",
        }

        response = await self.client.get(INGV_URL, params=params, timeout=20)
        response.raise_for_status()
        return response.text

    def parse(self, raw_data: str) -> list[dict]:
        events = []
        lines = [l.strip() for l in raw_data.splitlines() if l.strip()]

        for line in lines:
            if line.startswith("#"):
                continue  # riga di intestazione

            fields = line.split("|")
            if len(fields) < 14:
                continue  # riga malformata, la saltiamo senza far crashare il resto

            event_id = fields[0]
            time_str = fields[1]
            latitude = float(fields[2])
            longitude = float(fields[3])
            depth_km = fields[4]
            magnitude = float(fields[10]) if fields[10] else None
            place = fields[12] or "Localita' non specificata"

            if magnitude is None:
                continue

            events.append({
                "type": "weather",  # come deciso: nessuna categoria dedicata per ora
                "title": f"Terremoto M{magnitude:.1f} - {place}",
                "description": f"Magnitudo {magnitude:.1f}, profondita' {depth_km} km. "
                                f"Rilevato da INGV alle {time_str} UTC.",
                "severity": self._severity_from_magnitude(magnitude),
                "latitude": latitude,
                "longitude": longitude,
                "address": place,
                "city": place,  # INGV non da' un comune pulito: usiamo il place testuale
                "status": "active",
                "source_trust": "institutional",
                "source_event_id": event_id,
            })

        return events

    @staticmethod
    def _severity_from_magnitude(mag: float) -> str:
        if mag >= 5.0:
            return "critical"
        if mag >= 4.0:
            return "high"
        if mag >= 3.0:
            return "medium"
        return "low"
