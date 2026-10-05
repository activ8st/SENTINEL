# Architettura e Tracciabilità dei Dati (Data Provenance) — Sentinel

## 1. Principi Guida
Sentinel garantisce la massima trasparenza e veridicità delle informazioni mostrate sulla mappa e nel feed delle allerte. Nessun dato viene presentato come verifica ufficiale senza una chiara tracciabilità della fonte originale.

---

## 2. Campi Strutturati di Provenienza

Ogni incidente gestito dal backend e consumato dall'interfaccia utente contiene i seguenti metadati di provenienza:

| Campo | Tipo | Valori Ammessi | Descrizione |
|---|---|---|---|
| `data_origin` | String | `official_feed` \| `rss` \| `user_community` \| `demo` | Identifica il canale primario di acquisizione del dato. |
| `verification_status` | String | `official` \| `verified` \| `unverified` \| `user_submitted` \| `pending_review` \| `rejected` | Stato del processo di verifica del dato. |
| `source_label` | String | Es. "Vigili del Fuoco", "INGV", "Resto del Carlino", "Segnalazione Utente" | Etichetta leggibile mostrata sulla UI. |
| `source_url` | String | URL HTTP/HTTPS | Link diretto alla notizia o al documento di origine. |
| `confidence_score` | Float | 0.0 - 1.0 | Punteggio di affidabilità calcolato dal sistema o assegnato in moderazione. |
| `freshness_status` | String | `live` (<=6h) \| `recent` (<=48h) \| `archived` (>48h) | Indicatore di freschezza temporale dell'evento. |

---

## 3. Stati Operativi degli Incidenti (`status`)

- **`active`**: Evento confermato o notizia di cronaca in corso visibile sulla mappa pubblica.
- **`monitoring`**: Evento seguito dalle autorità competenti o in fase di monitoraggio continuo.
- **`pending_review`**: Segnalazione inviata da un utente con allegati foto/video o contenuti sensibili, in attesa di moderazione manuale.
- **`resolved`**: Evento terminato o pericolo rientrato.
- **`rejected`**: Segnalazione scartata dai moderatori in quanto inattendibile o violazione della policy.
- **`archived`**: Evento storico archiviato per analisi.

---

## 4. Trasparenza per l'Utente Finale

Nell'interfaccia utente (`IncidentCard`, `IncidentDetail`, `MapView`), la provenienza è segnalata tramite badge visivi dedicati:
- 🛡️ **Fonte Ufficiale** (Verde): Fonti istituzionali (Vigili del Fuoco, INGV, Protezione Civile).
- ⚠️ **In Revisione** (Giallo/Amber): Segnalazioni utente contenenti media in attesa di approvazione.
- ⚠️ **DEMO** (Amber/Mono): Eventi simulati visibili solo in modalità `VITE_APP_MODE=demo`.
