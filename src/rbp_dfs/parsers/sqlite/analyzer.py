"""
SQLite Forensic Engine (Modules 06 & 07).
Analyzes SQLite database files, page headers, freelist count,
schema tables, row counts, and WAL sidecars in strictly read-only mode.
"""

import os
import sqlite3
import struct
from pathlib import Path
from typing import Dict, Any, List, Optional


class SQLiteAnalyzer:
    @staticmethod
    def inspect_file(file_path: str | Path) -> Dict[str, Any]:
        """Performs non-destructive, read-only analysis of a SQLite database and associated files."""
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"Database not found: {file_path}")

        result: Dict[str, Any] = {
            "path": str(path.resolve()),
            "filename": path.name,
            "byte_size": path.stat().st_size,
            "is_valid_sqlite": False,
            "header": {},
            "sidecars": {},
            "tables": [],
            "indexes": [],
            "integrity_check": "NOT_RUN",
            "freelist_pages": 0,
            "page_size": 0,
            "errors": [],
        }

        # 1. Inspect raw SQLite 100-byte file header
        try:
            with open(path, "rb") as f:
                header_bytes = f.read(100)
                if len(header_bytes) >= 100 and header_bytes.startswith(b"SQLite format 3\x00"):
                    result["is_valid_sqlite"] = True
                    # Page size is at offset 16 (2 bytes big-endian)
                    raw_page_size = struct.unpack(">H", header_bytes[16:18])[0]
                    page_size = 65536 if raw_page_size == 1 else raw_page_size
                    # File change counter at offset 24 (4 bytes)
                    file_change_counter = struct.unpack(">I", header_bytes[24:28])[0]
                    # Freelist trunk page count at offset 36 (4 bytes)
                    freelist_count = struct.unpack(">I", header_bytes[36:40])[0]
                    # Schema cookie at offset 40 (4 bytes)
                    schema_cookie = struct.unpack(">I", header_bytes[40:44])[0]
                    # SQLite version number at offset 96 (4 bytes)
                    version_number = struct.unpack(">I", header_bytes[96:100])[0]

                    result["page_size"] = page_size
                    result["freelist_pages"] = freelist_count
                    result["header"] = {
                        "magic": "SQLite format 3",
                        "page_size": page_size,
                        "file_change_counter": file_change_counter,
                        "freelist_pages_count": freelist_count,
                        "schema_cookie": schema_cookie,
                        "sqlite_version_valid": version_number > 3000000,
                    }
                else:
                    result["errors"].append("Invalid SQLite magic header or corrupted file.")
                    return result
        except Exception as e:
            result["errors"].append(f"Header read error: {str(e)}")
            return result

        # 2. Check WAL and SHM sidecars
        wal_path = path.with_name(path.name + "-wal")
        shm_path = path.with_name(path.name + "-shm")

        result["sidecars"]["wal_present"] = wal_path.exists()
        if wal_path.exists():
            result["sidecars"]["wal_size_bytes"] = wal_path.stat().st_size
        result["sidecars"]["shm_present"] = shm_path.exists()
        if shm_path.exists():
            result["sidecars"]["shm_size_bytes"] = shm_path.stat().st_size

        # 3. Read-only query execution via URI mode (?mode=ro)
        try:
            uri = f"file:{path.resolve()}?mode=ro"
            conn = sqlite3.connect(uri, uri=True)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            # Integrity check
            cursor.execute("PRAGMA integrity_check;")
            integrity_rows = cursor.fetchall()
            result["integrity_check"] = integrity_rows[0][0] if integrity_rows else "UNKNOWN"

            # Enumerate tables
            cursor.execute(
                "SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%';"
            )
            tables = cursor.fetchall()

            for t in tables:
                t_name = t["name"]
                # Count records
                count = 0
                try:
                    c_cursor = conn.cursor()
                    c_cursor.execute(f"SELECT COUNT(*) FROM '{t_name}';")
                    count = c_cursor.fetchone()[0]
                except Exception:
                    count = -1

                # Column schema
                cursor.execute(f"PRAGMA table_info('{t_name}');")
                cols = cursor.fetchall()
                col_list = [{"cid": c[0], "name": c[1], "type": c[2], "notnull": c[3]} for c in cols]

                result["tables"].append({
                    "name": t_name,
                    "type": t["type"],
                    "record_count": count,
                    "columns": col_list,
                    "sql": t["sql"],
                })

            # Enumerate indexes
            cursor.execute("SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'index';")
            idx_rows = cursor.fetchall()
            result["indexes"] = [{"name": i["name"], "table": i["tbl_name"], "sql": i["sql"]} for i in idx_rows]

            conn.close()
        except Exception as e:
            result["errors"].append(f"SQLite querying error: {str(e)}")

        return result
