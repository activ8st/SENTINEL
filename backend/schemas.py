from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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
    media_urls: Optional[List[str]] = []
    
    # Bot tracking fields
    source: Optional[str] = None
    source_trust: Optional[str] = "institutional"
    last_seen_at: Optional[datetime] = None

class IncidentCreate(IncidentBase):
    pass

class Incident(IncidentBase):
    created_date: datetime
    # we remap media objects to media_urls for the frontend
    
    class Config:
        from_attributes = True
