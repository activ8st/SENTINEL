"""
Test suite for FASE 1 & FASE 3: Community Reports Cross-Device Consistency & Server-Side Moderation Rules.
"""

import uuid
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_valid_post_and_subsequent_get_cross_device():
    """Verify POST incident returns valid ID and is visible in GET /api/incidents."""
    incident_id = f"inc-test-cd-{uuid.uuid4().hex[:8]}"
    payload = {
        "id": incident_id,
        "type": "traffic",
        "title": "Lavori stradali in via Emilia",
        "description": "Corsia destra chiusa al traffico per manutenzione urgente.",
        "severity": "medium",
        "latitude": 44.1391,
        "longitude": 12.2432,
        "address": "Via Emilia, Cesena",
        "city": "Cesena",
        "status": "active",
        "media_urls": []
    }
    post_res = client.post("/api/incidents", json=payload)
    assert post_res.status_code == 200, post_res.text
    created = post_res.json()
    assert created["id"] == incident_id
    assert created["status"] == "active"

    # Subsequent GET /api/incidents (Device B perspective)
    get_res = client.get("/api/incidents?limit=2000")
    assert get_res.status_code == 200
    incidents = get_res.json()
    found = [i for i in incidents if i["id"] == incident_id]
    assert len(found) == 1, "Created incident must be present in GET /api/incidents"
    assert found[0]["title"] == payload["title"]

def test_media_and_critical_severity_forced_to_pending_review():
    """Client sending status=active with media or critical severity must be forced to pending_review server-side."""
    media_id = f"inc-test-media-{uuid.uuid4().hex[:8]}"
    crit_id = f"inc-test-crit-{uuid.uuid4().hex[:8]}"

    # Test 1: Media attached
    payload_media = {
        "id": media_id,
        "type": "accident",
        "title": "Incidente in tangenziale",
        "description": "Coinvolte due autovetture.",
        "severity": "medium",
        "latitude": 45.4642,
        "longitude": 9.1900,
        "address": "Tangenziale Ovest, Milano",
        "city": "Milano",
        "status": "active", # Client attempts to bypass
        "media_urls": ["https://example.com/photo.jpg"]
    }
    res_media = client.post("/api/incidents", json=payload_media)
    assert res_media.status_code == 200
    created_media = res_media.json()
    assert created_media["status"] == "pending_review", "Server must force pending_review when media is attached"

    # Test 2: Critical severity
    payload_critical = {
        "id": crit_id,
        "type": "fire",
        "title": "Incendio boschivo",
        "description": "Fiamme visibili dalla statale.",
        "severity": "critical",
        "latitude": 41.9028,
        "longitude": 12.4964,
        "address": "Via Appia, Roma",
        "city": "Roma",
        "status": "active", # Client attempts to bypass
        "media_urls": []
    }
    res_crit = client.post("/api/incidents", json=payload_critical)
    assert res_crit.status_code == 200
    created_crit = res_crit.json()
    assert created_crit["status"] == "pending_review", "Server must force pending_review for critical severity"

    # Public GET /api/incidents must NOT return pending_review items
    get_res = client.get("/api/incidents")
    incidents = get_res.json()
    ids = [i["id"] for i in incidents]
    assert media_id not in ids, "pending_review items must be excluded from public feed"
    assert crit_id not in ids, "pending_review items must be excluded from public feed"

def test_blocked_content_returns_400():
    """Discriminatory/hate generalization text must be rejected with HTTP 400 and not published."""
    block_id = f"inc-test-block-{uuid.uuid4().hex[:8]}"
    payload_hate = {
        "id": block_id,
        "type": "suspicious",
        "title": "Attenzione in zona pieno di rom",
        "description": "Zona piena di rom la sera evitate",
        "severity": "medium",
        "latitude": 44.1391,
        "longitude": 12.2432,
        "address": "Cesena",
        "city": "Cesena",
        "status": "active",
        "media_urls": []
    }
    res = client.post("/api/incidents", json=payload_hate)
    assert res.status_code == 400, "Discriminatory hate text must return HTTP 400"
    assert "violazione policy" in res.json()["detail"].lower() or "scartato" in res.json()["detail"].lower()

    # Verify NOT present in public GET
    get_res = client.get("/api/incidents")
    ids = [i["id"] for i in get_res.json()]
    assert block_id not in ids
