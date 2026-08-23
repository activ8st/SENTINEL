import asyncio
import datetime
import os
import re
import threading
import uuid
from contextlib import asynccontextmanager, suppress
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, selectinload

from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

AUTO_REFRESH_MINUTES = max(5, int(os.getenv("SENTINEL_AUTO_REFRESH_MINUTES", "15")))
_refresh_lock = threading.Lock()
_refresh_state = {
    "running": False,
    "last_started_at": None,
    "last_finished_at": None,
    "last_error": None,
    "last_result": None,
}


def run_incident_refresh() -> dict:
    if not _refresh_lock.acquire(blocking=False):
        return {"status": "already_running", **_refresh_state}

    _refresh_state.update(
        running=True,
        last_started_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        last_error=None,
    )
    try:
        from .fetch_live_incidents import main as fetch_live_incidents

        result = fetch_live_incidents()
        _refresh_state["last_result"] = result
        return {"status": "completed", **result}
    except Exception as exc:
        _refresh_state["last_error"] = str(exc)
        raise
    finally:
        _refresh_state.update(
            running=False,
            last_finished_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        )
        _refresh_lock.release()


async def automatic_incident_refresh() -> None:
    await asyncio.sleep(2)
    while True:
        try:
            await asyncio.to_thread(run_incident_refresh)
        except Exception as exc:
            print(f"Aggiornamento automatico notizie fallito: {exc}")
        await asyncio.sleep(AUTO_REFRESH_MINUTES * 60)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    refresh_task = asyncio.create_task(automatic_incident_refresh())
    try:
        yield
    finally:
        refresh_task.cancel()
        with suppress(asyncio.CancelledError):
            await refresh_task


app = FastAPI(title="Sentinel API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



def incident_in_allowed_area(incident: models.Incident) -> bool:
    try:
        from .fetch_live_incidents import is_allowed_area

        return is_allowed_area(incident.city or "", float(incident.latitude), float(incident.longitude))
    except Exception:
        return False


def attach_incident_metadata(incident: models.Incident) -> models.Incident:
    incident.media_urls = [media.url for media in incident.media]
    match = re.search(
        r"\bFonte:\s*(.+?)\.\s+Localizzazione:",
        incident.description or "",
        flags=re.I,
    )
    incident.source_label = match.group(1).strip() if match else incident.source
    return incident

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
def get_incidents(skip: int = 0, limit: int = 2000, db: Session = Depends(get_db)):
    safe_limit = min(max(limit, 1), 5000)
    all_incidents = (
        db.query(models.Incident)
        .options(selectinload(models.Incident.media))
        .order_by(models.Incident.created_date.desc())
        .all()
    )
    incidents = [inc for inc in all_incidents if incident_in_allowed_area(inc)][skip:skip + safe_limit]
    for inc in incidents:
        attach_incident_metadata(inc)
    return incidents

@app.post("/api/incidents/refresh")
async def refresh_incidents():
    try:
        return await asyncio.to_thread(run_incident_refresh)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/incidents/refresh/status")
def refresh_incidents_status():
    return {
        **_refresh_state,
        "interval_minutes": AUTO_REFRESH_MINUTES,
    }

@app.get("/api/incidents/{incident_id}", response_model=schemas.Incident)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return attach_incident_metadata(incident)

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
