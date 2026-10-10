import React, { useState } from 'react';
import { CorrelationLink, EvidenceItem, MessageRecord, BrowserHistoryItem, SystemLogItem } from '../../types/forensics';
import { Network, Search, Filter, ShieldCheck, Link2, ExternalLink, ArrowRight } from 'lucide-react';

interface CorrelationViewProps {
  correlations: CorrelationLink[];
  evidenceList: EvidenceItem[];
  messages: MessageRecord[];
  browserHistory: BrowserHistoryItem[];
  systemLogs: SystemLogItem[];
  lang: 'en' | 'ar';
}

export const CorrelationView: React.FC<CorrelationViewProps> = ({
  correlations,
  evidenceList,
  messages,
  browserHistory,
  systemLogs,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'CORRELATIONS' | 'SEARCH'>('CORRELATIONS');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Multi-entity search across entire loaded case
  const searchResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const hits: { type: string; title: string; subtitle: string; match: string }[] = [];

    // Search evidence
    evidenceList.forEach((e) => {
      if (e.filename.toLowerCase().includes(q) || e.sha256.toLowerCase().includes(q) || e.sourceDescription.toLowerCase().includes(q)) {
        hits.push({ type: 'EVIDENCE', title: e.filename, subtitle: e.evidenceId, match: `Hash: ${e.sha256}` });
      }
    });

    // Search messages
    messages.forEach((m) => {
      if (m.body.toLowerCase().includes(q) || m.sender.toLowerCase().includes(q) || m.recipient.toLowerCase().includes(q)) {
        hits.push({ type: 'MESSAGE', title: `${m.sender} ➔ ${m.recipient}`, subtitle: m.id, match: m.body });
      }
    });

    // Search browser
    browserHistory.forEach((b) => {
      if (b.url.toLowerCase().includes(q) || b.title.toLowerCase().includes(q)) {
        hits.push({ type: 'BROWSER', title: b.title, subtitle: b.browser, match: b.url });
      }
    });

    // Search logs
    systemLogs.forEach((l) => {
      if (l.message.toLowerCase().includes(q)) {
        hits.push({ type: 'LOG', title: `Event ID ${l.eventId}`, subtitle: l.system, match: l.message });
      }
    });

    return hits;
  };

  const results = searchResults();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">[12 / 13]</span>
            <h2 className="text-lg font-bold text-slate-100">
              {lang === 'ar' ? 'ربط الآثار المتقاطعة والبحث الشامل' : 'Cross-Artifact Correlation & Global Query Search'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'مطابقة الروابط بين الهواتف وعناوين IP والبصمات، مع إظهار الأدلة الملموسة الداعمة لكل علاقة'
              : 'Relational pivot analysis linking suspects, network IPs, and communication trails with citation proofs'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-1">
          <button
            onClick={() => setActiveTab('CORRELATIONS')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'CORRELATIONS' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Correlated Entities ({correlations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('SEARCH')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'SEARCH' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Global Search</span>
          </button>
        </div>
      </div>

      {activeTab === 'CORRELATIONS' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Methodology Requirement:</strong> Every proposed relationship is strictly backed by direct citations to underlying physical artifacts, log records, and parsed timestamps.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {correlations.map((corr) => (
              <div key={corr.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                      {corr.entityType} PIVOT
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      {corr.associatedArtifactsCount} Sources
                    </span>
                  </div>

                  <div className="font-mono text-sm font-bold text-slate-100 bg-slate-950 p-2.5 rounded border border-slate-800 truncate select-all mb-3">
                    {corr.value}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {corr.investigativeNote}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-mono text-slate-500 block">Supporting Evidence Citations:</span>
                    {corr.supportingRecords.map((rec, rIdx) => (
                      <div key={rIdx} className="text-[11px] font-mono text-cyan-300/90 bg-slate-950/80 p-2 rounded border border-slate-800/60 flex items-center gap-1.5">
                        <Link2 className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span className="truncate">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                  Linked Evidence Items: {corr.evidenceIds.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'SEARCH' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search across all evidence files, message bodies, IP addresses, hashes, or logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2.5 pl-9 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {searchQuery.trim() ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
              <div className="p-3 border-b border-slate-800 text-xs font-mono text-slate-400">
                Found {results.length} matching hits across active case artifacts for "{searchQuery}"
              </div>
              <div className="divide-y divide-slate-800/60">
                {results.length > 0 ? (
                  results.map((hit, idx) => (
                    <div key={idx} className="p-3.5 hover:bg-slate-800/40 transition-colors space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-950 border border-slate-800 text-cyan-400 font-bold">
                          {hit.type}
                        </span>
                        <span className="font-semibold text-slate-200">{hit.title}</span>
                        <span className="text-[11px] font-mono text-slate-500">({hit.subtitle})</span>
                      </div>
                      <div className="font-mono text-slate-400 bg-slate-950/80 p-2 rounded border border-slate-800/60 break-all select-all">
                        {hit.match}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono">
                    No matching artifacts found for specified query.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-lg">
              Enter a search keyword, IP address (e.g. "198.51.100.42"), phone number, or hash above to perform multi-artifact query.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
