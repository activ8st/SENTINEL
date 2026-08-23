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
from .moderation import moderate_user_report, ModerationAction
from sqlalchemy import text

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
    allow_origins=allowed_origins,
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
        user = models.User(id="user-1", name="User", karma=100, role="admin")
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
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id, models.Incident.status == "active").first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return attach_incident_metadata(incident)

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

# --- REAL EMAIL & OTP RESEND INTEGRATION ---

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")

def send_resend_email(to_email: str, subject: str, html_content: str):
    if not RESEND_API_KEY:
        print("[Resend] API Key missing.")
        return False
    try:
        import requests
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "SentinelApp/1.0"
        }
        payload = {
            "from": "Sentinel <onboarding@resend.dev>",
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        res = requests.post("https://api.resend.com/emails", headers=headers, json=payload, timeout=10)
        return res.status_code == 200
    except Exception as e:
        print(f"[Resend Error] {e}")
        return False

@app.post("/api/waitlist")
def handle_waitlist_signup(data: dict):
    email = data.get("email")
    city = data.get("city", "Milano")
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Email non valida.")

    html = f"""
    <div style="font-family: Arial, sans-serif; background-color: #050505; color: #ffffff; padding: 40px 20px; border-radius: 16px;">
      <div style="max-w: 600px; margin: 0 auto; background: #0c0c0c; border: 1px solid #333; padding: 30px; border-radius: 20px;">
        <h1 style="color: #10b981; font-size: 26px; margin-bottom: 10px;">Benvenuto in Sentinel! 🛡️</h1>
        <p style="font-size: 15px; color: #ccc; line-height: 1.6;">
          Hai iscritto con successo la tua città <strong>{city}</strong> e ti sei garantito il <strong>Founder Badge (+100 Punti Karma)</strong> per il primo giorno di lancio!
        </p>
        <div style="background: #10b98115; border: 1px solid #10b98140; padding: 15px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <span style="color: #10b981; font-weight: bold; font-size: 14px;">Stato Città: In Scalata Prioritaria su {city}</span>
        </div>
        <p style="font-size: 14px; color: #888;">
          Grazie per aver scelto di proteggere la tua serenità con dati reali e zero pregiudizi.
        </p>
      </div>
    </div>
    """
    success = send_resend_email(email, f"Benvenuto in Sentinel — Conferma Founder & Sblocco {city}", html)
    return {"success": success, "message": f"Email inviata a {email}"}

@app.post("/api/auth/send-otp")
def handle_send_otp(data: dict):
    email = data.get("email")
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Email non valida.")
    
    import random
    otp_code = str(random.randint(100000, 999999))

    html = f"""
    <div style="font-family: Arial, sans-serif; background-color: #050505; color: #ffffff; padding: 40px 20px;">
      <div style="max-w: 500px; margin: 0 auto; background: #0c0c0c; border: 1px solid #333; padding: 30px; border-radius: 20px; text-align: center;">
        <h2 style="color: #10b981; margin-bottom: 10px;">Il tuo codice di verifica Sentinel</h2>
        <p style="color: #aaa; font-size: 14px;">Inserisci questo codice a 6 cifre per completare l'accesso sicuro:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #10b981; background: #111; padding: 15px; border-radius: 12px; margin: 25px 0; border: 1px border #10b981;">
          {otp_code}
        </div>
        <p style="color: #666; font-size: 12px;">Il codice scade tra 10 minuti. Non condividerlo con nessuno.</p>
      </div>
    </div>
    """
    success = send_resend_email(email, f"Codice OTP Sentinel: {otp_code}", html)
    return {"success": success, "otp": otp_code}

@app.post("/api/contact")
def handle_contact_submit(data: dict):
    name = data.get("name", "Utente")
    email = data.get("email", "")
    message = data.get("message", "")
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Email non valida.")

    admin_html = f"""
    <div style="font-family: Arial, sans-serif; background-color: #050505; color: #ffffff; padding: 40px 20px;">
      <div style="max-w: 600px; margin: 0 auto; background: #0c0c0c; border: 1px solid #333; padding: 30px; border-radius: 20px;">
        <h2 style="color: #10b981; margin-bottom: 10px;">Nuovo Messaggio da {name} 📩</h2>
        <p style="color: #aaa; font-size: 14px;"><strong>Email Mittente:</strong> {email}</p>
        <div style="background: #111; border: 1px solid #333; padding: 20px; border-radius: 12px; margin: 20px 0; color: #fff;">
          {message}
        </div>
      </div>
    </div>
    """
    send_resend_email("sentinelappsecurity@gmail.com", f"Nuovo Messaggio Contatti da {name}", admin_html)
    
    user_html = f"""
    <div style="font-family: Arial, sans-serif; background-color: #050505; color: #ffffff; padding: 40px 20px;">
      <div style="max-w: 600px; margin: 0 auto; background: #0c0c0c; border: 1px solid #333; padding: 30px; border-radius: 20px;">
        <h2 style="color: #10b981; margin-bottom: 10px;">Abbiamo ricevuto il tuo messaggio! 🛡️</h2>
        <p style="color: #ccc; font-size: 14px; line-height: 1.6;">Ciao <strong>{name}</strong>,<br>grazie per aver contattato Sentinel. Il nostro team ha preso in carico la tua richiesta e ti risponderà al più presto su questo indirizzo.</p>
      </div>
    </div>
    """
    send_resend_email(email, "Conferma Ricezione Messaggio — Sentinel", user_html)
    return {"success": True, "message": "Messaggio inviato con successo."}


