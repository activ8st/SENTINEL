from backend.database import SessionLocal
from backend.models import Incident, User, Media
import datetime

db = SessionLocal()

MOCK_INCIDENTS = [
  {
    "id": "inc-001",
    "title": "Incendio in appartamento – Via Tiburtina",
    "description": "Fiamme visibili al terzo piano di un edificio residenziale. I vigili del fuoco sono intervenuti, area circostante temporaneamente chiusa al traffico.",
    "type": "fire",
    "severity": "high",
    "status": "active",
    "latitude": 41.9109,
    "longitude": 12.5150,
    "address": "Via Tiburtina 234",
    "city": "Roma",
    "reported_by_id": "user-2",
    "reporter_karma": 850
  },
  {
    "id": "inc-002",
    "title": "Rapina a mano armata – Farmacia Appia",
    "description": "Due individui con cappucci hanno rapinato la farmacia. Un passante ha chiamato il 112. Polizia arrivata sul posto in 4 minuti.",
    "type": "crime",
    "severity": "critical",
    "status": "active",
    "latitude": 41.8919,
    "longitude": 12.5113,
    "address": "Via Appia Nuova 89",
    "city": "Roma",
    "reported_by_id": "user-3",
    "reporter_karma": 420
  },
  {
    "id": "inc-003",
    "title": "Tamponamento multiplo – Viale Aventino",
    "description": "Coinvolti 4 veicoli, traffico bloccato in direzione centro. Ambulanze sul posto, nessun ferito grave.",
    "type": "accident",
    "severity": "medium",
    "status": "active",
    "latitude": 41.8842,
    "longitude": 12.4944,
    "address": "Viale Aventino",
    "city": "Roma",
    "reported_by_id": "user-4",
    "reporter_karma": 120
  },
  {
    "id": "inc-004",
    "title": "Malore grave – Stazione Termini",
    "description": "Uomo di circa 65 anni trovato a terra nei pressi del binario 5. Il 118 è intervenuto prontamente.",
    "type": "medical",
    "severity": "high",
    "status": "monitoring",
    "latitude": 41.9001,
    "longitude": 12.5028,
    "address": "Stazione Termini",
    "city": "Roma",
    "reported_by_id": "user-5",
    "reporter_karma": 50
  },
  {
    "id": "inc-005",
    "title": "Furto biciclette – P.za della Repubblica",
    "description": "Tre uomini visti tagliare catene di biciclette nel parcheggio. Si sono allontanati prima dell'arrivo delle forze dell'ordine.",
    "type": "suspicious",
    "severity": "low",
    "status": "resolved",
    "latitude": 41.9029,
    "longitude": 12.4963,
    "address": "Piazza della Repubblica",
    "city": "Roma",
    "reported_by_id": "user-6",
    "reporter_karma": 210
  },
  {
    "id": "inc-006",
    "title": "Allerta meteo – Piogge intense su Roma",
    "description": "Precipitazioni abbondanti in corso. Allagamenti segnalati in zona Ostiense e Prati. Evitare i sottopassi.",
    "type": "weather",
    "severity": "medium",
    "status": "active",
    "latitude": 41.9150,
    "longitude": 12.4700,
    "address": "Centro storico",
    "city": "Roma",
    "reported_by_id": "user-7",
    "reporter_karma": 95
  },
  {
    "id": "inc-007",
    "title": "Manifestazione – Piazza Venezia verso Colosseo",
    "description": "Corteo in corso da Piazza Venezia verso il Colosseo. Deviazioni attive su Via dei Fori Imperiali.",
    "type": "traffic",
    "severity": "low",
    "status": "active",
    "latitude": 41.8955,
    "longitude": 12.4823,
    "address": "Piazza Venezia",
    "city": "Roma",
    "reported_by_id": "user-8",
    "reporter_karma": 330
  },
  {
    "id": "inc-008",
    "title": "Principio d'incendio – Ristorante Trastevere",
    "description": "Fumo dal retrocucina. Locale evacuato precauzionalmente. Intervento dei VVF concluso senza danni gravi.",
    "type": "fire",
    "severity": "medium",
    "status": "resolved",
    "latitude": 41.8894,
    "longitude": 12.4699,
    "address": "Via del Corso 112",
    "city": "Roma",
    "reported_by_id": "user-9",
    "reporter_karma": 65
  },
  {
    "id": "inc-009",
    "title": "Persona priva di sensi – Villa Borghese",
    "description": "Donna trovata priva di sensi vicino alla fontana centrale. Ambulanza allertata. Condizioni stabili.",
    "type": "medical",
    "severity": "high",
    "status": "monitoring",
    "latitude": 41.9142,
    "longitude": 12.4922,
    "address": "Villa Borghese",
    "city": "Roma",
    "reported_by_id": "user-10",
    "reporter_karma": 115
  },
  {
    "id": "inc-010",
    "title": "Borseggi in metro – Linea A Spagna",
    "description": "Gruppo di borseggiatrici segnalate sulla linea A tra Barberini e Spagna. Attenzione ai beni personali.",
    "type": "crime",
    "severity": "medium",
    "status": "active",
    "latitude": 41.9062,
    "longitude": 12.4838,
    "address": "Metro Linea A – Zona Spagna",
    "city": "Roma",
    "reported_by_id": "user-11",
    "reporter_karma": 270
  }
]

for inc in MOCK_INCIDENTS:
    if not db.query(Incident).filter_by(id=inc["id"]).first():
        db_inc = Incident(
            id=inc["id"],
            type=inc["type"],
            title=inc["title"],
            description=inc["description"],
            severity=inc["severity"],
            latitude=inc["latitude"],
            longitude=inc["longitude"],
            address=inc["address"],
            city=inc["city"],
            status=inc["status"],
            reported_by_id=inc["reported_by_id"],
            reporter_karma=inc["reporter_karma"],
            created_date=datetime.datetime.utcnow()
        )
        db.add(db_inc)

db.commit()
print("Database seeded with exactly 10 mock incidents.")
db.close()
