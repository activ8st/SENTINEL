from __future__ import annotations

import math
import re
from dataclasses import dataclass
from typing import Callable


@dataclass(frozen=True)
class LocationCandidate:
    name: str
    query: str
    address: str
    kind: str


PROPER_WORD = r"[A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’.-]+"
PROPER_NAME = rf"{PROPER_WORD}(?:\s+(?:(?:di|del|della|dei|san|sant'|santa)\s+)?{PROPER_WORD}){{0,3}}"


def _clean(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip(" .,:;–—-")


def _append_unique(
    candidates: list[LocationCandidate],
    seen: set[str],
    name: str,
    municipality: str,
    kind: str,
    address_prefix: str = "",
) -> None:
    cleaned = _clean(name)
    key = cleaned.casefold()
    if len(cleaned) < 3 or key == municipality.casefold() or key in seen:
        return
    seen.add(key)
    address = ", ".join(part for part in (address_prefix, cleaned, municipality) if part)
    candidates.append(LocationCandidate(
        name=cleaned,
        query=f"{cleaned}, {municipality}",
        address=address,
        kind=kind,
    ))


def extract_location_candidates(
    title: str,
    description: str,
    municipality: str,
) -> list[LocationCandidate]:
    """Extract precise places from article prose, prioritizing the body."""
    text = f"{description or ''}. {title or ''}"
    candidates: list[LocationCandidate] = []
    seen: set[str] = set()

    route_pattern = re.compile(
        rf"\b(?P<road>(?i:sp|s\.p\.|sr|s\.r\.|ss|s\.s\.|strada provinciale|strada regionale|strada statale))"
        rf"\s*(?P<number>\d+[a-zA-Z]?)\s+(?P<from>{PROPER_NAME})\s*[-–—]\s*(?P<to>{PROPER_NAME})(?=\s*[,.;])"
    )
    for match in route_pattern.finditer(text):
        road = f"{match.group('road').upper().replace('.', '')} {match.group('number')}"
        _append_unique(candidates, seen, match.group("to"), municipality, "road-endpoint", road)
        _append_unique(candidates, seen, match.group("from"), municipality, "road-endpoint", road)

    locality_pattern = re.compile(
        rf"\b(?i:località|localita|frazione|borgo|quartiere|zona)\s+(?:(?i:di|del|della)\s+)?(?P<name>{PROPER_NAME})(?=\s*[,.;])"
    )
    for match in locality_pattern.finditer(text):
        _append_unique(candidates, seen, match.group("name"), municipality, "locality")

    street_pattern = re.compile(
        rf"\b(?P<street>(?i:via|viale|piazza|piazzale|lungomare|strada))\s+(?P<name>{PROPER_NAME})(?=\s*[,.;])"
    )
    for match in street_pattern.finditer(text):
        street = f"{match.group('street')} {match.group('name')}"
        _append_unique(candidates, seen, street, municipality, "street")

    return candidates


def distance_km(first: tuple[float, float], second: tuple[float, float]) -> float:
    lat1, lon1 = first
    lat2, lon2 = second
    radius = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    value = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    return radius * 2 * math.atan2(math.sqrt(value), math.sqrt(1 - value))


def resolve_text_location(
    title: str,
    description: str,
    municipality: str,
    municipality_center: tuple[float, float] | None,
    geocode: Callable[[str], tuple[float, float] | None],
    max_distance_km: float = 45.0,
) -> tuple[float, float, str, LocationCandidate] | None:
    for candidate in extract_location_candidates(title, description, municipality):
        coordinates = geocode(candidate.query)
        if coordinates is None:
            continue
        if municipality_center and distance_km(municipality_center, coordinates) > max_distance_km:
            continue
        return coordinates[0], coordinates[1], candidate.address, candidate
    return None
