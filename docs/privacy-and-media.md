# Policy Privacy, Moderazione e Gestione Media — Sentinel MVP

## 1. Compliance GDPR (Regolamento UE 2016/679)

Sentinel è progettata secondo i principi di **Privacy by Design** e **Privacy by Default**:
- **Geolocalizzazione**: Rilevata ed elaborata esclusivamente lato client per calcolare le distanze e perimetrare il geofencing (15km). La posizione fisica esatta dell'utente non viene salvata permanentemente sui server senza consenso.
- **Trattamento Dati Personali**: Basato sul consenso (Art. 6.1.a GDPR) e sul legittimo interesse di pubblica sicurezza (Art. 6.1.f GDPR).
- **Diritti dell'Interessato**: Gli utenti possono richiedere la cancellazione dei propri dati inviando una richiesta a `privacy@sentinel.app`.

---

## 2. Disclaimer di Emergenza (Non Sostituzione dei Soccorsi)

Sentinel è una piattaforma di consapevolezza partecipata e **NON sostituisce i numeri di emergenza nazionali ed europei**:
> ⚠️ In caso di pericolo immediato, lesioni, incendi o reati in corso, **chiama immediatamente il 112 (Numero Unico Europeo), il 115 (Vigili del Fuoco) o il 118 (Emergenza Sanitaria)**.

Tutti i moduli di segnalazione (`/Report`) richiedono la conferma obbligatoria di questa presa di visione prima di consentire l'invio.

---

## 3. Policy di Moderazione Media e Contenuti

Per prevenire abusi, allarmismo ingiustificato o diffusione di Fake News:

1. **Moderazione Testuale Automatica (`backend/moderation.py`)**:
   - **Livello 1 (Blocco Automatico)**: Generali affermazioni discriminatorie o incitamento all'odio legate ad etnie/religioni senza evento specifico. La segnalazione viene bloccata immediatamente.
   - **Livello 2 (Revisione Umana)**: Menziomamento di etnia o gruppi all'interno di un fatto di cronaca. La segnalazione viene posizionata in `pending_review`.

2. **Moderazione dei File Media (Foto/Video)**:
   - Qualsiasi segnalazione inoltrata con file multimediali allegati acquisisce automaticamente lo stato `pending_review`.
   - I file non vengono trasmessi al feed pubblico principale finché un operatore umano non approva la segnalazione tramite l'endpoint protetto `/api/admin/moderate-incident`.
