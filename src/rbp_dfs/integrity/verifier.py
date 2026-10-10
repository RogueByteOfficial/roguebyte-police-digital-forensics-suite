"""
Evidence Integrity Verification Module (Module 03).
Implements streaming SHA-256 calculation, expected hash verification,
and strict read-only guarantees on evidence files.
"""

import hashlib
import os
from pathlib import Path
from typing import Dict, Any, Optional

BUFFER_SIZE = 64 * 1024  # 64 KB chunks for memory-bounded streaming


class IntegrityVerifier:
    """Verifies evidence file hashes without modifying original files."""

    @staticmethod
    def calculate_hashes(file_path: str | Path) -> Dict[str, Any]:
        """Calculates SHA-256, SHA-1, and MD5 hashes in a single read stream.
        Enforces read-only file access.
        """
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"Evidence file not found: {file_path}")

        sha256 = hashlib.sha256()
        sha1 = hashlib.sha1()
        md5 = hashlib.md5()
        total_bytes = 0

        # Enforce read-only binary mode
        with open(path, "rb") as f:
            while chunk := f.read(BUFFER_SIZE):
                sha256.update(chunk)
                sha1.update(chunk)
                md5.update(chunk)
                total_bytes += len(chunk)

        return {
            "path": str(path.resolve()),
            "filename": path.name,
            "byte_size": total_bytes,
            "sha256": sha256.hexdigest(),
            "sha1": sha1.hexdigest(),
            "md5": md5.hexdigest(),
        }

    @staticmethod
    def verify_match(file_path: str | Path, expected_sha256: str) -> Dict[str, Any]:
        """Verifies if the file matches an expected SHA-256 hash."""
        results = IntegrityVerifier.calculate_hashes(file_path)
        calculated = results["sha256"].lower()
        expected = expected_sha256.strip().lower()

        match = calculated == expected
        results["expected_sha256"] = expected
        results["match"] = match
        results["integrity_status"] = "VERIFIED_INTACT" if match else "INTEGRITY_MISMATCH_ALERT"

        if not match:
            results["warning"] = (
                f"CRITICAL EVIDENCE INTEGRITY WARNING: "
                f"Calculated hash {calculated} does not match expected {expected}"
            )
        return results
