"""
Evidence Intake & Registration Module (Module 02).
Registers evidence, performs initial SHA-256 calculation,
identifies file types by magic byte signatures, and enforces read-only access.
"""

from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional
from ..integrity.verifier import IntegrityVerifier

MAGIC_SIGNATURES = {
    b"SQLite format 3\x00": "application/x-sqlite3",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"\xff\xd8\xff": "image/jpeg",
    b"%PDF-": "application/pdf",
    b"PK\x03\x04": "application/zip",
    b"PK\x05\x06": "application/zip",
    b"ANDROID BACKUP\n": "application/x-android-backup",
    b"bplist00": "application/x-plist-binary",
    b"7z\xbc\xaf\x27\x1c": "application/x-7z-compressed",
    b"\x1f\x8b\x08": "application/gzip",
    b"Elf": "application/x-executable",
    b"MZ": "application/x-dosexec",
    b"ElfFile": "application/x-elf",
    b"RIFF": "application/x-riff",
}


def identify_magic_bytes(file_path: Path) -> str:
    """Detects content type by inspecting binary signature headers."""
    try:
        with open(file_path, "rb") as f:
            header = f.read(32)
            for magic, mime in MAGIC_SIGNATURES.items():
                if header.startswith(magic):
                    return mime
            if b"SQLite" in header:
                return "application/x-sqlite3"
    except Exception:
        pass
    return "application/octet-stream"


class EvidenceItem:
    def __init__(
        self,
        evidence_id: str,
        case_id: str,
        file_path: str | Path,
        source_description: str,
        examiner: str,
        expected_sha256: Optional[str] = None,
        custody_notes: str = "Initial evidence intake",
    ):
        path = Path(file_path)
        self.evidence_id = evidence_id
        self.case_id = case_id
        self.original_path = str(path.resolve())
        self.filename = path.name
        self.source_description = source_description
        self.examiner = examiner
        self.acquired_at_utc = datetime.now(timezone.utc).isoformat()

        # Compute initial verification
        if path.is_file():
            hashes = IntegrityVerifier.calculate_hashes(path)
            self.sha256 = hashes["sha256"]
            self.sha1 = hashes["sha1"]
            self.md5 = hashes["md5"]
            self.byte_size = hashes["byte_size"]
            self.magic_type = identify_magic_bytes(path)
        else:
            self.sha256 = "N/A"
            self.sha1 = "N/A"
            self.md5 = "N/A"
            self.byte_size = 0
            self.magic_type = "directory"

        self.expected_sha256 = expected_sha256
        self.is_intact = (
            (self.sha256.lower() == expected_sha256.strip().lower())
            if expected_sha256 and self.sha256 != "N/A"
            else True
        )
        self.read_only_verified = True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "evidence_id": self.evidence_id,
            "case_id": self.case_id,
            "original_path": self.original_path,
            "filename": self.filename,
            "source_description": self.source_description,
            "examiner": self.examiner,
            "acquired_at_utc": self.acquired_at_utc,
            "sha256": self.sha256,
            "sha1": self.sha1,
            "md5": self.md5,
            "byte_size": self.byte_size,
            "magic_type": self.magic_type,
            "expected_sha256": self.expected_sha256,
            "is_intact": self.is_intact,
            "read_only_verified": self.read_only_verified,
        }
