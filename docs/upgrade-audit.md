# Audit e Strategia di Aggiornamento MVP — Sentinel

## 1. Stato Attuale dell'Applicazione
L'applicazione **Sentinel** è un prototipo full-stack ibrido basato su:
- **Frontend**: React (Vite) con Tailwind CSS, Mapbox GL JS 3D, Dexie.js (IndexedDB), Framer Motion e Lucide Icons.
- **Backend**: FastAPI con SQLAlchemy, SQLite, Pydantic v2 e web scraper RSS/INGV/giornali locali.

### Punti Critici Rilevati:
1. **Dati Mock e Inizializzazione**: `src/lib/db.js` pulisce e ripopola automaticamente IndexedDB con `MOCK_INCIDENTS` all'avvio, sovrascrivendo e confondendo i feed reali in produzione.
2. **Provenienza e Trasparenza Dati**: Manzano campi strutturati per tracciare la provenienza (`data_origin`, `verification_status`, `source_label`, `source_url`, `freshness_status`).
3. **Flusso Autenticazione (OTP)**: Il login frontend genera un OTP demo visualizzato direttamente a schermo senza chiamare il backend in produzione.
4. **Protezione Rotte**: Le rotte principali dell'applicazione non sono protette in modo uniforme da `ProtectedRoute`.
5. **Segnalazioni Utente e Moderazione**: Le segnalazioni con contenuti sensibili o media dovrebbero andare in `pending_review` prima di apparire nella mappa pubblica.
6. **Posizionamento GPS e Notifiche**: Le notifiche in zona e i badge devono rispettare rigorosamente il raggio reale dell'utente (entro 15km) e l'area pilota di Cesena / Forlì-Cesena / Emilia-Romagna.

---

## 2. Esito dell'Audit per File

| File | Stato Attuale | Interventi Necessari | Rischio Regressivo |
|---|---|---|---|
| `src/lib/db.js` | Popola sempre `MOCK_INCIDENTS` pulendo IndexedDB | Disabilitare pulizia e seeding automatico in modalità `production`/`pilot` | Basso (nessuna rottura schema) |
| `src/lib/liveSyncEngine.js` | Sincronizza notizie ed eventi utente in LocalStorage | Aggiungere metadati di provenienza (`data_origin`, `verification_status`, `source_label`, `source_url`, `freshness_status`) e supporto `VITE_APP_MODE` | Medio (verificare isolamento cache) |
| `src/lib/sentinelApi.js` | Connette l'API backend con timeout a 3s | Esporre lo stato di connessione UI (Backend live, RSS fallback, Cache, Offline) | Basso |
| `src/pages/IncidentDetail.jsx` | Cerca incidente in cache, poi mock statici | Mostrare badge `DEMO` esplicito solo se `APP_MODE === 'demo'`. Niente fallback silenzioso a mock in produzione | Basso |
| `src/pages/Auth.jsx` | Login con OTP simulato client-side e toast col codice | Integrare chiamate API backend per OTP vero (`/api/auth/send-otp`, `/api/auth/verify-otp`) senza OTP in chiaro nei toast in prod/pilot | Medio |
| `src/lib/AuthContext.jsx` | Stato auth gestito in memoria | Persistere token/sessione e supportare verifica reale | Medio |
| `backend/models.py` & `backend/schemas.py` | Schema `Incident` essenziale | Estendere campi per veridicità, provenienza e stati estesi (`active`, `monitoring`, `pending_review`, `resolved`, `rejected`, `archived`) | Medio (garantire compatibilità SQLite) |
| `backend/main.py` | Endpoint `/api/incidents`, `/api/health` basilare | Arricchire `/api/health` con diagnostica non sensibile, aggiungere OTP e endpoint moderazione admin | Medio |
| `backend/moderation.py` | Filtro etnico/generalizzazioni | Collegare con flag `pending_review` ed esporre endpoint admin di approvazione/rigetto | Basso |

---

## 3. Strategia di Modifica per Fase

1. **FASE 1**: Introduzione di `VITE_APP_MODE` (`demo` \| `production` \| `pilot`), blocco seeding mock in prod/pilot, badge DEMO visibile nei dettagli.
2. **FASE 2**: Estensione modelli e schemi backend per data contract unico (provenienza, status estesi, confidence score).
3. **FASE 3**: Integrazione stato connessione API e health check arricchito. Documentazione deployment.
4. **FASE 4**: Flusso OTP reale nel backend e integrazione nel frontend senza leak di codice in chiaro.
5. **FASE 5**: Protezione uniforme delle rotte applicative.
6. **FASE 6**: Form segnalazioni con disclaimer di emergenza 112 e passaggio forzato a `pending_review` per media/contenuti sensibili.
7. **FASE 7**: Workflow di moderazione e pannello admin protetto da `X-Admin-Key`.
8. **FASE 8**: Provenienza e trasparenza UI, notifiche ricalibrate su raggio GPS reale utente (15km).
9. **FASE 9**: Bonifica linting, rimozione import inutilizzati, correzione hook condizionali.
10. **FASE 10**: Suite test automatizzati Pytest.
11. **FASE 11**: Aggiornamento documentazione finale (`README.md`, `data-provenance.md`, `privacy-and-media.md`, `pilot-cesena.md`).

---

## 4. Rischi Regressivi e Mitigazioni
- **Rischio**: Rottura delle query Mapbox o dei marker 3D se cambiano i campi `latitude` / `longitude`.
  - *Mitigazione*: I campi geografici mantengono i tipi numerici `float` e fallbacks sicuri.
- **Rischio**: Incompatibilità DB SQLite esistente con i nuovi campi del modello `Incident`.
  - *Mitigazione*: Usare `ensure_schema_compatibility()` in `backend/database.py` per aggiungere colonne mancanti senza distruggere i dati.
- **Rischio**: Blocco build frontend per linting o import falliti.
  - *Mitigazione*: Eseguire `npm run lint`, `npm run build` e `pytest` ad ogni fase.
