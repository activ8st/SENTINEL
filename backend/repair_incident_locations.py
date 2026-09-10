from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed

from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.fetch_live_incidents import (
    FULL_ARTICLE_SOURCE_NAMES,
    coordinates_for,
    fetch_article_context,
)
from backend.models import Incident


LOCATION_CHECK_MARKER = "location-checked"
REPAIR_WORKERS = 6


def _mark_checked(incident: Incident) -> None:
    trust = incident.source_trust or "news"
    if LOCATION_CHECK_MARKER not in trust:
        incident.source_trust = f"{trust}-{LOCATION_CHECK_MARKER}"


def repair_recent_locations(db: Session, limit: int = 40) -> dict[str, int]:
    candidates = (
        db.query(Incident)
        .filter(
            Incident.status == "active",
            Incident.source.in_(list(FULL_ARTICLE_SOURCE_NAMES)),
            Incident.address == Incident.city,
            or_(
                Incident.source_trust.is_(None),
                ~Incident.source_trust.contains(LOCATION_CHECK_MARKER),
            ),
        )
        .order_by(Incident.created_date.desc())
        .all()
    )
    candidates.sort(key=lambda incident: (
        incident.source != "riminitoday-diretto",
        -(incident.created_date.timestamp() if incident.created_date else 0),
    ))
    candidates = candidates[:max(0, limit)]
    jobs = {}
    with ThreadPoolExecutor(max_workers=REPAIR_WORKERS) as executor:
        for incident in candidates:
            source_url = next((media.url for media in incident.media if media.url), "")
            if source_url:
                jobs[executor.submit(fetch_article_context, source_url)] = incident

        checked = 0
        corrected = 0
        for future in as_completed(jobs):
            incident = jobs[future]
            try:
                description, _published_at = future.result()
            except Exception:
                continue
            if not description:
                continue
            checked += 1
            coords = coordinates_for(
                incident.title,
                description,
                incident.source,
                allow_geocode=True,
            )
            if coords is not None:
                lat, lon, city, address, _position_from_text = coords
                if address != city:
                    incident.latitude = lat
                    incident.longitude = lon
                    incident.city = city
                    incident.address = address
                    corrected += 1
            _mark_checked(incident)

    return {
        "location_articles_checked": checked,
        "precise_locations_repaired": corrected,
    }


def main(limit: int = 200) -> dict[str, int]:
    db = SessionLocal()
    try:
        result = repair_recent_locations(db, limit=limit)
        db.commit()
        print(f"Articoli controllati: {result['location_articles_checked']}")
        print(f"Posizioni rese precise: {result['precise_locations_repaired']}")
        return result
    finally:
        db.close()


if __name__ == "__main__":
    main()
