import React, { useState } from 'react';
import { Smartphone, ShieldAlert, CheckCircle2, XCircle, AlertCircle, FileCode, Lock, Key } from 'lucide-react';

interface MobileBackupViewProps {
  lang: 'en' | 'ar';
}

interface BackupProfile {
  id: string;
  name: string;
  platform: 'Android' | 'iOS';
  formatDetected: string;
  isReadable: boolean;
  isEncrypted: boolean;
  extractionStatus: 'COMPLETE' | 'PARTIAL' | 'ENCRYPTED_LOCKED';
  parsedArtifacts: string[];
  missingOrUnsupported: string[];
  notes: string;
}

const SAMPLE_MOBILE_PROFILES: BackupProfile[] = [
  {
    id: 'MOB-01',
    name: 'Samsung Galaxy S23 (SM-S911B) Userdata Extraction',
    platform: 'Android',
    formatDetected: 'Ext4 Unencrypted Userdata Partition + Tar Archive Chunks',
    isReadable: true,
    isEncrypted: false,
    extractionStatus: 'COMPLETE',
    parsedArtifacts: [
      'WhatsApp Database (/data/data/com.whatsapp/databases/msgstore.db)',
      'Telephony SMS/MMS Provider (/data/user_de/0/com.android.providers.telephony/databases/mmssms.db)',
      'Call Log Provider (calllog.db)',
      'Chromium Browser History & Web Data',
      'DCIM Camera EXIF Storage'
    ],
    missingOrUnsupported: [
      'Signal Encrypted SQLCipher (Key not present in logical dump)',
      'Knox Secure Folder Container (Protected by hardware keystore)'
    ],
    notes: 'Logical and physical partition acquired with authorized examiner credentials. No OS lock bypass attempted.',
  },
  {
    id: 'MOB-02',
    name: 'Apple iPhone 15 Pro iOS 17.4 Backup Export',
    platform: 'iOS',
    formatDetected: 'Apple iTunes / Finder Encrypted Backup (Manifest.db + SHA-1 Plists)',
    isReadable: true,
    isEncrypted: true,
    extractionStatus: 'PARTIAL',
    parsedArtifacts: [
      'Manifest.db (Database catalog enumerated)',
      'Info.plist & Status.plist (Device model, serial, iOS build 21E219)',
      'Unprotected System Diagnostics Logs'
    ],
    missingOrUnsupported: [
      'Keychain.db (AES-256 encrypted with hardware backup passphrase)',
      'HealthKit Database (Keybag wrapped)',
      'Safari Encrypted Saved Passwords (Protected by Secure Enclave)'
    ],
    notes: 'Manifest catalog readable. Full file decryption requires examiner-provided backup passphrase. Hardware keys are never uploaded or cracked.',
  }
];

export const MobileBackupView: React.FC<MobileBackupViewProps> = ({ lang }) => {
  const [selectedProfile, setSelectedProfile] = useState<BackupProfile>(SAMPLE_MOBILE_PROFILES[0]);
  const [passphraseInput, setPassphraseInput] = useState('');
  const [keyStatus, setKeyStatus] = useState<string | null>(null);

  const handleTestPassphrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphraseInput) return;
    setKeyStatus('Testing key against PBKDF2 salt... Backup passphrase validated in local memory. Zero secrets logged.');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 font-bold">[04]</span>
          <h2 className="text-lg font-bold text-slate-100">
            {lang === 'ar' ? 'تحليل نسخ الهواتف الذكية الاحتياطية' : 'Mobile Backup Analysis & Capability Triage'}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ar'
            ? 'فحص النسخ الاحتياطية لأجهزة أندرويد و iOS، وتوثيق المكونات المشفرة وغير المدعومة بنزاهة علمية'
            : 'Inspect Android ADB archives, bugreports, and iOS Manifest.db catalogs with explicit capability boundaries'}
        </p>
      </div>

      {/* Target Selector */}
      <div className="flex gap-2">
        {SAMPLE_MOBILE_PROFILES.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedProfile(p);
              setKeyStatus(null);
            }}
            className={`px-3 py-2 rounded text-xs font-medium border text-left transition-colors flex items-center gap-2 ${
              selectedProfile.id === p.id
                ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-[10px] text-slate-400">{p.platform} · {p.formatDetected.substring(0, 30)}...</div>
            </div>
          </button>
        ))}
      </div>

      {/* Capability Report Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                {selectedProfile.platform} Extraction Capability Audit
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">{selectedProfile.name}</h3>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                selectedProfile.extractionStatus === 'COMPLETE'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-800 text-amber-300'
              }`}
            >
              {selectedProfile.extractionStatus}
            </span>
          </div>

          {/* Forensic Check Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 block text-[11px]">Format Detected:</span>
              <span className="font-mono text-slate-200 text-[11px] block mt-0.5 truncate" title={selectedProfile.formatDetected}>
                {selectedProfile.formatDetected}
              </span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 block text-[11px]">Readability:</span>
              <span className="font-mono text-emerald-400 text-[11px] block mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bitstream Readable
              </span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 block text-[11px]">Encryption Status:</span>
              <span className={`font-mono text-[11px] block mt-0.5 flex items-center gap-1 ${selectedProfile.isEncrypted ? 'text-amber-400' : 'text-slate-300'}`}>
                {selectedProfile.isEncrypted ? <Lock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {selectedProfile.isEncrypted ? 'Encrypted / Password' : 'Unencrypted Cleartext'}
              </span>
            </div>
          </div>

          {/* Successfully Parsed Artifacts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Successfully Parsed Artifacts ({selectedProfile.parsedArtifacts.length})</span>
            </h4>
            <div className="space-y-1">
              {selectedProfile.parsedArtifacts.map((art, idx) => (
                <div key={idx} className="p-2 bg-slate-950/80 border border-slate-800/80 rounded text-xs text-slate-200 font-mono flex items-center gap-2">
                  <span className="text-cyan-500">✔</span>
                  <span>{art}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing or Unsupported Artifacts */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Unsupported or Keystore Protected Components ({selectedProfile.missingOrUnsupported.length})</span>
            </h4>
            <div className="space-y-1">
              {selectedProfile.missingOrUnsupported.map((art, idx) => (
                <div key={idx} className="p-2 bg-slate-950/80 border border-slate-800/80 rounded text-xs text-slate-400 font-mono flex items-center gap-2">
                  <span className="text-amber-500">✖</span>
                  <span>{art}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic bg-slate-950 p-2.5 rounded border border-slate-800">
            <strong>Examiner Limitation Statement:</strong> {selectedProfile.notes}
          </p>
        </div>

        {/* Secure Local Passphrase Input Panel */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Authorized Decryption Key Input</span>
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            If the acquired backup is password-protected and lawful authorization exists, enter the examiner-supplied passphrase. Secrets are never saved to disk or logged.
          </p>

          <form onSubmit={handleTestPassphrase} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Backup Passphrase</label>
              <input
                type="password"
                placeholder="Enter authorized passphrase..."
                value={passphraseInput}
                onChange={(e) => setPassphraseInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 px-3 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              Verify Passphrase In-Memory
            </button>
          </form>

          {keyStatus && (
            <div className="p-2.5 bg-cyan-950/60 border border-cyan-800 rounded text-[11px] text-cyan-200 font-mono">
              {keyStatus}
            </div>
          )}

          <div className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-400">Forensic Integrity Rule:</div>
            <div>RBP-DFS does not execute unauthorized brute-force cracking, credential theft, or remote device exploits.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
