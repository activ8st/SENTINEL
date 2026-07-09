"""
Sentinel Bot - il "Fattorino" automatizzato.

Gira come demone separato dall'API (systemd unit a parte sul VPS, come
deciso). Ogni fonte ha il proprio job schedulato a intervalli diversi,
isolato dagli altri: se una fonte fallisce, le altre continuano.

Avvio locale (per testare):
    python -m bot.main
"""

import asyncio
import logging

import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base
from backend.bot.sources.ingv import IngvScraper

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("sentinel.bot")

# Per ora SQLite, come deciso: cambia solo questa riga (o la variabile
# d'ambiente DATABASE_URL) quando si passa a PostgreSQL/Supabase/Neon.
DATABASE_URL = "sqlite:///./sentinel.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)


async def run_scraper_job(scraper_cls, client: httpx.AsyncClient):
    """Wrapper eseguito dallo scheduler per ogni fonte."""
    scraper = scraper_cls(client)
    db = SessionLocal()
    try:
        await scraper.run(db)
    finally:
        db.close()


async def main():
    logger.info("Sentinel Bot in avvio...")

    # Crea le tabelle se non esistono gia' (per un progetto reale in
    # crescita si userebbe Alembic per le migration, ma per l'MVP va bene cosi')
    Base.metadata.create_all(engine)

    async with httpx.AsyncClient(headers={"User-Agent": "SentinelBot/0.1"}) as client:
        scheduler = AsyncIOScheduler()

        # INGV: terremoti possono succedere in ogni momento -> poll frequente
        scheduler.add_job(
            run_scraper_job,
            "interval",
            minutes=2,
            args=[IngvScraper, client],
            id="ingv_poll",
            next_run_time=None,  # partira' al primo intervallo; vedi run subito sotto
        )

        scheduler.start()
        logger.info("Scheduler avviato. Job registrati: %s", [j.id for j in scheduler.get_jobs()])

        # Eseguiamo subito un primo giro manuale, cosi' non aspettiamo
        # 2 minuti per vedere il primo risultato quando testiamo.
        await run_scraper_job(IngvScraper, client)

        # Tiene vivo il processo (lo scheduler gira in background su questo loop)
        try:
            while True:
                await asyncio.sleep(3600)
        except (KeyboardInterrupt, SystemExit):
            logger.info("Arresto richiesto, chiusura in corso...")
            scheduler.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
