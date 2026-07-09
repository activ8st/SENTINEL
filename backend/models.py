from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    karma = Column(Integer, default=100)

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

    # For media, we can store it as a JSON string for simplicity, or in a separate table.
    # Let's use a separate table for cleaner relational mapping
    media = relationship("Media", back_populates="incident", cascade="all, delete-orphan")

class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"))
    url = Column(String)
    type = Column(String) # 'image', 'video', 'live'
    
    incident = relationship("Incident", back_populates="media")
