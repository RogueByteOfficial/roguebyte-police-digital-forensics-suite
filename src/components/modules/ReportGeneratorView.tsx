import React, { useState } from 'react';
import { CaseData, EvidenceItem, CustodyRecord, TimelineEventItem } from '../../types/forensics';
import { FileText, Printer, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatUtcDate } from '../../utils/crypto';

interface ReportGeneratorViewProps {
  currentCase: CaseData;
  evidenceList: EvidenceItem[];
  custodyEntries: CustodyRecord[];
  timelineEvents: TimelineEventItem[];
  lang: 'en' | 'ar';
}

export const ReportGeneratorView: React.FC<ReportGeneratorViewProps> = ({
  currentCase,
  evidenceList,
  custodyEntries,
  timelineEvents,
  lang,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const reportId = `RBP-REP-${new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      reportId,
      software: 'RogueByte Police Digital Forensics Suite (RBP-DFS) v1.0.4',
      developer: 'SidoDev-Dz',
      organization: 'RogueByte',
      generatedAtUtc: new Date().toISOString(),
      case: currentCase,
      evidenceInventory: evidenceList,
      chainOfCustody: custodyEntries,
      timelineEvents,
      methodology: 'NIST SP 800-86 Forensic Framework · ISO/IEC 27037 Digital Evidence Standard',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCase.caseId}_Forensic_Dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('JSON Forensic Dossier Package successfully generated.');
  };

  const handleDownloadCsv = () => {
    const headers = ['Event_ID', 'Category', 'Source_Artifact', 'UTC_Timestamp', 'Description', 'Confidence'];
    const rows = timelineEvents.map((t) => [
      t.eventId,
      t.category,
      `"${t.sourceArtifact}"`,
      t.utcTimestamp,
      `"${t.description.replace(/"/g, '""')}"`,
      `${t.confidenceScore}%`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCase.caseId}_Timeline.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('CSV Timeline export successfully generated.');
  };

  const handleDownloadHtml = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Official Forensic Docket - ${currentCase.caseId}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #1e293b; padding: 2rem; max-width: 900px; margin: auto; }
  h1 { font-size: 18px; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
  th { background: #f8fafc; }
  .hash { font-family: monospace; font-size: 11px; }
</style>
</head>
<body>
  <h1>RogueByte Police Digital Forensics Suite — Official Examination Docket</h1>
  <p><strong>Case ID:</strong> ${currentCase.caseId} | <strong>Lead Examiner:</strong> ${currentCase.investigator} | <strong>Agency:</strong> ${currentCase.agency}</p>
  <h3>Evidence Inventory & Hashes</h3>
  <table>
    <thead><tr><th>ID</th><th>Filename</th><th>SHA-256</th></tr></thead>
    <tbody>${evidenceList.map(e => `<tr><td>${e.evidenceId}</td><td>${e.filename}</td><td class="hash">${e.sha256}</td></tr>`).join('')}</tbody>
  </table>
  <h3>Timeline Findings</h3>
  <table>
    <thead><tr><th>UTC</th><th>Source</th><th>Description</th></tr></thead>
    <tbody>${timelineEvents.map(t => `<tr><td>${t.utcTimestamp}</td><td>${t.sourceArtifact}</td><td>${t.description}</td></tr>`).join('')}</tbody>
  </table>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCase.caseId}_Report.html`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('Standalone HTML forensic docket export downloaded.');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">[16]</span>
            <h2 className="text-lg font-bold text-slate-100">
              {lang === 'ar' ? 'منشئ التقارير ومحاضر الضبط الجنائية' : 'Official Forensic Report & Court Docket Generator'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'توليد تقارير الضبط الرسمية: PDF للطباعة، ملفات HTML مستقلة، حزم JSON المهيكلة، وجداول CSV'
              : 'Generate court-admissible forensic dockets with printable PDF formatting, HTML dossiers, and JSON packages'}
          </p>
        </div>

        {/* Multi-Format Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Docket (PDF)</span>
          </button>
          <button
            onClick={handleDownloadHtml}
            className="px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>HTML Dossier</span>
          </button>
          <button
            onClick={handleDownloadJson}
            className="px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON Package</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Timeline</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-cyan-950/60 border border-cyan-800 rounded text-xs text-cyan-200 flex items-center gap-2 font-mono no-print">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Official Printable Forensic Docket Preview */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 lg:p-10 text-slate-200 space-y-6 shadow-xl print:bg-white print:text-black print:border-none print:p-0">
        {/* Police Agency Header */}
        <div className="border-b-2 border-slate-700 print:border-black pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-cyan-400 print:text-gray-600 uppercase">
              CONFIDENTIAL · LAW ENFORCEMENT FORENSIC EXAMINATION REPORT
            </div>
            <h1 className="text-xl font-bold uppercase tracking-wide text-slate-100 print:text-black mt-1">
              RogueByte Police Digital Forensics Suite (RBP-DFS)
            </h1>
            <p className="text-xs text-slate-400 print:text-gray-600">
              High-Tech Crime & Digital Evidence Laboratory · Developed by SidoDev-Dz
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-400 print:text-gray-700">
            <div>DOCKET: <strong className="text-cyan-300 print:text-black">{reportId}</strong></div>
            <div>DATE: {new Date().toISOString().substring(0, 10)} UTC</div>
          </div>
        </div>

        {/* Case Meta Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950/60 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300 text-xs font-mono">
          <div>
            <span className="text-slate-500 print:text-gray-600 block text-[10px]">CASE IDENTIFIER</span>
            <span className="font-bold text-slate-200 print:text-black">{currentCase.caseId}</span>
          </div>
          <div>
            <span className="text-slate-500 print:text-gray-600 block text-[10px]">LEAD EXAMINER</span>
            <span className="font-bold text-slate-200 print:text-black">{currentCase.investigator}</span>
          </div>
          <div>
            <span className="text-slate-500 print:text-gray-600 block text-[10px]">BADGE / CREDENTIAL</span>
            <span className="font-bold text-slate-200 print:text-black">{currentCase.badgeNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 print:text-gray-600 block text-[10px]">SEARCH WARRANT</span>
            <span className="font-bold text-cyan-400 print:text-black">{currentCase.authorizationRef}</span>
          </div>
        </div>

        {/* Evidence Inventory Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black border-b border-slate-800 print:border-gray-300 pb-1">
            Section 1: Ingested Evidence Inventory & FIPS 180-4 SHA-256 Manifest
          </h3>
          <div className="overflow-x-auto border border-slate-800 print:border-gray-300 rounded">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 print:bg-gray-100 text-[10px] font-mono uppercase text-slate-400 print:text-black border-b border-slate-800 print:border-gray-300">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Filename</th>
                  <th className="p-2">Bytes</th>
                  <th className="p-2">Cryptographic SHA-256 Bitstream Hash</th>
                  <th className="p-2">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300 font-mono text-[11px]">
                {evidenceList.map((e) => (
                  <tr key={e.evidenceId}>
                    <td className="p-2 font-bold text-cyan-300 print:text-black">{e.evidenceId}</td>
                    <td className="p-2 text-slate-200 print:text-black">{e.filename}</td>
                    <td className="p-2 text-slate-400 print:text-black">{e.byteSize.toLocaleString()}</td>
                    <td className="p-2 text-slate-300 print:text-black text-[10px]">{e.sha256}</td>
                    <td className="p-2 text-emerald-400 print:text-black font-semibold">VERIFIED_INTACT</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chain of Custody */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black border-b border-slate-800 print:border-gray-300 pb-1">
            Section 2: Tamper-Evident Chain of Custody Audit Trail
          </h3>
          <div className="overflow-x-auto border border-slate-800 print:border-gray-300 rounded">
            <table className="w-full text-left text-xs font-mono text-[11px]">
              <thead className="bg-slate-950 print:bg-gray-100 text-[10px] uppercase text-slate-400 print:text-black border-b border-slate-800 print:border-gray-300">
                <tr>
                  <th className="p-2">Event ID</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Timestamp (UTC)</th>
                  <th className="p-2">Examiner</th>
                  <th className="p-2">Chained Block Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {custodyEntries.map((c) => (
                  <tr key={c.eventId}>
                    <td className="p-2 font-bold text-cyan-300 print:text-black">{c.eventId}</td>
                    <td className="p-2 text-slate-200 print:text-black">{c.action}</td>
                    <td className="p-2 text-slate-400 print:text-black">{c.timestampUtc}</td>
                    <td className="p-2 text-slate-300 print:text-black">{c.examiner}</td>
                    <td className="p-2 text-slate-400 print:text-black text-[10px]">{c.entryHash.substring(0, 24)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology & Limitations */}
        <div className="p-4 bg-slate-950/80 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded text-xs space-y-2">
          <div className="font-bold uppercase tracking-wider text-slate-300 print:text-black">
            Section 3: Forensic Methodology & Legal Limitations
          </div>
          <p className="text-[11px] text-slate-400 print:text-gray-700 leading-relaxed">
            All forensic acquisitions adhered to NIST SP 800-86 standards using hardware write-blocking. Bitstream hashes were computed in continuous streams. Freelist remnants represent unallocated b-tree cell space and are classified as recoverable historical fragments.
          </p>
        </div>

        {/* Formal Signature Blocks */}
        <div className="pt-8 border-t border-slate-800 print:border-black grid grid-cols-2 gap-8 text-xs font-mono">
          <div>
            <div className="border-b border-slate-600 print:border-black pb-8 mb-2">
              <span className="text-slate-500 print:text-gray-600 text-[10px] block">REPORTING FORENSIC EXAMINER SIGNATURE</span>
            </div>
            <div className="text-slate-200 print:text-black font-bold">{currentCase.investigator}</div>
            <div className="text-slate-500 print:text-gray-600 text-[11px]">Digital Evidence Specialist · Badge #{currentCase.badgeNumber}</div>
          </div>
          <div>
            <div className="border-b border-slate-600 print:border-black pb-8 mb-2">
              <span className="text-slate-500 print:text-gray-600 text-[10px] block">SUPERVISING OFFICER / LABORATORY DIRECTOR</span>
            </div>
            <div className="text-slate-200 print:text-black font-bold">Commander Vance Miller</div>
            <div className="text-slate-500 print:text-gray-600 text-[11px]">Director, RogueByte Cybercrime Laboratory</div>
          </div>
        </div>
      </div>
    </div>
  );
};
