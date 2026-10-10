# Forensic Limitations & Engineering Boundaries

In strict compliance with forensic science principles:

1. **No Absolute Authenticity from Hashes Alone**:
   A verified SHA-256 match demonstrates that the bitstream is identical to the reference sample. It does not prove how or when the file was created or who authored it.

2. **Unallocated Space & Freelist Fragments**:
   Freelist records in SQLite and unallocated filesystem remnants may be partially overwritten or fragmented. RBP-DFS labels these strictly as `RECOVERED_FRAGMENT` or `PARTIAL_UNCONFIRMED` and never fabricates missing fields.

3. **Anti-Tampering Ledger**:
   The chain of custody ledger is protected by SHA-256 hash chaining. If an entry is modified outside the suite, `verify_integrity()` immediately flags the exact index and event ID of the tampering attempt.

4. **AI-Assisted Analysis Boundary**:
   The Gemini AI review module is strictly an investigative assistant. It is barred from modifying data or generating hypotheses without referencing parsed artifact IDs. Every AI insight is watermarked with an investigative disclaimer.
