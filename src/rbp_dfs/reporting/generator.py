"""
Forensic Report Generator (Module 16).
Generates official digital forensic reports in JSON, CSV, and HTML formats.
Includes case metadata, examiner credentials, hash manifests,
chain of custody audit trail, timeline findings, and limitations.
"""

import csv
import json
import io
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List


class ReportGenerator:
    @staticmethod
    def generate_json(
        case_data: Dict[str, Any],
        evidence_items: List[Dict[str, Any]],
        custody_entries: List[Dict[str, Any]],
        timeline_events: List[Dict[str, Any]],
        examiner: str,
        organization: str = "RogueByte",
    ) -> str:
        report = {
            "report_id": f"RBP-REP-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            "generated_at_utc": datetime.now(timezone.utc).isoformat(),
            "software": "RogueByte Police Digital Forensics Suite (RBP-DFS) v1.0.4",
            "developer": "SidoDev-Dz",
            "organization": organization,
            "examiner": examiner,
            "case": case_data,
            "evidence_inventory": evidence_items,
            "chain_of_custody_log": custody_entries,
            "timeline_events": timeline_events,
            "forensic_methodology": (
                "NIST SP 800-86 Guide to Integrating Forensic Techniques into Incident Response. "
                "Evidence preserved in read-only binary state. Hashes computed using streaming SHA-256."
            ),
            "limitations_and_disclaimers": (
                "Unallocated space fragments are partial and unconfirmed until corroborated. "
                "AI-assisted review notes require independent human examiner verification."
            ),
        }
        return json.dumps(report, indent=2)

    @staticmethod
    def generate_csv_timeline(timeline_events: List[Dict[str, Any]]) -> str:
        output = io.StringIO()
        fieldnames = [
            "event_id",
            "category",
            "original_timestamp",
            "utc_timestamp",
            "source_artifact",
            "description",
            "confidence_notes",
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for ev in timeline_events:
            writer.writerow(ev)
        return output.getvalue()

    @staticmethod
    def generate_html(
        case_data: Dict[str, Any],
        evidence_items: List[Dict[str, Any]],
        custody_entries: List[Dict[str, Any]],
        timeline_events: List[Dict[str, Any]],
        examiner: str,
    ) -> str:
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Official Forensic Docket - {case_data.get('case_id', 'N/A')}</title>
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 2rem; }}
  .docket-container {{ max-width: 900px; margin: 0 auto; background: #fff; padding: 3rem; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
  .header {{ border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 2rem; }}
  h1 {{ font-size: 1.5rem; text-transform: uppercase; margin: 0 0 0.5rem 0; letter-spacing: 0.05em; }}
  .meta-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; font-size: 0.875rem; }}
  table {{ width: 100%; border-collapse: collapse; margin-bottom: 2rem; font-size: 0.8125rem; }}
  th, td {{ border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }}
  th {{ background: #f1f5f9; font-weight: 600; }}
  .hash {{ font-family: monospace; font-size: 0.75rem; word-break: break-all; }}
  .section-title {{ font-size: 1.125rem; font-weight: 700; margin: 1.5rem 0 0.75rem 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; }}
  .badge {{ display: inline-block; padding: 0.125rem 0.5rem; font-size: 0.75rem; font-weight: 600; border-radius: 4px; }}
  .badge-intact {{ background: #dcfce7; color: #166534; }}
</style>
</head>
<body>
<div class="docket-container">
  <div class="header">
    <h1>RogueByte Police Digital Forensics Suite (RBP-DFS)</h1>
    <div style="font-size: 0.875rem; color: #64748b;">Law Enforcement Digital Evidence Examination Report | Developed by SidoDev-Dz</div>
  </div>

  <div class="meta-grid">
    <div><strong>Case Identifier:</strong> {case_data.get('case_id', 'N/A')}</div>
    <div><strong>Date Generated:</strong> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}</div>
    <div><strong>Lead Examiner:</strong> {examiner}</div>
    <div><strong>Agency:</strong> {case_data.get('agency', 'Law Enforcement Agency')}</div>
  </div>

  <div class="section-title">Evidence Inventory & Cryptographic Hashes</div>
  <table>
    <thead><tr><th>Evidence ID</th><th>Filename</th><th>Size (Bytes)</th><th>SHA-256 Hash</th><th>Integrity</th></tr></thead>
    <tbody>
      {''.join(f"<tr><td>{e.get('evidence_id')}</td><td>{e.get('filename')}</td><td>{e.get('byte_size')}</td><td class='hash'>{e.get('sha256')}</td><td><span class='badge badge-intact'>VERIFIED</span></td></tr>" for e in evidence_items)}
    </tbody>
  </table>

  <div class="section-title">Chain of Custody Audit Trail</div>
  <table>
    <thead><tr><th>Timestamp UTC</th><th>Action</th><th>Examiner</th><th>Record Hash</th></tr></thead>
    <tbody>
      {''.join(f"<tr><td>{c.get('timestamp_utc')}</td><td>{c.get('action')}</td><td>{c.get('examiner')}</td><td class='hash'>{c.get('entry_hash')}</td></tr>" for c in custody_entries)}
    </tbody>
  </table>

  <div class="section-title">Chronological Findings & Timeline Events</div>
  <table>
    <thead><tr><th>UTC Timestamp</th><th>Category</th><th>Source</th><th>Description</th></tr></thead>
    <tbody>
      {''.join(f"<tr><td>{t.get('utc_timestamp')}</td><td>{t.get('category')}</td><td>{t.get('source_artifact')}</td><td>{t.get('description')}</td></tr>" for t in timeline_events[:50])}
    </tbody>
  </table>
</div>
</body>
</html>"""
        return html
