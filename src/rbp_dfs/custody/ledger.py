"""
Chain of Custody Module (Module 15).
Implements a tamper-evident, append-oriented audit ledger
with cryptographic SHA-256 hash chaining between records.
"""

import hashlib
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional


class CustodyEntry:
    def __init__(
        self,
        event_id: str,
        case_id: str,
        evidence_id: str,
        action: str,
        examiner: str,
        notes: str,
        prev_hash: str,
        timestamp_utc: Optional[str] = None,
    ):
        self.event_id = event_id
        self.case_id = case_id
        self.evidence_id = evidence_id
        self.action = action
        self.examiner = examiner
        self.notes = notes
        self.prev_hash = prev_hash
        self.timestamp_utc = timestamp_utc or datetime.now(timezone.utc).isoformat()
        self.entry_hash = self.compute_hash()

    def compute_hash(self) -> str:
        payload = f"{self.event_id}:{self.case_id}:{self.evidence_id}:{self.action}:{self.examiner}:{self.timestamp_utc}:{self.notes}:{self.prev_hash}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "case_id": self.case_id,
            "evidence_id": self.evidence_id,
            "action": self.action,
            "examiner": self.examiner,
            "notes": self.notes,
            "timestamp_utc": self.timestamp_utc,
            "prev_hash": self.prev_hash,
            "entry_hash": self.entry_hash,
        }


class CustodyLedger:
    GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

    def __init__(self, ledger_file: Optional[Path] = None):
        self.ledger_file = ledger_file
        self.entries: List[CustodyEntry] = []
        if ledger_file and ledger_file.exists():
            self.load()

    def add_entry(
        self,
        case_id: str,
        evidence_id: str,
        action: str,
        examiner: str,
        notes: str,
    ) -> CustodyEntry:
        prev_hash = self.entries[-1].entry_hash if self.entries else self.GENESIS_HASH
        event_id = f"COC-{int(time.time() * 1000)}-{len(self.entries) + 1:04d}"
        entry = CustodyEntry(
            event_id=event_id,
            case_id=case_id,
            evidence_id=evidence_id,
            action=action,
            examiner=examiner,
            notes=notes,
            prev_hash=prev_hash,
        )
        self.entries.append(entry)
        if self.ledger_file:
            self.save()
        return entry

    def verify_integrity(self) -> Dict[str, Any]:
        """Validates all cryptographic hashes and chain links in the ledger."""
        if not self.entries:
            return {"valid": True, "count": 0, "message": "Ledger is empty"}

        expected_prev = self.GENESIS_HASH
        for idx, entry in enumerate(self.entries):
            if entry.prev_hash != expected_prev:
                return {
                    "valid": False,
                    "tamper_detected_at_index": idx,
                    "event_id": entry.event_id,
                    "reason": "Previous hash link mismatch (chain broken)",
                }
            recomputed = entry.compute_hash()
            if entry.entry_hash != recomputed:
                return {
                    "valid": False,
                    "tamper_detected_at_index": idx,
                    "event_id": entry.event_id,
                    "reason": "Entry hash corrupted or altered",
                }
            expected_prev = entry.entry_hash

        return {
            "valid": True,
            "count": len(self.entries),
            "latest_hash": self.entries[-1].entry_hash,
            "message": "Chain of custody integrity fully verified",
        }

    def save(self):
        if self.ledger_file:
            with open(self.ledger_file, "w", encoding="utf-8") as f:
                json.dump([e.to_dict() for e in self.entries], f, indent=2)

    def load(self):
        if self.ledger_file and self.ledger_file.exists():
            with open(self.ledger_file, "r", encoding="utf-8") as f:
                raw = json.load(f)
                self.entries = []
                for item in raw:
                    entry = CustodyEntry(
                        event_id=item["event_id"],
                        case_id=item["case_id"],
                        evidence_id=item["evidence_id"],
                        action=item["action"],
                        examiner=item["examiner"],
                        notes=item["notes"],
                        prev_hash=item["prev_hash"],
                        timestamp_utc=item["timestamp_utc"],
                    )
                    self.entries.append(entry)
