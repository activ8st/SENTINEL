"""
Test suite per l'aggiornamento Sentinel MVP (FASE 10 & 11)
Verifica il nuovo contratto dati, gli endpoint di salute, la sicurezza OTP in pilot/production,
l'assenza di rotte duplicate e i vincoli di moderazione.
"""

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.database import Base, get_db
import backend.main as main_module
from backend.main import app
from backend import models, schemas
from backend.moderation import evaluate_report_for_moderation, ModerationAction

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

# 1. Test Nuovo Contratto Dati Incident
def test_incident_data_contract_fields():
    db = TestingSessionLocal()
    inc = models.Incident(
        id="test-inc-1",
        type="crime",
        title="Tentato furto in centro a Cesena",
        description="Segnalazione di attività sospetta presso negozio.",
        severity="medium",
        latitude=44.1391,
        longitude=12.2432,
        address="Corso Cavour, Cesena",
        city="Cesena",
        status="active",
        verification_status="verified",
        confidence_score=0.85,
        source_type="user",
        source_url="https://sentinel.app/evidence/1",
        source="user"
    )
    db.add(inc)
    db.commit()

    saved = db.query(models.Incident).filter_by(id="test-inc-1").first()
    assert saved is not None
    assert saved.verification_status == "verified"
    assert saved.confidence_score == 0.85
    assert saved.source_type == "user"
    assert saved.source_url == "https://sentinel.app/evidence/1"
    assert saved.city == "Cesena"
    db.close()

# 2. Test Health Check Endpoint
def test_public_health_returns_version_and_database():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "Sentinel API"
    assert data["version"] == "1.0.0-mvp"
    assert data["database"] == "connected"
    assert "total_incidents" in data
    assert "ADMIN_SECRET_KEY" not in str(data)

# 3. Test OTP 1234 Rejected in Pilot Mode
def test_otp_1234_rejected_in_pilot_mode():
    os.environ["SENTINEL_MODE"] = "pilot"
    target = "user-pilot@sentinel.app"
    
    # Verification with code '1234' without a valid OTP session in pilot mode MUST fail
    verify_resp = client.post("/api/auth/verify-otp", json={"email": target, "code": "1234"})
    assert verify_resp.status_code == 400
    assert "Nessun codice OTP inviato" in verify_resp.json()["detail"] or "non corretto" in verify_resp.json()["detail"]

# 4. Test OTP Demo Accepted ONLY in Demo Mode
def test_otp_demo_accepted_only_in_demo_mode():
    os.environ["SENTINEL_MODE"] = "demo"
    target = "user-demo@sentinel.app"
    
    verify_resp = client.post("/api/auth/verify-otp", json={"email": target, "code": "1234"})
    assert verify_resp.status_code == 200
    assert verify_resp.json()["status"] == "authenticated"

# 5. Test send-otp Fails When Provider Is Not Configured
def test_send_otp_fails_when_provider_not_configured():
    os.environ["SENTINEL_MODE"] = "pilot"
    old_key = main_module.RESEND_API_KEY
    main_module.RESEND_API_KEY = None
    try:
        res = client.post("/api/auth/send-otp", json={"email": "pilot-user@sentinel.app"})
        assert res.status_code == 503
        assert "RESEND_API_KEY" in res.json()["detail"] or "non configurato" in res.json()["detail"]
    finally:
        main_module.RESEND_API_KEY = old_key

# 6. Test No Duplicate Routes
def test_no_duplicate_routes():
    send_otp_routes = [r for r in app.routes if getattr(r, "path", None) == "/api/auth/send-otp"]
    assert len(send_otp_routes) == 1, f"Found duplicate /api/auth/send-otp routes: {len(send_otp_routes)}"

# 7. Test Moderation Evaluation & Admin Endpoints
def test_moderation_evaluation_and_admin_endpoints():
    clean_res = evaluate_report_for_moderation("Incendio boschivo", "Fumo alto vicino a Cesena", has_media=False)
    assert clean_res.action == ModerationAction.ALLOW

    media_res = evaluate_report_for_moderation("Incendio boschivo", "Fumo alto vicino a Cesena", has_media=True)
    assert media_res.action == ModerationAction.FLAG_FOR_REVIEW

    block_res = evaluate_report_for_moderation("Allerta", "Zona piena di marocchini evitate", has_media=False)
    assert block_res.action == ModerationAction.BLOCK

    main_module.ADMIN_SECRET_KEY = "test-secret-key"
    try:
        db = TestingSessionLocal()
        inc = models.Incident(
            id="pending-1",
            type="fire",
            title="Segnalazione in attesa",
            description="Foto allegata da verificare",
            severity="high",
            latitude=44.1391,
            longitude=12.2432,
            address="Via Emilia, Cesena",
            city="Cesena",
            status="pending_review",
            verification_status="pending_review"
        )
        db.add(inc)
        db.commit()
        db.close()

        pending_resp = client.get("/api/admin/pending-incidents", headers={"X-Admin-Key": "test-secret-key"})
        assert pending_resp.status_code == 200
        pending_list = pending_resp.json()
        assert len(pending_list) == 1
        assert pending_list[0]["id"] == "pending-1"

        mod_resp = client.post(
            "/api/admin/moderate-incident",
            headers={"X-Admin-Key": "test-secret-key"},
            json={"incident_id": "pending-1", "action": "approve", "reason": "Verificato da operatore"}
        )
        assert mod_resp.status_code == 200
        assert mod_resp.json()["status"] == "active"
    finally:
        main_module.ADMIN_SECRET_KEY = None
