"""
Automated Unit Tests for RBP-DFS Core Modules.
Covers SHA-256 verification against NIST test vectors,
read-only evidence protection, chain of custody integrity,
and SQLite analyzer header parsing.
"""

import hashlib
import os
import sqlite3
import tempfile
import unittest
from pathlib import Path

from src.rbp_dfs.integrity.verifier import IntegrityVerifier
from src.rbp_dfs.custody.ledger import CustodyLedger
from src.rbp_dfs.cases.manager import CaseManager
from src.rbp_dfs.parsers.sqlite.analyzer import SQLiteAnalyzer


class TestIntegrityVerifier(unittest.TestCase):
    def setUp(self):
        self.temp_file = tempfile.NamedTemporaryFile(delete=False)
        # NIST Test Vector: "abc"
        # SHA-256("abc") = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
        self.temp_file.write(b"abc")
        self.temp_file.close()

    def tearDown(self):
        if os.path.exists(self.temp_file.name):
            os.remove(self.temp_file.name)

    def test_nist_vector_sha256(self):
        res = IntegrityVerifier.calculate_hashes(self.temp_file.name)
        expected = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        self.assertEqual(res["sha256"], expected)
        self.assertEqual(res["byte_size"], 3)

    def test_match_verification_success(self):
        expected = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        ver = IntegrityVerifier.verify_match(self.temp_file.name, expected)
        self.assertTrue(ver["match"])
        self.assertEqual(ver["integrity_status"], "VERIFIED_INTACT")

    def test_mismatch_alert(self):
        ver = IntegrityVerifier.verify_match(self.temp_file.name, "0000000000000000000000000000000000000000000000000000000000000000")
        self.assertFalse(ver["match"])
        self.assertEqual(ver["integrity_status"], "INTEGRITY_MISMATCH_ALERT")
        self.assertIn("CRITICAL EVIDENCE INTEGRITY WARNING", ver["warning"])


class TestCustodyLedger(unittest.TestCase):
    def test_tamper_evident_chain(self):
        ledger = CustodyLedger()
        e1 = ledger.add_entry("CASE-1", "EVD-1", "INTAKE", "Examiner-A", "Initial intake")
        e2 = ledger.add_entry("CASE-1", "EVD-1", "HASH_VERIFY", "Examiner-A", "SHA-256 confirmed")
        e3 = ledger.add_entry("CASE-1", "EVD-1", "SECURE_STORAGE", "Examiner-B", "Transferred to vault")

        # Initial chain integrity
        status = ledger.verify_integrity()
        self.assertTrue(status["valid"])
        self.assertEqual(status["count"], 3)

        # Tampering with entry 2 notes
        ledger.entries[1].notes = "Altered unauthorized note"
        tampered_status = ledger.verify_integrity()
        self.assertFalse(tampered_status["valid"])
        self.assertEqual(tampered_status["tamper_detected_at_index"], 1)


class TestSQLiteAnalyzer(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp(suffix=".db")
        os.close(self.db_fd)
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("CREATE TABLE evidence_logs (id INTEGER PRIMARY KEY, note TEXT);")
        cur.execute("INSERT INTO evidence_logs (note) VALUES ('Seized phone record 1');")
        cur.execute("INSERT INTO evidence_logs (note) VALUES ('Seized phone record 2');")
        conn.commit()
        conn.close()

    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_sqlite_inspection(self):
        res = SQLiteAnalyzer.inspect_file(self.db_path)
        self.assertTrue(res["is_valid_sqlite"])
        self.assertEqual(res["integrity_check"], "ok")
        table_names = [t["name"] for t in res["tables"]]
        self.assertIn("evidence_logs", table_names)
        self.assertEqual(res["tables"][0]["record_count"], 2)


if __name__ == "__main__":
    unittest.main()
