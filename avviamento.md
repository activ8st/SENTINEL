# Avvio di Sentinel

Servono due terminali aperti nella cartella principale del progetto:

```powershell
cd C:\Users\matte\OneDrive\Desktop\SENTINEL
```

## 1. Backend

Nel primo terminale esegui:

```powershell
.\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Non e necessario attivare prima il venv. Lascia il terminale aperto dopo il messaggio
`Application startup complete`. La ricerca delle notizie parte automaticamente e si
ripete ogni 15 minuti.

## 2. Frontend

Nel secondo terminale esegui:

```powershell
npm run dev
```

Apri l'indirizzo mostrato da Vite, normalmente `http://localhost:5173`.

## Controllo rapido

- API backend: `http://127.0.0.1:8000/docs`
- Stato ricerca: `http://127.0.0.1:8000/api/incidents/refresh/status`
- Per fermare un processo, premi `Ctrl+C` nel relativo terminale.
