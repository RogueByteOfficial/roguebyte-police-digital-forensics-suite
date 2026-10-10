"""
Case Management Module (Module 01).
Maintains investigation cases, metadata, examiner assignments,
and search capabilities.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional


class Case:
    def __init__(
        self,
        case_id: str,
        title: str,
        investigator: str,
        agency: str,
        description: str = "",
        status: str = "OPEN",
        tags: Optional[List[str]] = None,
        created_at: Optional[str] = None,
    ):
        self.case_id = case_id
        self.title = title
        self.investigator = investigator
        self.agency = agency
        self.description = description
        self.status = status  # OPEN, ARCHIVED, CLOSED
        self.tags = tags or []
        self.created_at = created_at or datetime.now(timezone.utc).isoformat()
        self.evidence_ids: List[str] = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "case_id": self.case_id,
            "title": self.title,
            "investigator": self.investigator,
            "agency": self.agency,
            "description": self.description,
            "status": self.status,
            "tags": self.tags,
            "created_at": self.created_at,
            "evidence_ids": self.evidence_ids,
        }


class CaseManager:
    def __init__(self, storage_path: Optional[Path] = None):
        self.storage_path = storage_path
        self.cases: Dict[str, Case] = {}
        if storage_path and storage_path.exists():
            self.load()

    def create_case(
        self,
        case_id: str,
        title: str,
        investigator: str,
        agency: str,
        description: str = "",
        tags: Optional[List[str]] = None,
    ) -> Case:
        if case_id in self.cases:
            raise ValueError(f"Case with ID {case_id} already exists.")
        case = Case(case_id, title, investigator, agency, description, tags=tags)
        self.cases[case_id] = case
        self.save()
        return case

    def get_case(self, case_id: str) -> Optional[Case]:
        return self.cases.get(case_id)

    def list_cases(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        results = []
        for case in self.cases.values():
            if status is None or case.status.upper() == status.upper():
                results.append(case.to_dict())
        return results

    def search_cases(self, query: str) -> List[Dict[str, Any]]:
        q = query.lower()
        matches = []
        for case in self.cases.values():
            if (
                q in case.case_id.lower()
                or q in case.title.lower()
                or q in case.investigator.lower()
                or q in case.description.lower()
                or any(q in t.lower() for t in case.tags)
            ):
                matches.append(case.to_dict())
        return matches

    def save(self):
        if self.storage_path:
            self.storage_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump({k: v.to_dict() for k, v in self.cases.items()}, f, indent=2)

    def load(self):
        if self.storage_path and self.storage_path.exists():
            with open(self.storage_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for k, v in data.items():
                    c = Case(
                        case_id=v["case_id"],
                        title=v["title"],
                        investigator=v["investigator"],
                        agency=v["agency"],
                        description=v.get("description", ""),
                        status=v.get("status", "OPEN"),
                        tags=v.get("tags", []),
                        created_at=v.get("created_at"),
                    )
                    c.evidence_ids = v.get("evidence_ids", [])
                    self.cases[k] = c
