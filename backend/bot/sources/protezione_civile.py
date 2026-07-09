"""
Scraper Protezione Civile - Bollettino di criticita' nazionale.

STUB - da completare. Cose da verificare prima di finire l'implementazione:

1. Trovare l'URL esatto e aggiornato del dataset open data (bollettini in
   XML/CSV/SHP). Il portale storico e' rischi.protezionecivile.gov.it -
   verificare se pubblicano ancora un link diretto ai file o se serve
   un piccolo parsing della pagina per trovare il file del giorno.
2. Il bollettino e' per ZONA (156 zone di allerta), non per punto GPS:
   serve una tabella zona -> comuni coperti -> centroide (o geometria)
   per poter riempire latitude/longitude. Senza questa tabella lo
   scraper non puo' produrre Incident validi.
3. Frequenza: pubblicato ~1 volta al giorno (~16:00), quindi il polling
   va impostato via cron di APScheduler, non a intervalli fissi come INGV.
"""

import httpx

from backend.bot.scraper import BaseScraper

SEVERITY_MAP = {
    "verde": None,      # nessuna allerta -> non creiamo l'Incident
    "giallo": "low",
    "arancione": "medium",
    "rosso": "critical",
}


class ProtezioneCivileScraper(BaseScraper):
    source_name = "protezione_civile"

    async def fetch(self):
        raise NotImplementedError(
            "TODO: implementare la chiamata al dataset open data PC "
            "(vedi note nel docstring del modulo)"
        )

    def parse(self, raw_data) -> list[dict]:
        raise NotImplementedError("TODO: parsing bollettino + join con tabella zone->comuni")
