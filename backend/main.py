from fastapi import FastAPI, Depends, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import datetime
import os
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import threading

# Helper function to load .env if python-dotenv is not installed
def load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ.setdefault(key.strip(), value.strip())

load_env_file()

ADMIN_SECRET_KEY = os.environ.get("ADMIN_SECRET_KEY")
if not ADMIN_SECRET_KEY:
    raise RuntimeError(
        "ADMIN_SECRET_KEY non impostata. Imposta questa variabile "
        "d'ambiente prima di avviare il server (vedi .env.example)."
    )

from . import models, schemas
from .database import engine, get_db
from .moderation import moderate_user_report, ModerationAction
from sqlalchemy import text

models.Base.metadata.create_all(bind=engine)

# Auto-migrate SQLite schema additions if needed
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user'"))
        conn.commit()
    except Exception:
        pass

# In-memory IP Rate Limiting (5 requests / 60 seconds per IP)
ip_rate_limits = {}

def check_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = datetime.datetime.utcnow().timestamp()
    timestamps = ip_rate_limits.get(client_ip, [])
    timestamps = [ts for ts in timestamps if now - ts < 60]
    if len(timestamps) >= 5:
        raise HTTPException(
            status_code=429,
            detail="Troppe segnalazioni inviate in poco tempo. Riprova tra 1 minuto."
        )
    timestamps.append(now)
    ip_rate_limits[client_ip] = timestamps

def verify_admin_key(x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key")):
    if not x_admin_key:
        raise HTTPException(status_code=401, detail="Header X-Admin-Key mancante.")
    if x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Chiave Admin non valida.")

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
    scheduler.add_job(run_scraper_in_background, 'interval', minutes=15)
    scheduler.start()
    run_scraper_in_background()
    yield
    scheduler.shutdown()

app = FastAPI(title="Sentinel API", version="1.0.0", lifespan=lifespan)

# Configurazione CORS (Environment Aware)
allowed_origins_raw = os.environ.get("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in allowed_origins_raw.split(",")] if allowed_origins_raw != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Mock
@app.get("/api/users/me", response_model=schemas.User)
def get_current_user(db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == "user-1").first()
    if not user:
        user = models.User(id="user-1", name="User", karma=100, role="admin")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@app.get("/api/incidents", response_model=List[schemas.Incident])
def get_incidents(skip: int = 0, limit: int = 500, db: Session = Depends(get_db)):
    # ONLY return incidents with status == 'active'
    incidents = db.query(models.Incident).filter(models.Incident.status == "active").offset(skip).limit(limit).all()
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
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id, models.Incident.status == "active").first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incidente non trovato o in attesa di moderazione.")
    incident.media_urls = [m.url for m in incident.media]
    return incident

@app.post("/api/incidents", response_model=schemas.Incident)
def create_incident(request: Request, incident: schemas.IncidentCreate, db: Session = Depends(get_db)):
    check_rate_limit(request)

    # Moderate report text
    combined_text = f"{incident.title} {incident.description}".strip()
    mod_result = moderate_user_report(combined_text)

    # Log BLOCK and FLAG_FOR_REVIEW to Audit Log
    if mod_result.action in (ModerationAction.BLOCK, ModerationAction.FLAG_FOR_REVIEW):
        audit = models.ModerationAuditLog(
            user_id=incident.reported_by_id or "anonymous",
            action=mod_result.action.value.upper(),
            reason=mod_result.reason,
            text=combined_text[:500],
            timestamp=datetime.datetime.utcnow()
        )
        db.add(audit)
        db.commit()

    if mod_result.action == ModerationAction.BLOCK:
        raise HTTPException(status_code=400, detail=mod_result.reason)

    initial_status = "pending_review" if mod_result.action == ModerationAction.FLAG_FOR_REVIEW else incident.status

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
        status=initial_status,
        reported_by_id=incident.reported_by_id,
        reporter_karma=incident.reporter_karma,
        created_date=datetime.datetime.utcnow()
    )
    db.add(db_incident)
    
    if incident.media_urls:
        for url in incident.media_urls:
            db_media = models.Media(url=url, type="image", incident_id=incident.id)
            db.add(db_media)
            
    db.commit()
    db.refresh(db_incident)
    db_incident.media_urls = incident.media_urls if initial_status == "active" else []
    return db_incident

@app.post("/api/incidents/user-report", response_model=schemas.Incident)
def create_user_incident(request: Request, incident: schemas.IncidentCreate, db: Session = Depends(get_db)):
    check_rate_limit(request)

    user = db.query(models.User).filter(models.User.id == "user-1").first()
    if not user:
        user = models.User(id="user-1", name="User", karma=100)
        db.add(user)
        db.commit()
        db.refresh(user)

    if user.is_read_only:
        raise HTTPException(status_code=403, detail="Account in modalità Read-Only a causa di ripetute Fake News.")

    combined_text = f"{incident.title} {incident.description}".strip()
    mod_result = moderate_user_report(combined_text)

    if mod_result.action in (ModerationAction.BLOCK, ModerationAction.FLAG_FOR_REVIEW):
        audit = models.ModerationAuditLog(
            user_id=user.id,
            action=mod_result.action.value.upper(),
            reason=mod_result.reason,
            text=combined_text[:500],
            timestamp=datetime.datetime.utcnow()
        )
        db.add(audit)
        db.commit()

    if mod_result.action == ModerationAction.BLOCK:
        raise HTTPException(status_code=400, detail=mod_result.reason)

    initial_status = "pending_review" if mod_result.action == ModerationAction.FLAG_FOR_REVIEW else "active"

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
        status=initial_status,
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
    db_incident.media_urls = incident.media_urls if initial_status == "active" else []
    return db_incident

@app.patch("/api/incidents/{incident_id}/vote")
def vote_incident(incident_id: str, upvote: bool, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    user = db.query(models.User).filter(models.User.id == incident.reported_by_id).first()
    if user:
        if upvote:
            user.karma += 5
        else:
            user.karma -= 2
        db.commit()
        
    return {"success": True}

@app.post("/api/incidents/{incident_id}/report-fake")
def report_fake_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident.fake_votes += 1
    
    if incident.reported_by_id:
        user = db.query(models.User).filter(models.User.id == incident.reported_by_id).first()
        if user:
            if incident.fake_votes >= 2:
                user.strikes += 1
                if user.strikes >= 2:
                    user.is_read_only = True
                
    db.commit()
    return {"success": True, "fake_votes": incident.fake_votes}

# --- ADMIN ENDPOINTS (Protected by X-Admin-Key) ---

@app.get("/api/admin/pending-reviews", response_model=List[schemas.Incident], dependencies=[Depends(verify_admin_key)])
def get_pending_reviews(db: Session = Depends(get_db)):
    incidents = db.query(models.Incident).filter(models.Incident.status == "pending_review").all()
    for inc in incidents:
        inc.media_urls = [m.url for m in inc.media]
    return incidents

@app.post("/api/admin/incidents/{incident_id}/approve", dependencies=[Depends(verify_admin_key)])
def approve_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incidente non trovato")
    incident.status = "active"
    db.commit()
    return {"success": True, "message": "Incidente approvato e reso pubblico."}

@app.post("/api/admin/incidents/{incident_id}/reject", dependencies=[Depends(verify_admin_key)])
def reject_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incidente non trovato")
    incident.status = "rejected"
    db.commit()
    return {"success": True, "message": "Incidente scartato."}
