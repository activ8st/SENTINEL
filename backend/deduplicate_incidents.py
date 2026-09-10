from __future__ import annotations

import argparse

from backend.database import SessionLocal
from backend.fetch_live_incidents import cleanup_duplicate_incidents
from backend.models import Incident


def deduplicate_all(db) -> dict[str, int]:
    before = db.query(Incident).count()
    removed = 0
    passes = 0

    while True:
        removed_in_pass = cleanup_duplicate_incidents(db)
        db.flush()
        passes += 1
        removed += removed_in_pass
        if removed_in_pass == 0:
            break

    return {
        "events_before": before,
        "events_after": before - removed,
        "duplicates_removed": removed,
        "passes": passes,
    }


def main(*, dry_run: bool = False) -> dict[str, int]:
    db = SessionLocal()
    try:
        result = deduplicate_all(db)
        if dry_run:
            db.rollback()
        else:
            db.commit()
        mode = "Analisi" if dry_run else "Pulizia"
        print(f"{mode} duplicati completata")
        print(f"Eventi prima: {result['events_before']}")
        print(f"Duplicati trovati: {result['duplicates_removed']}")
        print(f"Eventi dopo: {result['events_after']}")
        return result
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Unisce gli eventi duplicati di Sentinel.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Conta i duplicati senza modificare il database.",
    )
    args = parser.parse_args()
    main(dry_run=args.dry_run)
