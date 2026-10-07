import base64
import hashlib
import hmac
import json
import os
import re
import time
from typing import Optional

JWT_SECRET_KEY = (
    os.getenv("JWT_SECRET_KEY")
    or os.getenv("ADMIN_SECRET_KEY")
    or "sentinel-mvp-jwt-secret-key-production-change"
)


def normalize_email(email: Optional[str]) -> Optional[str]:
    if not email:
        return None
    cleaned = email.strip().lower()
    return cleaned if "@" in cleaned and "." in cleaned else None


def normalize_phone(phone: Optional[str]) -> Optional[str]:
    if not phone:
        return None
    cleaned = re.sub(r"[^\d+]", "", phone.strip())
    if not cleaned.startswith("+"):
        # Assume Italian default if + is missing
        if cleaned.startswith("39") and len(cleaned) >= 11:
            cleaned = "+" + cleaned
        else:
            cleaned = "+39" + cleaned.lstrip("0")
    return cleaned if len(cleaned) >= 8 else None


def create_access_token(user_id: str, expires_delta: int = 86400 * 30) -> str:
    """Generate standard HS256 JWT token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "iat": int(time.time()),
        "exp": int(time.time()) + expires_delta,
    }

    header_b64 = (
        base64.urlsafe_b64encode(json.dumps(header).encode()).rstrip(b"=").decode()
    )
    payload_b64 = (
        base64.urlsafe_b64encode(json.dumps(payload).encode()).rstrip(b"=").decode()
    )
    signature_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(
        JWT_SECRET_KEY.encode(), signature_input, hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=").decode()

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def verify_access_token(token: str) -> Optional[str]:
    """Verify HS256 JWT token and return user_id (sub) or None."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts

        signature_input = f"{header_b64}.{payload_b64}".encode()
        expected_sig = hmac.new(
            JWT_SECRET_KEY.encode(), signature_input, hashlib.sha256
        ).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).rstrip(b"=").decode()

        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None

        padding = "=" * (4 - (len(payload_b64) % 4))
        payload_bytes = base64.urlsafe_b64decode(payload_b64 + padding)
        payload = json.loads(payload_bytes.decode())

        if payload.get("exp") and time.time() > payload["exp"]:
            return None

        return payload.get("sub")
    except Exception:
        return None
