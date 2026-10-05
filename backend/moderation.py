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
propri gia' presente in cronaca_rss.py.
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
    """
    if not _ETHNICITY_PATTERN.search(text):
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

    return ModerationResult(
        action=ModerationAction.FLAG_FOR_REVIEW,
        reason=(
            "Rilevato riferimento a etnia/nazionalita'/religione "
            "all'interno del testo - richiede revisione umana prima "
            "della pubblicazione."
        ),
    )


def evaluate_report_for_moderation(title: str, description: str, has_media: bool = False) -> ModerationResult:
    """
    Valuta sia il testo che gli allegati media per determinare se la segnalazione
    può essere pubblicata direttamente, va in pending_review o viene bloccata.
    """
    text = f"{title or ''} {description or ''}".strip()
    result = moderate_user_report(text)
    if result.action == ModerationAction.BLOCK:
        return result

    if has_media:
        return ModerationResult(
            action=ModerationAction.FLAG_FOR_REVIEW,
            reason="Segnalazione contenente file media: richiede revisione umana prima della pubblicazione."
        )

    return result
