# Progetto Pilota Locale — Cesena / Forlì-Cesena / Emilia-Romagna

## 1. Obiettivo e Perimetro del Pilota
Il progetto pilota di **Sentinel** concentra il proprio raggio di azione sull'area di **Cesena**, la provincia di **Forlì-Cesena** e la regione **Emilia-Romagna**.

L'obiettivo è dimostrare l'affidabilità di un sistema di allerta territoriale ad alta precisione geografica, evitando di promettere coperture nazionali non ancora verificate.

---

## 2. Configurazione Geografica Pilota

- **Centro Pilota**: Cesena (Latitudine: `44.1391`, Longitudine: `12.2432`).
- **Raggio Geofencing di Notifica**: 15 km dalla posizione fisica reale dell'utente.
- **Comuni Focus Principali**:
  - Cesena
  - Forlì
  - Cesenatico
  - Savignano sul Rubicone
  - Gambettola
  - Ravenna
  - Rimini
  - Bologna

---

## 3. Fonti Ingestione e Cronaca Locale

L'ingestore backend (`backend/fetch_live_incidents.py`) raccoglie in tempo reale:
1. **INGV (Istituto Nazionale di Geofisica e Vulcanologia)**: Terremoti ed eventi sismici in Emilia-Romagna.
2. **Cronaca Locale e Feed Regionali**: Notizie ed allerte meteo/traffico/protezione civile per la provincia di Forlì-Cesena.
3. **Crowdsourcing Cittadino**: Segnalazioni inviate direttamente dalla community locale con verifica GPS e moderazione preventiva dei media.

---

## 4. Modalità di Avvio Pilota Locale

Per eseguire l'applicazione in modalità pilota:

```env
# Frontend .env
VITE_APP_MODE=pilot
```

```env
# Backend .env
SENTINEL_MODE=pilot
```

L'avvio del server e del frontend posizionerà la mappa e le notifiche predefinite su Cesena e sul territorio circostante.
