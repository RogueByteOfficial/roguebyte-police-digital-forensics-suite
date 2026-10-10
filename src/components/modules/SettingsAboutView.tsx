import React, { useState } from 'react';
import { ExaminerProfile } from '../../types/forensics';
import { Sliders, Info, Shield, User, Globe, Clock, CheckCircle2, LogOut, FileText } from 'lucide-react';

interface SettingsAboutViewProps {
  examiner: ExaminerProfile;
  onUpdateExaminer: (prof: ExaminerProfile) => void;
  lang: 'en' | 'ar';
  onToggleLang: () => void;
  onFlushSession: () => void;
}

export const SettingsAboutView: React.FC<SettingsAboutViewProps> = ({
  examiner,
  onUpdateExaminer,
  lang,
  onToggleLang,
  onFlushSession,
}) => {
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'ABOUT' | 'DOCS'>('SETTINGS');
  const [formData, setFormData] = useState<ExaminerProfile>(examiner);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateExaminer(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">[19 / 20]</span>
            <h2 className="text-lg font-bold text-slate-100">
              {lang === 'ar' ? 'الإعدادات، التوثيق ومعلومات المنظومة' : 'Settings, Documentation & Suite Specifications'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'تكوين ملف المحقق، الشارة الأمنية، المناطق الزمنية، ومراجعة التوثيق القانوني والتقني'
              : 'Examiner credentials, agency badges, forensic methodologies, and system exit'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-1">
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'SETTINGS' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Examiner Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('ABOUT')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'ABOUT' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About Suite</span>
          </button>
          <button
            onClick={() => setActiveTab('DOCS')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'DOCS' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Forensic Docs</span>
          </button>
        </div>
      </div>

      {activeTab === 'SETTINGS' && (
        <form onSubmit={handleSave} className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-5 max-w-2xl">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Lead Examiner Identification & Credentials</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Examiner Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Agency Badge / Serial ID</label>
              <input
                type="text"
                value={formData.badgeNumber}
                onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Law Enforcement Agency</label>
              <input
                type="text"
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Division / Unit</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Timeline Timestamp Display</label>
              <select
                value={formData.defaultTimezone}
                onChange={(e) => setFormData({ ...formData, defaultTimezone: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200"
              >
                <option value="UTC">UTC (Strict Forensic Normalization)</option>
                <option value="LOCAL">Local Examiner System Time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Interface Direction / Language</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onToggleLang}
                  className="w-full py-2 px-3 text-xs font-medium rounded bg-slate-950 border border-slate-800 text-slate-200 hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Current: {lang === 'en' ? 'English (LTR)' : 'العربية (RTL)'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {saveSuccess ? (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Profile credentials successfully updated.
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              Save Profile Settings
            </button>
          </div>
        </form>
      )}

      {activeTab === 'ABOUT' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-6 max-w-3xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-600/30 border border-cyan-500 flex items-center justify-center text-cyan-300">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                RogueByte Police Digital Forensics Suite (RBP-DFS)
              </h3>
              <p className="text-xs text-slate-400">
                Version 1.0.4 · Law Enforcement Digital Evidence Analysis Platform
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 block text-[11px]">Primary Developer & Author:</span>
              <span className="text-slate-100 font-bold mt-0.5 block">SidoDev-Dz</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 block text-[11px]">Organization / Brand:</span>
              <span className="text-slate-100 font-bold mt-0.5 block">RogueByte</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 block text-[11px]">Supported Operating Systems:</span>
              <span className="text-slate-300 mt-0.5 block">Windows 10/11 x64, Linux x86_64, macOS</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 block text-[11px]">Cryptographic Standard:</span>
              <span className="text-cyan-300 font-bold mt-0.5 block">FIPS 180-4 SHA-256</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Author Credential & Mission Statement
            </h4>
            <p>
              Developed by <strong>SidoDev-Dz</strong> under the <strong>RogueByte</strong> digital forensic engineering initiative. Built specifically for certified digital forensic examiners, sworn law enforcement agencies, cybercrime task forces, and judicial expert witnesses.
            </p>
            <p className="text-slate-400 text-[11px]">
              Zero placeholder buttons. Every module executes verifiable hashing, SQLite non-destructive b-tree parsing, magic byte sniffing, and cryptographically linked chain of custody ledgers.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-[11px] font-mono text-slate-500">Session Status: Active & Secured</span>
            <button
              onClick={onFlushSession}
              className="px-3.5 py-1.5 rounded text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Flush Memory & Safe Session Exit</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'DOCS' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-5 max-w-3xl text-xs text-slate-300 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2">
            Forensic Science Methodology & Legal Limitations Matrix
          </h3>

          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-cyan-300 font-mono text-[11px]">1. ORIGINAL EVIDENCE READ-ONLY PROTECTION</h4>
              <p className="text-slate-400 mt-1">
                Source evidence files and forensic images (.raw, .dd, .db) are opened with read-only stream handles (<code className="text-slate-300">mode=ro</code> or <code className="text-slate-300">rb</code>). The application never executes suspect binaries or scripts.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-cyan-300 font-mono text-[11px]">2. TIMEZONE & TIMELINE INTEGRITY</h4>
              <p className="text-slate-400 mt-1">
                The timeline normalizer strictly flags ambiguous timestamps with <code className="text-slate-300">[TZ_UNCONFIRMED]</code>. Unconfirmed local offsets are never fabricated into UTC without corroborating artifact records.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-cyan-300 font-mono text-[11px]">3. UNALLOCATED SPACE & FREELIST CARVING</h4>
              <p className="text-slate-400 mt-1">
                Freelist remnants are labeled strictly as <code className="text-amber-300">RECOVERABLE_HISTORICAL</code> or <code className="text-amber-300">PARTIAL_FRAGMENT</code>. RBP-DFS never promises 100% recovery if records have been truncated or wiped.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-cyan-300 font-mono text-[11px]">4. AI-ASSISTED REVIEW BOUNDARY</h4>
              <p className="text-slate-400 mt-1">
                AI review notes are strictly assistive leads and must be independently verified by the lead forensic examiner prior to court presentation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
