import React, { useState } from 'react';
import { CaseData } from '../../types/forensics';
import { FolderKanban, Plus, Search, Tag, Shield, Calendar, UserCheck } from 'lucide-react';
import { formatUtcDate } from '../../utils/crypto';

interface CaseManagementViewProps {
  currentCase: CaseData;
  onUpdateCase: (c: CaseData) => void;
  onNewCase: () => void;
  lang: 'en' | 'ar';
}

export const CaseManagementView: React.FC<CaseManagementViewProps> = ({
  currentCase,
  onUpdateCase,
  onNewCase,
  lang,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CaseData>(currentCase);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCase(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">[01]</span>
            <h2 className="text-lg font-bold text-slate-100">
              {lang === 'ar' ? 'إدارة القضايا الجنائية ومستندات التحقيق' : 'Case Management & Investigation Dockets'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'إنشاء ومتابعة وضبط القضايا الجنائية وصلاحيات التفويض القضائي'
              : 'Create, maintain, and audit digital forensic investigation cases with judicial warrants'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFormData(currentCase);
              setIsEditing(!isEditing);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {isEditing ? (lang === 'ar' ? 'إلغاء' : 'Cancel') : (lang === 'ar' ? 'تعديل البيانات' : 'Edit Case Details')}
          </button>
          <button
            onClick={onNewCase}
            className="px-3 py-1.5 text-xs font-medium rounded bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'فتح قضية جديدة' : 'Open New Case'}</span>
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-slate-900/80 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Case Identifier</label>
              <input
                type="text"
                value={formData.caseId}
                onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Case Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Lead Investigator</label>
              <input
                type="text"
                value={formData.investigator}
                onChange={(e) => setFormData({ ...formData, investigator: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Agency & Department</label>
              <input
                type="text"
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Search Warrant / Authorization Ref</label>
              <input
                type="text"
                value={formData.authorizationRef}
                onChange={(e) => setFormData({ ...formData, authorizationRef: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200"
              >
                <option value="OPEN">OPEN - Active Investigation</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW - Forensic Examination</option>
                <option value="ADMISSIBLE">ADMISSIBLE - Court Docket Prepared</option>
                <option value="CLOSED">CLOSED - Case Concluded</option>
                <option value="ARCHIVED">ARCHIVED - In Storage</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Investigation Scope & Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        /* Case Detail Cards */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  CASE DOSSIER #{currentCase.caseId}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">{currentCase.title}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300">
                  {currentCase.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{currentCase.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Primary Agency:</span>
                <span className="text-slate-200 font-medium">{currentCase.agency}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Department / Unit:</span>
                <span className="text-slate-200 font-medium">{currentCase.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Lead Forensic Examiner:</span>
                <span className="text-slate-200 font-medium">
                  {currentCase.investigator} (Badge #{currentCase.badgeNumber})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Judicial Authorization:</span>
                <span className="text-cyan-400 font-mono font-medium">{currentCase.authorizationRef}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-slate-500 block text-[11px] mb-1.5">Case Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {currentCase.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Case Stats & Legal Chain Integrity */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Evidence Protection Profile</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Created (UTC):</span>
                <span className="font-mono text-slate-200">{formatUtcDate(currentCase.createdAtUtc)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Hardware Write-Block:</span>
                <span className="font-mono text-emerald-400">ACTIVE (Tableau T8u)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Hashing Standard:</span>
                <span className="font-mono text-cyan-300">FIPS 180-4 SHA-256</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Chain Audit:</span>
                <span className="font-mono text-emerald-400">Cryptographically Chained</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Admissibility Status:</span>
                <span className="text-slate-300 font-medium">Pending Examiner Signing</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
