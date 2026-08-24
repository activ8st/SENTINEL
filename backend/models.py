from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    karma = Column(Integer, default=100)
    strikes = Column(Integer, default=0)
    is_read_only = Column(Boolean, default=False)
    role = Column(String, default="user")

class Incident(Base):
    __tablename__ = "incidents"
    __table_args__ = (
        UniqueConstraint("source", "source_event_id", name="uq_source_event"),
    )

    id = Column(String, primary_key=True, index=True)
    type = Column(String, index=True)
    title = Column(String)
    description = Column(String)
    severity = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(String)
    city = Column(String)
    status = Column(String, default="active")
    created_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Bot tracking fields
    source = Column(String, nullable=True) # "ingv", "user", etc.
    source_event_id = Column(String, nullable=True)
    source_trust = Column(String, nullable=True, default="institutional")
    last_seen_at = Column(DateTime, default=datetime.datetime.utcnow)

    reported_by_id = Column(String, ForeignKey("users.id"))
    reporter_karma = Column(Integer, default=0)
    fake_votes = Column(Integer, default=0)

    media = relationship("Media", back_populates="incident", cascade="all, delete-orphan")

class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"))
    url = Column(String)
    type = Column(String) # 'image', 'video', 'live'
    
    incident = relationship("Incident", back_populates="media")

class ModerationAuditLog(Base):
    __tablename__ = "moderation_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=True)
    action = Column(String, index=True) # "BLOCK", "FLAG_FOR_REVIEW"
    reason = Column(String)
    text = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
