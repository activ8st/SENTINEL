"""
Fetch public Italian alert/news feeds and save relevant items as Sentinel incidents.

Run from the project root:
    python -m backend.fetch_live_incidents

Or from backend:
    python fetch_live_incidents.py
"""

from __future__ import annotations

import datetime as dt
import email.utils
import hashlib
import html
import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Keep SQLite paths stable even if the script is launched from backend.
import os

os.chdir(PROJECT_ROOT)

from backend.database import SessionLocal, engine  # noqa: E402
from backend.models import Base, Incident, Media  # noqa: E402


USER_AGENT = "SentinelLocalBot/1.0 (+local development; contact: localhost)"
MAX_ITEMS_PER_SOURCE = 15
GEOCODE_DELAY_SECONDS = 1.1
MAX_NEWS_AGE = dt.timedelta(days=30)


@dataclass(frozen=True)
class Source:
    name: str
    url: str
    trust: str = "institutional"
    default_type: str = "other"


SOURCES = [
    Source("ansa-cronaca", "https://www.ansa.it/sito/notizie/cronaca/cronaca_rss.xml", "news", "crime"),
    Source("ansa-ambiente", "https://www.ansa.it/canale_ambiente/notizie/ambiente_rss.xml", "news", "weather"),
    Source("protezione-civile", "https://www.protezionecivile.gov.it/it/rss.xml", "institutional", "weather"),
    Source("vigili-fuoco", "https://www.vigilfuoco.it/aspx/Rss.aspx", "institutional", "fire"),
    Source("carabinieri", "https://www.carabinieri.it/in-vostro-aiuto/informazioni/news/RSS", "institutional", "crime"),
    Source("polizia-stato", "https://www.poliziadistato.it/rss", "institutional", "crime"),
    Source(
        "google-news-carabinieri",
        "https://news.google.com/rss/search?q=(carabinieri%20OR%20polizia)%20arresto%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "crime",
    ),
    Source(
        "google-news-meteo",
        "https://news.google.com/rss/search?q=allerta%20meteo%20Italia%20protezione%20civile%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "weather",
    ),
    Source(
        "google-news-vigili-fuoco",
        "https://news.google.com/rss/search?q=vigili%20del%20fuoco%20incendio%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "fire",
    ),
    Source(
        "google-news-ministeri",
        "https://news.google.com/rss/search?q=ministero%20interno%20protezione%20civile%20sicurezza%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "other",
    ),
    Source(
        "google-news-incidenti",
        "https://news.google.com/rss/search?q=incidente%20stradale%20feriti%20Italia%20when:30d&hl=it&gl=IT&ceid=IT:it",
        "news",
        "accident",
    ),
]


CITY_COORDS = {
    "roma": (41.9028, 12.4964),
    "milano": (45.4642, 9.1900),
    "napoli": (40.8518, 14.2681),
    "torino": (45.0703, 7.6869),
    "palermo": (38.1157, 13.3615),
    "genova": (44.4056, 8.9463),
    "bologna": (44.4949, 11.3426),
    "firenze": (43.7696, 11.2558),
    "bari": (41.1171, 16.8719),
    "catania": (37.5079, 15.0830),
    "venezia": (45.4408, 12.3155),
    "verona": (45.4384, 10.9916),
    "messina": (38.1938, 15.5540),
    "padova": (45.4064, 11.8768),
    "trieste": (45.6495, 13.7768),
    "taranto": (40.4644, 17.2470),
    "brescia": (45.5416, 10.2118),
    "prato": (43.8777, 11.1022),
    "parma": (44.8015, 10.3279),
    "modena": (44.6471, 10.9252),
    "reggio calabria": (38.1113, 15.6473),
    "perugia": (43.1107, 12.3908),
    "livorno": (43.5485, 10.3106),
    "ravenna": (44.4184, 12.2035),
    "cagliari": (39.2238, 9.1217),
    "foggia": (41.4622, 15.5446),
    "rimini": (44.0678, 12.5695),
    "salerno": (40.6824, 14.7681),
    "ferrara": (44.8381, 11.6198),
    "sassari": (40.7259, 8.5557),
    "latina": (41.4676, 12.9037),
    "monza": (45.5845, 9.2744),
    "bergamo": (45.6983, 9.6773),
    "siracusa": (37.0755, 15.2866),
    "pescara": (42.4618, 14.2161),
    "trento": (46.0748, 11.1217),
    "bolzano": (46.4983, 11.3548),
}

TYPE_KEYWORDS = [
    ("fire", ["incendio", "fiamme", "rogo", "esplosione", "vigili del fuoco"]),
    ("weather", ["allerta", "meteo", "temporale", "nubifragio", "alluvione", "frana", "neve", "vento", "mareggiata"]),
    ("accident", ["incidente", "scontro", "tamponamento", "feriti", "autostrada", "strada chiusa"]),
    ("medical", ["malore", "sanitario", "ospedale", "118", "soccorso", "evacuato"]),
    ("traffic", ["traffico", "viabilita", "coda", "rallentamenti", "chiusura", "deviazioni"]),
    ("crime", ["arresto", "rapina", "furto", "aggressione", "carabinieri", "polizia", "sequestro"]),
    ("suspicious", ["scomparso", "ricercato", "segnalazione", "sospetto"]),
]

SEVERITY_KEYWORDS = [
    ("critical", ["morto", "morti", "vittima", "vittime", "evacuazione", "disperso", "dispersi", "crollo", "emergenza"]),
    ("high", ["ferito grave", "feriti gravi", "esplosione", "incendio", "allerta rossa", "arrestato", "evacuati"]),
    ("medium", ["allerta arancione", "feriti", "chiusa", "chiuso", "maltempo", "frana", "incidente"]),
]


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text or "")
    text = "".join(c for c in text if not unicodedata.combining(c))
    return text.lower()


def clean_text(text: str, limit: int | None = None) -> str:
    text = html.unescape(text or "")
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if limit and len(text) > limit:
        return text[: limit - 1].rstrip() + "..."
    return text


def utc_now() -> dt.datetime:
    return dt.datetime.now(dt.UTC).replace(tzinfo=None)


def parse_published_at(value: str) -> dt.datetime | None:
    if not value:
        return None
    try:
        parsed = email.utils.parsedate_to_datetime(value)
        if parsed.tzinfo:
            parsed = parsed.astimezone(dt.UTC).replace(tzinfo=None)
        return parsed
    except (TypeError, ValueError):
        return None


def is_recent_enough(published_at: dt.datetime | None) -> bool:
    if published_at is None:
        return True
    return published_at >= utc_now() - MAX_NEWS_AGE


def fetch_url(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as response:
        return response.read()


def parse_rss(payload: bytes) -> list[dict[str, str]]:
    text = payload.decode("utf-8", errors="replace")
    text = re.sub(r"&(?!amp;|lt;|gt;|quot;|apos;|#[0-9]+;|#x[0-9a-fA-F]+;)", "&amp;", text)
    root = ET.fromstring(text.encode("utf-8"))
    items = []
    for item in root.findall(".//item"):
        title = clean_text(item.findtext("title"))
        link = clean_text(item.findtext("link"))
        description = clean_text(item.findtext("description"), 450)
        published = clean_text(item.findtext("pubDate") or item.findtext("date"))
        guid = clean_text(item.findtext("guid") or link or title)
        if title and link:
            items.append(
                {
                    "title": title,
                    "link": link,
                    "description": description or title,
                    "published": published,
                    "guid": guid,
                }
            )
    return items


def parse_feed(payload: bytes) -> list[dict[str, str]]:
    try:
        return parse_rss(payload)
    except ET.ParseError:
        text = payload.decode("utf-8", errors="replace")
        items = []
        for block in re.findall(r"<item\b.*?</item>", text, flags=re.I | re.S):
            def tag(name: str) -> str:
                match = re.search(rf"<{name}\b[^>]*>(.*?)</{name}>", block, flags=re.I | re.S)
                return clean_text(match.group(1)) if match else ""

            title = tag("title")
            link = tag("link")
            description = clean_text(tag("description"), 450)
            guid = tag("guid") or link or title
            if title and link:
                items.append(
                    {
                        "title": title,
                        "link": link,
                        "description": description or title,
                        "published": tag("pubDate"),
                        "guid": guid,
                    }
                )
        return items


def classify_type(title: str, description: str, default_type: str) -> str:
    text = normalize(f"{title} {description}")
    for incident_type, keywords in TYPE_KEYWORDS:
        if any(keyword in text for keyword in keywords):
            return incident_type
    return default_type


def classify_severity(title: str, description: str) -> str:
    text = normalize(f"{title} {description}")
    for severity, keywords in SEVERITY_KEYWORDS:
        if any(keyword in text for keyword in keywords):
            return severity
    return "low"


def detect_city(title: str, description: str) -> str | None:
    text = normalize(f"{title} {description}")
    for city in sorted(CITY_COORDS, key=len, reverse=True):
        if re.search(rf"\b{re.escape(city)}\b", text):
            return city.title()
    return None


def geocode_place(place: str) -> tuple[float, float] | None:
    query = urllib.parse.urlencode({"q": f"{place}, Italia", "format": "json", "limit": "1"})
    url = f"https://nominatim.openstreetmap.org/search?{query}"
    try:
        data = json.loads(fetch_url(url).decode("utf-8"))
    except Exception:
        return None
    if not data:
        return None
    return float(data[0]["lat"]), float(data[0]["lon"])


def coordinates_for(title: str, description: str) -> tuple[float, float, str, str]:
    city = detect_city(title, description)
    if city:
        key = city.lower()
        if key in CITY_COORDS:
            lat, lon = CITY_COORDS[key]
            return lat, lon, city, city
        coords = geocode_place(city)
        time.sleep(GEOCODE_DELAY_SECONDS)
        if coords:
            return coords[0], coords[1], city, city

    # Fallback: center of Italy, so the event is visible but clearly generic.
    return 42.5042, 12.6464, "Italia", "Italia"


def incident_id(source: Source, guid: str) -> str:
    digest = hashlib.sha1(f"{source.name}:{guid}".encode("utf-8")).hexdigest()[:16]
    return f"live-{digest}"


def save_item(db, source: Source, item: dict[str, str]) -> bool:
    published_at = parse_published_at(item.get("published", ""))
    if not is_recent_enough(published_at):
        return False

    source_event_id = item["guid"][:500]
    existing = (
        db.query(Incident)
        .filter(Incident.source == source.name, Incident.source_event_id == source_event_id)
        .first()
    )
    now = utc_now()
    if existing:
        existing.last_seen_at = now
        return False

    title = clean_text(item["title"], 140)
    description = clean_text(item["description"], 420)
    lat, lon, city, address = coordinates_for(title, description)
    inc = Incident(
        id=incident_id(source, source_event_id),
        type=classify_type(title, description, source.default_type),
        title=title,
        description=description,
        severity=classify_severity(title, description),
        latitude=lat,
        longitude=lon,
        address=address,
        city=city,
        status="active",
        created_date=published_at or now,
        source=source.name,
        source_event_id=source_event_id,
        source_trust=source.trust,
        last_seen_at=now,
        reported_by_id="sentinel-bot",
        reporter_karma=1000 if source.trust == "institutional" else 650,
    )
    db.add(inc)
    db.flush()
    db.add(Media(incident_id=inc.id, url=item["link"], type="document"))
    return True


def main() -> dict:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    added = 0
    seen = 0
    failed_sources = []

    try:
        for source in SOURCES:
            try:
                payload = fetch_url(source.url)
                items = parse_feed(payload)[:MAX_ITEMS_PER_SOURCE]
            except Exception as exc:
                failed_sources.append(f"{source.name}: {exc}")
                continue

            for item in items:
                seen += 1
                if save_item(db, source, item):
                    added += 1

        db.commit()
    finally:
        db.close()

    print(f"Fonti lette: {len(SOURCES) - len(failed_sources)}/{len(SOURCES)}")
    print(f"Notizie analizzate: {seen}")
    print(f"Nuovi eventi aggiunti: {added}")
    if failed_sources:
        print("Fonti saltate:")
        for failed in failed_sources:
            print(f"- {failed}")

    return {
        "sources_read": len(SOURCES) - len(failed_sources),
        "sources_total": len(SOURCES),
        "items_seen": seen,
        "added": added,
        "failed_sources": failed_sources,
    }


if __name__ == "__main__":
    main()
