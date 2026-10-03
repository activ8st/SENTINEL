from __future__ import annotations

import argparse
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from backend.database import SessionLocal
from backend.fetch_live_incidents import (
    classify_type,
    coordinates_for,
    fetch_article_context,
    precise_incident_from_analysis,
)
from backend.gemini_news import analyze_article
from backend.incident_enrichment import apply_resolved_location, resolve_incident
from backend.models import Incident, Media


LOCATION_CHECK_MARKER = "location-checked-v3"
REPAIR_WORKERS = 6


def _mark_checked(incident: Incident) -> None:
    trust = incident.source_trust or "news"
    if LOCATION_CHECK_MARKER not in trust:
        incident.source_trust = f"{trust}-{LOCATION_CHECK_MARKER}"


def repair_recent_locations(db: Session, limit: int | None = 200) -> dict[str, int]:
    candidates = (
        db.query(Incident)
        .options(selectinload(Incident.media))
        .filter(
            Incident.status == "active",
            Incident.source.isnot(None),
            Incident.media.any(Media.url.isnot(None)),
            or_(
                Incident.source_trust.is_(None),
                ~Incident.source_trust.contains(LOCATION_CHECK_MARKER),
            ),
        )
        .order_by(Incident.created_date.desc())
        .all()
    )
    candidates.sort(key=lambda incident: (
        incident.address != incident.city,
        incident.source != "riminitoday-diretto",
        -(incident.created_date.timestamp() if incident.created_date else 0),
    ))
    total_candidates = len(candidates)
    if limit is not None:
        candidates = candidates[:max(0, limit)]
    jobs = {}
    with ThreadPoolExecutor(max_workers=REPAIR_WORKERS) as executor:
        for incident in candidates:
            source_url = next((media.url for media in incident.media if media.url), "")
            if source_url:
                jobs[executor.submit(fetch_article_context, source_url)] = incident

        checked = 0
        corrected = 0
        already_precise = 0
        for future in as_completed(jobs):
            incident = jobs[future]
            try:
                description, _published_at = future.result()
            except Exception:
                continue
            if not description:
                continue
            checked += 1
            resolution = resolve_incident(
                title=incident.title,
                description=description,
                source_name=incident.source,
                default_event_type=incident.type or "other",
                classify_event=classify_type,
                resolve_from_text=lambda title, body, source_name: coordinates_for(
                    title, body, source_name, allow_geocode=True,
                ),
                analyze_with_ai=analyze_article,
                build_from_analysis=precise_incident_from_analysis,
                prefer_ai=False,
            )
            coords = resolution.coordinates
            incident.type = resolution.event_type
            if coords is not None and coords[3] != coords[2]:
                lat, lon, city, address, _position_from_text = coords
                changed = (
                    address != incident.address
                    or city.casefold() != (incident.city or "").casefold()
                    or incident.latitude is None
                    or incident.longitude is None
                    or abs(lat - incident.latitude) > 0.000001
                    or abs(lon - incident.longitude) > 0.000001
                )
                if changed:
                    apply_resolved_location(incident, coords)
                    corrected += 1
                else:
                    already_precise += 1
                incident.location_precision = "precise"
                incident.location_evidence = (
                    getattr(resolution.enriched_incident, "location_evidence", "")
                    if resolution.enriched_incident
                    else address
                ) or address
            else:
                incident.location_precision = "municipality"
                incident.location_evidence = incident.city
            _mark_checked(incident)

    return {
        "location_articles_checked": checked,
        "precise_locations_repaired": corrected,
        "precise_locations_confirmed": already_precise,
        "location_articles_remaining": max(0, total_candidates - checked),
    }


def main(limit: int | None = 200) -> dict[str, int]:
    db = SessionLocal()
    try:
        result = repair_recent_locations(db, limit=limit)
        db.commit()
        print(f"Articoli controllati: {result['location_articles_checked']}")
        print(f"Posizioni rese precise: {result['precise_locations_repaired']}")
        print(f"Posizioni precise confermate: {result['precise_locations_confirmed']}")
        print(f"Articoli ancora da verificare: {result['location_articles_remaining']}")
        return result
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Verifica le posizioni degli eventi Sentinel.")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()
    configured_limit = max(1, int(os.getenv("SENTINEL_LOCATION_REPAIR_BATCH", "200")))
    main(limit=None if args.all else (args.limit or configured_limit))
