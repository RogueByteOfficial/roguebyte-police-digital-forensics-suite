# Supported Forensic Evidence Formats Matrix

| Category | Format / Extension | Parser Implementation | Limitations / Status |
|---|---|---|---|
| Forensic Disk Images | `.dd`, `.raw`, `.img`, `.e01` | Streaming Hash / Header Inspection | Read-only raw streams supported. E01 compression requires libewf. |
| SQLite Databases | `.db`, `.sqlite`, `.sqlite3`, `.db3` | Native SQLite & Sql.js engine | Read-only URI mode. Freelists and WAL inspected. |
| WAL & Rollback | `-wal`, `-shm`, `-journal` | Sidecar presence & byte delta engine | Inspects uncommitted transactions; does not modify DB. |
| Mobile: Android | `.ab` (Android Backup), `.tar`, bugreport.txt | Tar header parser, logcat parser | Encrypted `.ab` backups require examiner passphrase. |
| Mobile: iOS | `Manifest.db`, `Info.plist`, `.plist` | SQLite Manifest reader & Plist reader | Encrypted iTunes backups require decryption keys. |
| Communication | WhatsApp `msgstore.db`, SMS/MMS, Call Logs | Specialized SQLite schema analyzers | Decryption keys required if crypt12/14/15 format. |
| Browser Artifacts | Chrome `History`, Firefox `places.sqlite` | Chromium & Gecko SQLite table parsers | Cookie values protected by OS DPAPI/Keyring require session keys. |
| Event & System Logs | Windows `.evtx`, Linux `/var/log/syslog` | Text & EVTX chunk parser | Truncated logs flagged with PARSE_AMBIGUOUS tag. |
| Media & Images | `.jpg`, `.jpeg`, `.png`, `.tiff`, `.heic` | EXIF tag & GPS parser | Stripped EXIF flagged as potential scrubbed evidence. |
