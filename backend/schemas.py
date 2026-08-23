from pydantic import BaseModel, field_serializer
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

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    id: str
    name: str
    karma: int = 100
    strikes: int = 0
    is_read_only: bool = False

class UserCreate(UserBase):
    pass

class User(UserBase):
    class Config:
        from_attributes = True

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
    status: str = "active"
    reported_by_id: Optional[str] = None
    reporter_karma: int = 0
    fake_votes: int = 0
    media_urls: Optional[List[str]] = []
    
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

    @field_serializer("created_date", "last_seen_at", when_used="json")
    def serialize_utc_datetime(self, value: Optional[datetime]) -> Optional[str]:
        if value is None:
            return None
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    
    class Config:
        from_attributes = True
