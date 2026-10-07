import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app, otp_store, otp_rate_limits
from backend.database import Base, get_db, ensure_schema_compatibility
from backend.auth_utils import create_access_token, verify_access_token

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=test_engine)
    ensure_schema_compatibility(target_engine=test_engine)
    otp_store.clear()
    otp_rate_limits.clear()
    yield
    Base.metadata.drop_all(bind=test_engine)
    app.dependency_overrides.clear()

@pytest.fixture
def test_client():
    return TestClient(app)

def test_jwt_token_generation_and_verification():
    user_id = "usr-test-12345"
    token = create_access_token(user_id)
    assert token is not None
    assert len(token.split(".")) == 3

    verified_id = verify_access_token(token)
    assert verified_id == user_id

def test_invalid_jwt_token():
    assert verify_access_token("invalid.token.str") is None

def test_send_otp_demo_mode(test_client, monkeypatch):
    monkeypatch.setenv("SENTINEL_MODE", "demo")
    res = test_client.post("/api/auth/send-otp", json={"email": "pioniere@example.com"})
    assert res.status_code == 200
    data = res.json()
    assert "message" in data
    assert "expires_in" in data
    assert "demo_code" in data

def test_send_otp_pilot_mode_no_otp_leak(test_client, monkeypatch):
    monkeypatch.setenv("SENTINEL_MODE", "pilot")
    monkeypatch.setenv("RESEND_API_KEY", "test-resend-key")

    from backend import main
    monkeypatch.setattr(main, "send_resend_email", lambda to, subj, html: True)

    res = test_client.post("/api/auth/send-otp", json={"email": "pilot-user@example.com"})
    assert res.status_code == 200
    data = res.json()
    assert "message" in data
    assert "expires_in" in data
    assert "demo_code" not in data
    assert "otp" not in data

def test_signup_and_login_with_email_otp(test_client, monkeypatch):
    monkeypatch.setenv("SENTINEL_MODE", "demo")

    # 1. Send OTP
    send_res = test_client.post("/api/auth/send-otp", json={"email": "nuovo.pioniere@example.com"})
    assert send_res.status_code == 200
    demo_code = send_res.json()["demo_code"]

    # 2. Verify OTP with Onboarding Data (Signup)
    verify_res = test_client.post("/api/auth/verify-otp", json={
        "email": "nuovo.pioniere@example.com",
        "code": demo_code,
        "first_name": "Marco",
        "last_name": "Bianchi",
        "birth_year": 1990
    })
    assert verify_res.status_code == 200
    data = verify_res.json()
    assert data["status"] == "authenticated"
    assert "token" in data
    user = data["user"]
    assert user["first_name"] == "Marco"
    assert user["last_name"] == "Bianchi"
    assert user["email"] == "nuovo.pioniere@example.com"

    # 3. Authenticated GET /api/users/me using Bearer token
    token = data["token"]
    me_res = test_client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["id"] == user["id"]
    assert me_data["first_name"] == "Marco"

def test_unauthenticated_users_me_rejected(test_client, monkeypatch):
    monkeypatch.setenv("SENTINEL_MODE", "pilot")
    res = test_client.get("/api/users/me")
    assert res.status_code == 401

def test_invalid_token_users_me_rejected(test_client, monkeypatch):
    monkeypatch.setenv("SENTINEL_MODE", "pilot")
    res = test_client.get("/api/users/me", headers={"Authorization": "Bearer invalid-token-xyz"})
    assert res.status_code == 401

def test_verify_otp_incorrect_code(test_client, monkeypatch):
    monkeypatch.setenv("SENTINEL_MODE", "pilot")
    monkeypatch.setenv("RESEND_API_KEY", "test-key")
    from backend import main
    monkeypatch.setattr(main, "send_resend_email", lambda to, subj, html: True)

    test_client.post("/api/auth/send-otp", json={"email": "test-user@example.com"})

    res = test_client.post("/api/auth/verify-otp", json={
        "email": "test-user@example.com",
        "code": "000000"
    })
    assert res.status_code == 400
    assert "non corretto" in res.json()["detail"].lower()

def test_rate_limit_send_otp(test_client, monkeypatch):
    monkeypatch.setenv("SENTINEL_MODE", "demo")
    for _ in range(3):
        res = test_client.post("/api/auth/send-otp", json={"email": "rate@example.com"})
        assert res.status_code == 200

    # 4th attempt should be blocked by rate limit
    res_blocked = test_client.post("/api/auth/send-otp", json={"email": "rate@example.com"})
    assert res_blocked.status_code == 429
    assert "troppi tentativi" in res_blocked.json()["detail"].lower()
