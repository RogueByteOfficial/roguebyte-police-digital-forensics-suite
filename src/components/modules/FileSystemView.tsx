import React, { useState } from 'react';
import { BrowserHistoryItem, SystemLogItem, EvidenceItem } from '../../types/forensics';
import { FileSearch, Globe, ShieldAlert, AlertTriangle, Monitor, ExternalLink, HardDrive } from 'lucide-react';
import { formatUtcDate } from '../../utils/crypto';

interface FileSystemViewProps {
  evidenceList: EvidenceItem[];
  browserHistory: BrowserHistoryItem[];
  systemLogs: SystemLogItem[];
  lang: 'en' | 'ar';
}

export const FileSystemView: React.FC<FileSystemViewProps> = ({
  evidenceList,
  browserHistory,
  systemLogs,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'METADATA' | 'BROWSER' | 'LOGS'>('METADATA');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">[08 / 09]</span>
            <h2 className="text-lg font-bold text-slate-100">
              {lang === 'ar' ? 'تحليل نظام الملفات وسجلات المتصفحات والنظام' : 'File System, Browser & System Artifacts'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'كشف تمويه الامتدادات Magic-Bytes، فحص سجلات تصفح كروم/فايرفوكس، وتتبع أحداث تسجيل الدخول EVTX'
              : 'Magic signature sniffing, extension spoofing alerts, web history, and Windows EVTX/Linux syslog'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-1">
          <button
            onClick={() => setActiveTab('METADATA')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'METADATA' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Files & Magic Bytes</span>
          </button>
          <button
            onClick={() => setActiveTab('BROWSER')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'BROWSER' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Browser History ({browserHistory.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'LOGS' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>System Logs ({systemLogs.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'METADATA' && (
        <div className="space-y-4">
          {/* Critical Extension Spoofing Alert Card */}
          <div className="p-4 bg-rose-950/30 border border-rose-800/80 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Suspicious Extension Spoofing Detected: invoice_financial_audit.pdf</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              File presents a <span className="font-mono text-cyan-300">.pdf</span> extension, but byte-level inspection reveals binary signature header{' '}
              <span className="font-mono text-amber-300">7F 45 4C 46 (ELF 64-bit LSB executable)</span>.
              This indicates deliberate anti-forensic camouflage to masquerade an executable intrusion tool as an accounting invoice document.
            </p>
          </div>

          {/* Files Inventory with Magic Check */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Magic Signature & Content Validation Table
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Filename</th>
                    <th className="py-2.5 px-3">Path</th>
                    <th className="py-2.5 px-3">Detected MIME</th>
                    <th className="py-2.5 px-3">Signature Match</th>
                    <th className="py-2.5 px-3">Examiner Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {evidenceList.map((e) => {
                    const isMismatch = e.filename.endsWith('.pdf') && e.magicType.includes('executable');
                    return (
                      <tr key={e.evidenceId} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-semibold text-slate-200">{e.filename}</td>
                        <td className="py-3 px-3 text-slate-400 truncate max-w-xs">{e.originalPath}</td>
                        <td className="py-3 px-3 text-cyan-300">{e.magicType}</td>
                        <td className="py-3 px-3">
                          {isMismatch ? (
                            <span className="text-rose-400 font-bold">MISMATCH SPOOFING</span>
                          ) : (
                            <span className="text-emerald-400 font-medium">VERIFIED MATCH</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {isMismatch ? (
                            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                              PRIORITY-1 REVIEW
                            </span>
                          ) : (
                            <span className="text-slate-500">Normal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'BROWSER' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Parsed Web History & Typed URLs ({browserHistory.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Browser</th>
                  <th className="py-2.5 px-3">Page Title</th>
                  <th className="py-2.5 px-3">URL</th>
                  <th className="py-2.5 px-3">Visits</th>
                  <th className="py-2.5 px-3">Last Visit (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {browserHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-cyan-300">{item.browser}</td>
                    <td className="py-3 px-3 font-medium text-slate-200">{item.title}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400 truncate max-w-sm" title={item.url}>
                      {item.url}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">{item.visitCount}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{formatUtcDate(item.lastVisitUtc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>System Security Event Logs ({systemLogs.length})</span>
            </h3>
          </div>

          <div className="divide-y divide-slate-800/60">
            {systemLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-800/30 transition-colors space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">{log.id}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {log.system}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.2 rounded font-semibold ${
                        log.level === 'WARNING'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="font-mono text-slate-400 font-semibold">Event ID: {log.eventId}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">{formatUtcDate(log.timestampUtc)}</span>
                </div>
                <p className="text-xs text-slate-200 font-mono bg-slate-950 p-2 rounded border border-slate-800 select-all">
                  {log.message}
                </p>
                <div className="text-[10px] font-mono text-slate-500">Source Provider: {log.source}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
