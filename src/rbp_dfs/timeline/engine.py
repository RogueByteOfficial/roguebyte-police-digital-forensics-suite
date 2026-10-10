"""
Investigation Timeline Engine (Module 11).
Normalizes timestamps, preserves original time strings and timezones,
computes UTC offsets, and links events directly to source artifacts.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import re


class TimelineEvent:
    def __init__(
        self,
        event_id: str,
        case_id: str,
        evidence_id: str,
        category: str,  # "MESSAGE", "CALL", "BROWSER", "SYSTEM_LOG", "FILE_SYSTEM", "EXIF_MEDIA"
        source_artifact: str,
        original_timestamp: str,
        utc_timestamp: Optional[str] = None,
        original_tz: Optional[str] = "UNKNOWN",
        description: str = "",
        parser_name: str = "RBP-Timeline-Normalizer",
        confidence_notes: str = "Direct artifact timestamp extraction",
        raw_record_ref: Optional[Dict[str, Any]] = None,
    ):
        self.event_id = event_id
        self.case_id = case_id
        self.evidence_id = evidence_id
        self.category = category
        self.source_artifact = source_artifact
        self.original_timestamp = original_timestamp
        self.original_tz = original_tz
        self.description = description
        self.parser_name = parser_name
        self.confidence_notes = confidence_notes
        self.raw_record_ref = raw_record_ref or {}

        # Safe UTC normalization without silently mutating unknown zones
        self.utc_timestamp = utc_timestamp or self._normalize_utc(original_timestamp, original_tz)

    def _normalize_utc(self, ts_str: str, tz_hint: Optional[str]) -> str:
        try:
            # Handle standard ISO-8601
            clean = ts_str.replace("Z", "+00:00")
            dt = datetime.fromisoformat(clean)
            if dt.tzinfo is None:
                # If no timezone is present, do NOT pretend it's UTC if unconfirmed
                return f"{dt.isoformat()}[TZ_UNCONFIRMED]"
            return dt.astimezone(timezone.utc).isoformat()
        except Exception:
            # Return original if parsing is ambiguous
            return f"{ts_str}[PARSE_AMBIGUOUS]"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "case_id": self.case_id,
            "evidence_id": self.evidence_id,
            "category": self.category,
            "source_artifact": self.source_artifact,
            "original_timestamp": self.original_timestamp,
            "utc_timestamp": self.utc_timestamp,
            "original_tz": self.original_tz,
            "description": self.description,
            "parser_name": self.parser_name,
            "confidence_notes": self.confidence_notes,
            "raw_record_ref": self.raw_record_ref,
        }


class TimelineEngine:
    def __init__(self):
        self.events: List[TimelineEvent] = []

    def add_event(self, event: TimelineEvent):
        self.events.append(event)

    def get_chronological(self) -> List[Dict[str, Any]]:
        """Returns events sorted by UTC timestamp."""
        sorted_events = sorted(self.events, key=lambda e: e.utc_timestamp)
        return [e.to_dict() for e in sorted_events]

    def filter_by_category(self, category: str) -> List[Dict[str, Any]]:
        return [e.to_dict() for e in self.events if e.category.upper() == category.upper()]
