"""
Moderazione contenuti discriminatori nelle segnalazioni utente (crowdsourcing).

Policy (vedi anche il documento policy_moderazione.md per la versione
discorsiva):

  LIVELLO 1 - BLOCCO AUTOMATICO (mai pubblicato, nemmeno in pending_review):
    Generalizzazioni che associano una zona/orario alla presenza di un
    gruppo etnico/nazionale/religioso come motivo di pericolo, SENZA
    descrivere un evento specifico verificabile.
    Es: "occhio in giro ci sono tanti rom", "zona piena di marocchini
    la sera evitate".

  LIVELLO 2 - SEMPRE IN REVISIONE UMANA (mai pubblicazione automatica):
    Qualsiasi segnalazione che menziona etnia/nazionalità/religione,
    ANCHE dentro la descrizione di un evento specifico. Non blocchiamo
    a priori (potrebbe essere una descrizione legittima di un fatto
    realmente accaduto), ma non lasciamo mai passare in automatico.

Questo modulo si applica al flusso di crowdsourcing (segnalazioni dirette
degli utenti), in aggiunta - non in sostituzione - del filtro sui nomi
propri gia' presente in cronaca_rss.py (che serve a un problema diverso:
li' e' copyright/diffamazione su fonti giornalistiche, qui e'
discriminazione su contenuto generato dagli utenti).
"""

import re
from dataclasses import dataclass
from enum import Enum


class ModerationAction(Enum):
    ALLOW = "allow"                  # pubblicazione diretta consentita
    FLAG_FOR_REVIEW = "flag_for_review"  # va in pending_review, mai automatico
    BLOCK = "block"                  # scartato, mai pubblicato in nessuna forma


@dataclass
class ModerationResult:
    action: ModerationAction
    reason: str


# Termini che indicano etnia/nazionalita'/religione (forma neutra e forma
# comunemente usata in modo dispregiativo). La presenza di uno di questi
# termini NON blocca da sola: fa scattare come minimo il Livello 2
# (revisione umana). Lista non esaustiva per costruzione: nuovi termini
# vanno aggiunti se emergono in fase di moderazione manuale.
#
# Ogni entry e' (pattern, is_stem). is_stem=True significa "termine +
# eventuali suffissi di genere/plurale" (es. "marocchin" -> marocchino/a/i/e),
# costruito come \b<termine>\w*\b. is_stem=False significa "solo questa
# parola esatta", usato per termini corti che altrimenti darebbero falsi
# positivi su parole comuni (es. "rom" e' un prefisso di "Roma", "romantico",
# "romanzo": qui vogliamo SOLO la parola "rom" isolata).
_ETHNICITY_NATIONALITY_RELIGION_TERMS = [
    ("marocchin", True), ("rom", False), ("sint", True), ("zingar", True),
    ("nomad", True), ("albanes", True), ("romen", True), ("rumen", True),
    ("extracomunitar", True), ("immigrat", True), ("clandestin", True),
    ("musulman", True), ("arab", True), ("african", True),
    ("nigerian", True), ("senegales", True), ("tunisin", True),
    ("egizian", True), ("cinese", False), ("cinesi", False),
    ("asiatic", True), ("sudamerican", True), ("ebre", True),
    ("ebraic", True), ("nordafrican", True), ("centrafrican", True),
    ("sudafrican", True), ("est.?europe", True),
]

# Parole/espressioni che, combinate con un termine etnico/nazionale/
# religioso, indicano una GENERALIZZAZIONE su zona/gruppo (non un evento
# specifico) -> Livello 1, blocco automatico.
_GENERALIZATION_MARKERS = [
    r"pien[ao] di", r"gir[ao] di", r"tant[ei] ", r"sempre ", r"tutt[ei] ",
    r"evita(te|re)?", r"attenzione (a|ai|alle)", r"occhio (a|ai|alle)",
    r"zona (di|piena|infestata)", r"invas[ao]", r"orde di",
]

_ethnicity_alternatives = [
    rf"\b{term}\w*\b" if is_stem else rf"\b{term}\b"
    for term, is_stem in _ETHNICITY_NATIONALITY_RELIGION_TERMS
]
_ETHNICITY_PATTERN = re.compile("|".join(_ethnicity_alternatives), re.IGNORECASE)
_GENERALIZATION_PATTERN = re.compile(
    "|".join(_GENERALIZATION_MARKERS), re.IGNORECASE,
)


def moderate_user_report(text: str) -> ModerationResult:
    """
    Analizza il testo di una segnalazione utente (titolo + descrizione
    concatenati) e ritorna l'azione di moderazione da applicare.

    Questo e' un filtro a pattern, non un classificatore semantico: e'
    una rete di sicurezza automatica, non sostituisce una vera policy
    di moderazione umana per i casi ambigui - per questo il default in
    caso di dubbio e' FLAG_FOR_REVIEW, mai ALLOW.
    """
    if not _ETHNICITY_PATTERN.search(text):
        # Nessun riferimento etnico/nazionale/religioso rilevato:
        # nessuna azione di moderazione da questo modulo (altri filtri,
        # es. linguaggio violento/minaccioso, restano fuori scope qui).
        return ModerationResult(
            action=ModerationAction.ALLOW,
            reason="Nessun riferimento etnico/nazionale/religioso rilevato.",
        )

    if _GENERALIZATION_PATTERN.search(text):
        return ModerationResult(
            action=ModerationAction.BLOCK,
            reason=(
                "Rilevata generalizzazione su zona/gruppo associata a "
                "etnia/nazionalita'/religione - violazione policy, "
                "contenuto scartato."
            ),
        )

    # Riferimento etnico presente ma senza marker di generalizzazione:
    # potrebbe essere la descrizione legittima di un evento specifico.
    # Non pubblichiamo comunque in automatico - va sempre a revisione.
    return ModerationResult(
        action=ModerationAction.FLAG_FOR_REVIEW,
        reason=(
            "Rilevato riferimento a etnia/nazionalita'/religione "
            "all'interno del testo - richiede revisione umana prima "
            "della pubblicazione, indipendentemente dal contesto."
        ),
    )
