"""
Classe base per gli scraper di Sentinel.

Ogni fonte (INGV, Protezione Civile, CCISS, ...) e' un piccolo "adattatore"
che eredita da BaseScraper e implementa solo due cose:
  1. fetch()  -> va a prendere i dati grezzi dalla fonte
  2. parse()  -> li traduce nello schema comune Incident

Il resto (salvataggio, deduplica, log) e' condiviso e vive qui, cosi' non
lo devi riscrivere ogni volta che aggiungi una fonte nuova.
"""

import abc
import logging
from datetime import datetime, timezone
from typing import Any

import httpx
from sqlalchemy.orm import Session

from backend.models import Incident

logger = logging.getLogger("sentinel.scraper")


class BaseScraper(abc.ABC):
    """Contratto che ogni fonte dati deve rispettare."""

    # Da sovrascrivere in ogni sottoclasse
    source_name: str = "base"

    def __init__(self, client: httpx.AsyncClient):
        self.client = client

    @abc.abstractmethod
    async def fetch(self) -> Any:
        """Va a prendere i dati grezzi dalla fonte (chiamata HTTP)."""
        raise NotImplementedError

    @abc.abstractmethod
    def parse(self, raw_data: Any) -> list[dict]:
        """
        Traduce i dati grezzi in una lista di dizionari conformi allo
        schema Incident (stessi campi del modello, tranne 'id' e
        'created_date'/'last_seen_at' che gestiamo noi qui sotto).
        """
        raise NotImplementedError

    async def run(self, db: Session) -> int:
        """
        Esegue un ciclo completo: fetch -> parse -> upsert nel database.
        Ritorna il numero di eventi nuovi o aggiornati.
        Non lancia mai eccezioni verso il chiamante: una fonte che fallisce
        non deve mai far cadere le altre (isolamento richiesto dal job
        scheduler in main.py).
        """
        try:
            raw = await self.fetch()
        except Exception:
            logger.exception("[%s] fetch fallito", self.source_name)
            return 0

        try:
            events = self.parse(raw)
        except Exception:
            logger.exception("[%s] parse fallito", self.source_name)
            return 0

        changed = 0
        now = datetime.now(timezone.utc)

        for event in events:
            source_event_id = event["source_event_id"]

            existing = (
                db.query(Incident)
                .filter_by(source=self.source_name, source_event_id=source_event_id)
                .one_or_none()
            )

            if existing is None:
                incident = Incident(
                    id=f"{self.source_name}-{source_event_id}",
                    source=self.source_name,
                    source_event_id=source_event_id,
                    created_date=now,
                    last_seen_at=now,
                    **{k: v for k, v in event.items() if k != "source_event_id"},
                )
                db.add(incident)
                changed += 1
                logger.info("[%s] nuovo evento: %s", self.source_name, incident.title)
            else:
                # Evento gia' noto: aggiorniamo solo i campi che possono
                # cambiare nel tempo (es. una magnitudo rivista, un
                # bollettino che cambia colore) e il timestamp di "visto".
                for k, v in event.items():
                    if k != "source_event_id":
                        setattr(existing, k, v)
                existing.last_seen_at = now
                changed += 1

        db.commit()
        logger.info("[%s] ciclo completato: %d eventi processati", self.source_name, changed)
        return changed
