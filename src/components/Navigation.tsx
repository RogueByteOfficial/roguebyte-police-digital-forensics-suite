import React, { useState } from 'react';
import { ModuleId } from '../types/forensics';
import { translations } from '../utils/translations';
import {
  FolderKanban,
  FilePlus2,
  ShieldCheck,
  Smartphone,
  MessageSquare,
  Database,
  Trash2,
  FileSearch,
  Globe,
  Camera,
  CalendarDays,
  Network,
  Search,
  Sparkles,
  Link2,
  FileText,
  Layers,
  CheckCircle2,
  Sliders,
  Info,
} from 'lucide-react';

interface NavigationProps {
  currentModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  lang: 'en' | 'ar';
  counts: {
    evidence: number;
    messages: number;
    timeline: number;
    custody: number;
    correlations: number;
  };
}

export const MODULE_CONFIG: {
  id: ModuleId;
  titleKey: keyof typeof translations.en;
  descKey: keyof typeof translations.en;
  icon: React.ComponentType<{ className?: string }>;
  hotkey?: string;
}[] = [
  { id: '01', titleKey: 'm01', descKey: 'm01_desc', icon: FolderKanban, hotkey: 'Alt+1' },
  { id: '02', titleKey: 'm02', descKey: 'm02_desc', icon: FilePlus2, hotkey: 'Alt+2' },
  { id: '03', titleKey: 'm03', descKey: 'm03_desc', icon: ShieldCheck, hotkey: 'Alt+3' },
  { id: '04', titleKey: 'm04', descKey: 'm04_desc', icon: Smartphone, hotkey: 'Alt+4' },
  { id: '05', titleKey: 'm05', descKey: 'm05_desc', icon: MessageSquare, hotkey: 'Alt+5' },
  { id: '06', titleKey: 'm06', descKey: 'm06_desc', icon: Database, hotkey: 'Alt+6' },
  { id: '07', titleKey: 'm07', descKey: 'm07_desc', icon: Trash2, hotkey: 'Alt+7' },
  { id: '08', titleKey: 'm08', descKey: 'm08_desc', icon: FileSearch, hotkey: 'Alt+8' },
  { id: '09', titleKey: 'm09', descKey: 'm09_desc', icon: Globe, hotkey: 'Alt+9' },
  { id: '10', titleKey: 'm10', descKey: 'm10_desc', icon: Camera },
  { id: '11', titleKey: 'm11', descKey: 'm11_desc', icon: CalendarDays },
  { id: '12', titleKey: 'm12', descKey: 'm12_desc', icon: Network },
  { id: '13', titleKey: 'm13', descKey: 'm13_desc', icon: Search },
  { id: '14', titleKey: 'm14', descKey: 'm14_desc', icon: Sparkles },
  { id: '15', titleKey: 'm15', descKey: 'm15_desc', icon: Link2 },
  { id: '16', titleKey: 'm16', descKey: 'm16_desc', icon: FileText },
  { id: '17', titleKey: 'm17', descKey: 'm17_desc', icon: Layers },
  { id: '18', titleKey: 'm18', descKey: 'm18_desc', icon: CheckCircle2 },
  { id: '19', titleKey: 'm19', descKey: 'm19_desc', icon: Sliders },
  { id: '20', titleKey: 'm20', descKey: 'm20_desc', icon: Info },
];

export const Navigation: React.FC<NavigationProps> = ({
  currentModule,
  onSelectModule,
  lang,
  counts,
}) => {
  const t = translations[lang];
  const [filterText, setFilterText] = useState('');

  const filtered = MODULE_CONFIG.filter((m) => {
    const title = (t[m.titleKey] as string) || '';
    const desc = (t[m.descKey] as string) || '';
    const q = filterText.toLowerCase();
    return (
      m.id.includes(q) ||
      title.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q)
    );
  });

  const getBadge = (id: ModuleId) => {
    if (id === '02') return counts.evidence > 0 ? counts.evidence : null;
    if (id === '05') return counts.messages > 0 ? counts.messages : null;
    if (id === '11') return counts.timeline > 0 ? counts.timeline : null;
    if (id === '12') return counts.correlations > 0 ? counts.correlations : null;
    if (id === '15') return counts.custody > 0 ? counts.custody : null;
    return null;
  };

  return (
    <aside className="w-80 flex-shrink-0 bg-slate-900/90 border-r border-slate-800 flex flex-col h-full text-slate-200 select-none no-print">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-cyan-600 flex items-center justify-center text-white font-bold text-xs tracking-wider">
              RB
            </div>
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Forensic Modules [01-20]
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
            NIST SP 800-86
          </span>
        </div>

        {/* Quick Module Filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder={lang === 'ar' ? 'تصفية القوائم [01-20]...' : 'Filter modules [01-20]...'}
            className="w-full bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 pl-8 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Numbered Navigation List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" aria-label="Investigation modules">
        {filtered.map((m) => {
          const isActive = currentModule === m.id;
          const Icon = m.icon;
          const title = t[m.titleKey] as string;
          const badgeCount = getBadge(m.id);

          return (
            <button
              key={m.id}
              onClick={() => onSelectModule(m.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-all group ${
                isActive
                  ? 'bg-cyan-950/70 border border-cyan-500/50 text-cyan-200 shadow-sm'
                  : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`font-mono text-xs font-bold tracking-wider ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                >
                  [{m.id}]
                </span>
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span className="text-xs font-medium truncate">{title}</span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {badgeCount !== null && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                    {badgeCount}
                  </span>
                )}
                {m.hotkey && (
                  <span className="hidden xl:inline text-[9px] font-mono text-slate-600 opacity-60">
                    {m.hotkey}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Security & Write-Block Status Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Source State:</span>
          <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            READ_ONLY_RO
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Crypto Engine:</span>
          <span className="text-cyan-400 font-mono">SHA-256 Verified</span>
        </div>
      </div>
    </aside>
  );
};
