from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uuid
import datetime
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import threading

from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

def run_scraper_in_background():
    try:
        from .fetch_live_incidents import main as fetch_live_incidents_main
        thread = threading.Thread(target=fetch_live_incidents_main)
        thread.start()
    except Exception as e:
        print(f"Failed to start scraper: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = AsyncIOScheduler()
    # Run every 15 minutes
    scheduler.add_job(run_scraper_in_background, 'interval', minutes=15)
    scheduler.start()
    
    # Run once immediately at startup
    run_scraper_in_background()
    
    yield
    scheduler.shutdown()

app = FastAPI(title="Sentinel API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Mock
@app.get("/api/users/me", response_model=schemas.User)
def get_current_user(db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == "user-1").first()
    if not user:
        user = models.User(id="user-1", name="User", karma=100)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@app.get("/api/incidents", response_model=List[schemas.Incident])
def get_incidents(skip: int = 0, limit: int = 500, db: Session = Depends(get_db)):
    incidents = db.query(models.Incident).offset(skip).limit(limit).all()
    # Map media objects to media_urls string list for the frontend
    for inc in incidents:
        inc.media_urls = [m.url for m in inc.media]
    return incidents

@app.post("/api/incidents/refresh")
def refresh_incidents():
    try:
        from .fetch_live_incidents import main as fetch_live_incidents

        return fetch_live_incidents()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@app.get("/api/incidents/{incident_id}", response_model=schemas.Incident)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    incident.media_urls = [m.url for m in incident.media]
    return incident

@app.post("/api/incidents", response_model=schemas.Incident)
def create_incident(incident: schemas.IncidentCreate, db: Session = Depends(get_db)):
    db_incident = models.Incident(
        id=incident.id,
        type=incident.type,
        title=incident.title,
        description=incident.description,
        severity=incident.severity,
        latitude=incident.latitude,
        longitude=incident.longitude,
        address=incident.address,
        city=incident.city,
        status=incident.status,
        reported_by_id=incident.reported_by_id,
        reporter_karma=incident.reporter_karma,
        created_date=datetime.datetime.utcnow()
    )
    db.add(db_incident)
    
    # Process Media
    if incident.media_urls:
        for url in incident.media_urls:
            db_media = models.Media(url=url, type="image", incident_id=incident.id)
            db.add(db_media)
            
    db.commit()
    db.refresh(db_incident)
    db_incident.media_urls = incident.media_urls
    return db_incident

@app.patch("/api/incidents/{incident_id}/vote")
def vote_incident(incident_id: str, upvote: bool, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Basic logic: update user karma based on votes
    user = db.query(models.User).filter(models.User.id == incident.reported_by_id).first()
    if user:
        if upvote:
            user.karma += 5
        else:
            user.karma -= 2
        db.commit()
        
    return {"success": True}

@app.post("/api/incidents/user-report", response_model=schemas.Incident)
def create_user_incident(incident: schemas.IncidentCreate, db: Session = Depends(get_db)):
    # Get current user (mocked as user-1 for now)
    user = db.query(models.User).filter(models.User.id == "user-1").first()
    if not user:
        user = models.User(id="user-1", name="User", karma=100)
        db.add(user)
        db.commit()
        db.refresh(user)

    if user.is_read_only:
        raise HTTPException(status_code=403, detail="Account in modalità Read-Only a causa di ripetute Fake News.")

    new_id = str(uuid.uuid4())
    
    db_incident = models.Incident(
        id=new_id,
        type=incident.type,
        title=incident.title,
        description=incident.description,
        severity=incident.severity,
        latitude=incident.latitude,
        longitude=incident.longitude,
        address=incident.address,
        city=incident.city,
        status="active",
        reported_by_id=user.id,
        reporter_karma=user.karma,
        created_date=datetime.datetime.utcnow(),
        source="user",
        source_trust="user_reported"
    )
    db.add(db_incident)
    
    if incident.media_urls:
        for url in incident.media_urls:
            db_media = models.Media(url=url, type="image", incident_id=new_id)
            db.add(db_media)
            
    db.commit()
    db.refresh(db_incident)
    db_incident.media_urls = incident.media_urls
    return db_incident

@app.post("/api/incidents/{incident_id}/report-fake")
def report_fake_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Increment fake votes
    incident.fake_votes += 1
    
    # If reported by a user, manage their strikes
    if incident.reported_by_id:
        user = db.query(models.User).filter(models.User.id == incident.reported_by_id).first()
        if user:
            # Fake news confirmation happens at 2 votes for simplicity in this demo
            if incident.fake_votes >= 2:
                user.strikes += 1
                if user.strikes >= 2:
                    user.is_read_only = True
                
    db.commit()
    return {"success": True, "fake_votes": incident.fake_votes}
