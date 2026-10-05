from pydantic import BaseModel, ConfigDict, field_serializer
from typing import List, Optional
from datetime import datetime, timezone

class MediaBase(BaseModel):
    url: str
    type: str = "image"

class MediaCreate(MediaBase):
    pass

class Media(MediaBase):
    id: int
    incident_id: str

    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    id: str
    name: str
    karma: int = 100
    strikes: int = 0
    is_read_only: bool = False
    role: str = "user"

class UserCreate(UserBase):
    pass

class User(UserBase):
    model_config = ConfigDict(from_attributes=True)

class OTPSendRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    phone: str
    code: str

class ModerateIncidentRequest(BaseModel):
    incident_id: str
    action: str  # "approve" | "reject"
    reason: Optional[str] = None



class IncidentBase(BaseModel):
    id: str
    type: str
    title: str
    description: str
    severity: str
    latitude: float
    longitude: float
    address: str
    city: str
    location_precision: str = "unknown"
    location_evidence: Optional[str] = None
    status: str = "active" # active, monitoring, pending_review, resolved, rejected, archived
    reported_by_id: Optional[str] = None
    reporter_karma: int = 0
    fake_votes: int = 0
    media_urls: Optional[List[str]] = []
    
    # Provenance and Data Verification Fields
    verification_status: Optional[str] = "unverified"
    confidence_score: Optional[float] = 0.5
    source_type: Optional[str] = "rss"
    source_url: Optional[str] = None
    published_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    resolution_reason: Optional[str] = None
    last_verified_at: Optional[datetime] = None

    # Bot tracking fields
    source: Optional[str] = None
    source_label: Optional[str] = None
    source_trust: Optional[str] = "institutional"
    last_seen_at: Optional[datetime] = None

class IncidentCreate(IncidentBase):
    pass

class Incident(IncidentBase):
    created_date: datetime
    # we remap media objects to media_urls for the frontend

    @field_serializer("created_date", "last_seen_at", "published_at", "updated_at", "resolved_at", "last_verified_at", when_used="json")
    def serialize_utc_datetime(self, value: Optional[datetime]) -> Optional[str]:
        if value is None:
            return None
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    
    model_config = ConfigDict(from_attributes=True)
