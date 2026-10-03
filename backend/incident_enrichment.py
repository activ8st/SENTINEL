from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Mapping, TypeAlias


VALID_EVENT_TYPES = {
    "crime",
    "fire",
    "accident",
    "medical",
    "suspicious",
    "traffic",
    "weather",
    "other",
}

IncidentCoordinates: TypeAlias = tuple[float, float, str, str, bool]


def location_precision_for(city: str, address: str) -> str:
    city_key = (city or "").strip().casefold()
    address_key = (address or "").strip().casefold()
    return "precise" if address_key and city_key and address_key != city_key else "municipality"


def apply_resolved_location(
    incident: Any,
    coordinates: IncidentCoordinates,
    evidence: str | None = None,
) -> None:
    latitude, longitude, city, address, _from_text = coordinates
    incident.latitude = latitude
    incident.longitude = longitude
    incident.city = city
    incident.address = address
    incident.location_precision = location_precision_for(city, address)
    incident.location_evidence = evidence or address or city


@dataclass(frozen=True, slots=True)
class PrecisePosition:
    latitude: float
    longitude: float
    address: str
    precision: str


@dataclass(frozen=True, slots=True)
class EnrichedIncident:
    event_type: str
    municipality: str
    place: str
    latitude: float
    longitude: float
    address: str
    precision: str
    location_evidence: str
    category_evidence: str

    def coordinates(self) -> IncidentCoordinates:
        return (
            self.latitude,
            self.longitude,
            self.municipality,
            self.address,
            True,
        )


@dataclass(frozen=True, slots=True)
class IncidentResolution:
    event_type: str
    coordinates: IncidentCoordinates | None
    analysis: Mapping[str, str] | None
    enriched_incident: EnrichedIncident | None
    method: str

    @property
    def has_precise_position(self) -> bool:
        return bool(
            self.coordinates
            and self.coordinates[3].casefold() != self.coordinates[2].casefold()
        )


def build_enriched_incident(
    analysis: Mapping[str, str] | None,
    resolve_position: Callable[[str, str], PrecisePosition | None],
) -> EnrichedIncident | None:
    if not analysis:
        return None

    event_type = analysis.get("category", "").strip()
    municipality = analysis.get("municipality", "").strip()
    place = analysis.get("place", "").strip()
    if event_type not in VALID_EVENT_TYPES or not municipality or not place:
        return None

    position = resolve_position(place, municipality)
    if position is None:
        return None

    return EnrichedIncident(
        event_type=event_type,
        municipality=municipality,
        place=place,
        latitude=position.latitude,
        longitude=position.longitude,
        address=position.address,
        precision=position.precision,
        location_evidence=analysis.get("location_evidence", "").strip(),
        category_evidence=analysis.get("category_evidence", "").strip(),
    )


def resolve_incident(
    *,
    title: str,
    description: str,
    source_name: str | None,
    default_event_type: str,
    classify_event: Callable[[str, str, str], str],
    resolve_from_text: Callable[[str, str, str | None], IncidentCoordinates | None],
    analyze_with_ai: Callable[[str, str], Mapping[str, str] | None] | None = None,
    build_from_analysis: Callable[[Mapping[str, str] | None], EnrichedIncident | None] | None = None,
    prefer_ai: bool = False,
) -> IncidentResolution:
    """Return one portable decision shared by ingestion and repair scripts."""
    event_type = classify_event(title, description, default_event_type)
    analysis: Mapping[str, str] | None = None
    enriched: EnrichedIncident | None = None
    ai_attempted = False

    def run_ai() -> None:
        nonlocal analysis, enriched, event_type, ai_attempted
        if analyze_with_ai is None or build_from_analysis is None or ai_attempted:
            return
        ai_attempted = True
        analysis = analyze_with_ai(title, description)
        if analysis and analysis.get("category") in VALID_EVENT_TYPES:
            event_type = analysis["category"]
        enriched = build_from_analysis(analysis)

    if prefer_ai:
        run_ai()
        if enriched is not None:
            return IncidentResolution(
                enriched.event_type,
                enriched.coordinates(),
                analysis,
                enriched,
                "ai-precise",
            )

    coordinates = resolve_from_text(title, description, source_name)
    if coordinates is not None and coordinates[3].casefold() != coordinates[2].casefold():
        return IncidentResolution(
            event_type, coordinates, analysis, enriched, "text-precise",
        )

    run_ai()
    if enriched is not None:
        return IncidentResolution(
            enriched.event_type,
            enriched.coordinates(),
            analysis,
            enriched,
            "ai-precise",
        )

    return IncidentResolution(
        event_type,
        coordinates,
        analysis,
        None,
        "text-municipality" if coordinates else "unresolved",
    )
