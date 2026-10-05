# Guida al Deployment e Configurazione Locale — Sentinel MVP

## 1. Architettura ed Ambienti (`VITE_APP_MODE` e `SENTINEL_MODE`)

Sentinel supporta 3 modalità di esecuzione gestite tramite variabili d'ambiente:

1. **`demo`**: Modalità dimostrativa con dati mock statici e badge `DEMO` visibile.
2. **`production`**: Modalità di produzione standard con ingestione in tempo reale e autenticazione OTP backend reale.
3. **`pilot`** *(Predefinito per il Lancio Locale)*: Perimetro pilota locale focalizzato su **Cesena / Forlì-Cesena / Emilia-Romagna**.

---

## 2. Variabili d'Ambiente Obbligatorie per il Deployment

### Backend su Render (Environment Variables)

Configurare le seguenti chiavi nel pannello di Render (Dashboard -> Environment Variables):

| Variabile | Valore Raccomandato | Descrizione |
|---|---|---|
| `SENTINEL_MODE` | `pilot` | Attiva la modalità pilota su Cesena ed inibisce codici OTP mock. |
| `ADMIN_SECRET_KEY` | *(Secret Key generata)* | Chiave d'accesso per accedere agli endpoint protetti `/api/admin/*`. |
| `RESEND_API_KEY` | `re_...` | Chiave API Resend per l'invio reale delle mail con codice OTP. |
| `DATABASE_URL` | `sqlite:///./sentinel.db` | Percorso DB SQLite o stringa di connessione PostgreSQL. |
| `SENTINEL_AUTO_REFRESH_MINUTES` | `15` | Intervallo in minuti per il refresh automatico dei feed di cronaca. |
| `SENTINEL_AUTO_REFRESH_ENABLED` | `true` | Attiva/disattiva l'aggiornamento automatico in background. |

### Frontend su Vercel (Environment Variables)

Configurare le seguenti chiavi nel pannello di Vercel (Project Settings -> Environment Variables):

| Variabile | Valore Raccomandato | Descrizione |
|---|---|---|
| `VITE_APP_MODE` | `pilot` | Imposta la modalità frontend a pilota (nessun seeding mock automatico). |
| `VITE_API_URL` | `https://sentinel-api-6hlm.onrender.com` | URL pubblico del backend FastAPI registrato su Render. |

---

## 3. Avvio Locale per lo Sviluppo

### Backend (FastAPI)
```powershell
$env:PYTHONPATH="."
$env:SENTINEL_MODE="pilot"
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend (Vite)
```powershell
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

## 5. Verifiche di Salute e Diagnostica (Endpoint Pubblico)

Per verificare lo stato operativo dell'API senza esporre credenziali o chiavi segrete:
```http
GET https://sentinel-api-6hlm.onrender.com/api/health
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
  "last_refresh": "2026-10-05T12:00:00Z"
}
```
