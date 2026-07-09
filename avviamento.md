# Guida all'Avviamento di Sentinel

Questa è la guida rapida per riaccendere l'app Sentinel (Frontend + Backend) ogni volta che riavvii il PC o VS Code.
Niente panico: sono solo due passaggi!

Avrai bisogno di **due terminali aperti** in VS Code (puoi aprirne uno nuovo cliccando sul simbolo `+` nel pannello del terminale in basso).

---

## 1. Accendere il Cervello (Backend Python)

Nel **primo terminale**, dobbiamo avviare il server Python che gestisce il database (la nostra API sulla porta 8000).

1. Attiva l'ambiente virtuale (ti apparirà `(venv)` all'inizio della riga):
   ```powershell
   .\backend\venv\Scripts\Activate.ps1
   ```

2. Avvia il server:
   ```powershell
   uvicorn backend.main:app --reload --port 8000
   ```
*(Nota: lascia questa finestra del terminale aperta e funzionante in background).*

---

## 2. Accendere la Facciata (Frontend React)

Nel **secondo terminale**, dobbiamo avviare l'interfaccia grafica (il sito web Vite).

1. Assicurati di essere nella cartella principale del progetto e digita:
   ```powershell
   npm run dev
   ```

2. Clicca sul link che appare nel terminale (di solito `http://localhost:5173`) tenendo premuto `CTRL` per aprire Sentinel nel browser.

---

### FAQ e Risoluzione Problemi
- **Vedo 0 incidenti sulla mappa**: Assicurati che il terminale del Backend (il primo) sia acceso e non ci siano errori.
- **Ho modificato il codice Python e non vedo i cambiamenti**: Hai usato `--reload`? Se sì, si aggiorna da solo. Altrimenti, premi `CTRL+C` nel terminale Python per fermarlo e riavvialo con la freccia su.
- **Come fermo tutto?**: Premi `CTRL+C` all'interno di entrambi i terminali.
