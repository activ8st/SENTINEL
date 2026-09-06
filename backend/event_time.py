"""Extract only explicit event dates and times; never infer a missing day."""
import datetime as dt
import re


MONTHS = "gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre".split()


def extract_event_time(text, published_at, timezone):
    if published_at is None:
        return None
    published = published_at.replace(tzinfo=dt.UTC).astimezone(timezone)
    candidates = set()
    # Keep evidence in the same sentence and attached to an event predicate.
    for sentence in re.split(r"[!?;\n]|\.(?!\d)", text.lower()):
        event = re.search(
            r"\b(?:incidente|scontro|incendio|rogo|rapina|aggressione|furto|rissa|omicidio)"
            r"\s+(?:(?:si [eè] |[eè] )?(?:avvenut[oa]|verificat[oa]|accadut[oa]|scoppiat[oa]|divampat[oa])|alle|oggi|ieri|il)\b",
            sentence,
        )
        if not event:
            continue
        evidence = sentence[event.start():event.start() + 220]
        if re.search(r"\b(?:circa|verso|intorno|tra le|domani|previsto)\b", evidence):
            continue
        clocks = re.findall(r"\balle\s+(\d{1,2})[:.](\d{2})\b", evidence)
        if len(clocks) != 1:
            continue
        numeric = re.search(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b", evidence)
        written = re.search(r"\b(\d{1,2})\s+(" + "|".join(MONTHS) + r")\s+(\d{4})\b", evidence)
        try:
            if numeric:
                day, month, year = map(int, numeric.groups())
                date = dt.date(year, month, day)
            elif written:
                date = dt.date(int(written[3]), MONTHS.index(written[2]) + 1, int(written[1]))
            elif re.search(r"\boggi\b", evidence) and not re.search(r"\bieri\b", evidence):
                date = published.date()
            elif re.search(r"\bieri\b", evidence) and not re.search(r"\boggi\b", evidence):
                date = published.date() - dt.timedelta(days=1)
            else:
                continue
            hour, minute = map(int, clocks[0])
            local = dt.datetime.combine(date, dt.time(hour, minute), tzinfo=timezone)
            # Reject both missing and duplicated clock times at DST transitions.
            if local.replace(fold=0).utcoffset() != local.replace(fold=1).utcoffset():
                continue
            candidate = local.astimezone(dt.UTC).replace(tzinfo=None)
            if candidate <= published_at:
                candidates.add(candidate)
        except ValueError:
            continue
    return next(iter(candidates)) if len(candidates) == 1 else None
