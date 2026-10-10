import React from 'react';
import { CaseData, ExaminerProfile } from '../types/forensics';
import { translations } from '../utils/translations';
import {
  Shield,
  Languages,
  Printer,
  Sparkles,
  Lock,
  Sun,
  Moon,
  FolderOpen,
  PlusCircle,
  DatabaseZap,
  Terminal,
} from 'lucide-react';

interface TopBarProps {
  currentCase: CaseData;
  examiner: ExaminerProfile;
  lang: 'en' | 'ar';
  onToggleLang: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLoadSynthetic: () => void;
  onNewCase: () => void;
  onPrint: () => void;
  onOpenTerminal: () => void;
  hasSyntheticLoaded: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentCase,
  examiner,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  onLoadSynthetic,
  onNewCase,
  onPrint,
  onOpenTerminal,
  hasSyntheticLoaded,
}) => {
  const t = translations[lang];

  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between text-slate-100 flex-shrink-0 select-none z-10 no-print">
      {/* Brand & Suite Identification */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-cyan-700/80 border border-cyan-500/50 flex items-center justify-center text-cyan-200 shadow-sm shadow-cyan-900/30">
          <Shield className="w-5 h-5 text-cyan-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
              <span>RogueByte Police DFS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-400 font-semibold">
                v1.0.4
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 truncate max-w-sm">
            {t.suiteSubtitle} · <span className="text-slate-500 font-mono">SidoDev-Dz</span>
          </p>
        </div>
      </div>

      {/* Active Investigation Case Banner */}
      <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded px-3 py-1.5 shadow-inner">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium">{t.activeCase}:</span>
          <span className="font-mono font-bold text-cyan-300">{currentCase.caseId}</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-slate-500">{t.leadExaminer}:</span>
          <span className="font-medium text-slate-200">{examiner.name}</span>
          <span className="text-[10px] font-mono text-cyan-500 bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
            {examiner.badgeNumber}
          </span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-medium">
          <Lock className="w-3 h-3" />
          <span>W-BLOCK RO</span>
        </div>
      </div>

      {/* Action Controls & Utilities */}
      <div className="flex items-center gap-2">
        {/* Load Synthetic Case Action */}
        <button
          onClick={onLoadSynthetic}
          title="Load preconfigured synthetic case with 14 forensic artifacts"
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded font-medium transition-colors border ${
            hasSyntheticLoaded
              ? 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              : 'bg-cyan-600/20 text-cyan-300 border-cyan-600/40 hover:bg-cyan-600/30'
          }`}
        >
          <DatabaseZap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">
            {hasSyntheticLoaded ? 'Reload Case RBP-0881' : t.loadSyntheticCase}
          </span>
        </button>

        {/* New Case */}
        <button
          onClick={onNewCase}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">{t.newCase}</span>
        </button>

        {/* Print / Export Docket */}
        <button
          onClick={onPrint}
          title="Print or export official police examination report"
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">{t.printReport}</span>
        </button>

        {/* Forensic Terminal Console */}
        <button
          onClick={onOpenTerminal}
          title="Open interactive tactical forensics terminal console"
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded font-mono font-semibold bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 transition-colors shadow-sm"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">[&gt;_] CLI Terminal</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          title="Toggle English (LTR) / Arabic (العربية - RTL)"
          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          <Languages className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono font-semibold">{lang === 'en' ? 'AR' : 'EN'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title="Toggle Dark / Light High-Contrast Theme"
          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>
      </div>
    </header>
  );
};
