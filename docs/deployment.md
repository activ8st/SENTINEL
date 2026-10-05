# Guida al Deployment e Configurazione Locale — Sentinel MVP

## 1. Architettura ed Ambienti (`VITE_APP_MODE` e `SENTINEL_MODE`)

Sentinel supporta 3 modalità di esecuzione gestite tramite variabili d'ambiente:

1. **`demo`**: Modalità dimostrativa con dati mock statici e badge `DEMO` visibile.
2. **`production`**: Modalità di produzione standard con ingestione in tempo reale e autenticazione OTP backend.
3. **`pilot`** *(Predefinito)*: Perimetro pilota locale focalizzato su Cesena / Forlì-Cesena / Emilia-Romagna.

---

## 2. Variabili d'Ambiente

### Frontend (`.env` o `.env.local`)
```env
# Modalità applicazione: 'production' | 'pilot' | 'demo'
VITE_APP_MODE=pilot

# URL del backend FastAPI (lasciare vuoto per fallback in dev a 127.0.0.1:8000)
VITE_API_URL=http://127.0.0.1:8000
```

### Backend (`.env` backend)
```env
# Modalità backend: 'pilot' | 'production' | 'demo'
SENTINEL_MODE=pilot

# Database SQLite / PostgreSQL
DATABASE_URL=sqlite:///./sentinel.db

# Chiave segreta per gli endpoint amministrativi (moderazione)
ADMIN_SECRET_KEY=super-secret-admin-key-change-me

# Frequenza aggiornamento feed automatico (in minuti)
SENTINEL_AUTO_REFRESH_MINUTES=15
SENTINEL_AUTO_REFRESH_ENABLED=true
```

---

## 3. Avvio in Sviluppo Locale

### Backend (FastAPI)
```powershell
# Dalla radice del progetto
$env:PYTHONPATH="."
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend (Vite)
```powershell
# Dalla radice del progetto
npm install
npm run dev
```

Il frontend sarà disponibile su `http://localhost:5173`.

---

## 4. Inizializzazione Database e Ingestione Notizie Reali

Il backend crea automaticamente le tabelle SQLite all'avvio ed esegue la migrazione compatibile delle colonne tramite `ensure_schema_compatibility()`.

Per avviare l'ingestione manuale delle notizie live dall'Emilia-Romagna:
```powershell
$env:PYTHONPATH="."
python -m backend.fetch_live_incidents
```

---

## 5. Verifiche di Salute e Diagnostica

Per verificare lo stato operativo dell'API senza esporre credenziali:
```http
GET http://127.0.0.1:8000/api/health
```

**Esempio di Risposta JSON**:
```json
{
  "status": "ok",
  "app": "Sentinel API",
  "version": "1.0.0-mvp",
  "mode": "pilot",
  "database": "connected",
  "total_incidents": 42,
  "auto_refresh": true,
  "last_refresh": "2026-10-05T09:30:00Z"
}
```
