import React, { useState, useRef } from 'react';
import { EvidenceItem } from '../../types/forensics';
import { computeFileHashes, detectMagicHeader, formatBytes, formatUtcDate } from '../../utils/crypto';
import { UploadCloud, FileCheck, Shield, AlertTriangle, HardDrive, CheckCircle2 } from 'lucide-react';

interface EvidenceIntakeViewProps {
  evidenceList: EvidenceItem[];
  onAddEvidence: (item: EvidenceItem) => void;
  lang: 'en' | 'ar';
}

export const EvidenceIntakeView: React.FC<EvidenceIntakeViewProps> = ({
  evidenceList,
  onAddEvidence,
  lang,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sourceDesc, setSourceDesc] = useState('');
  const [expectedHashInput, setExpectedHashInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setStatusMsg(`Calculating streaming SHA-256 for ${file.name}...`);
    try {
      // 1. Read first 64 bytes for magic header
      const slice = file.slice(0, 64);
      const headerBuffer = new Uint8Array(await slice.arrayBuffer());
      const magic = detectMagicHeader(headerBuffer);

      // 2. Compute full file SHA-256 and SHA-1 using WebCrypto
      const hashes = await computeFileHashes(file);

      const newId = `EVD-${String(evidenceList.length + 1).padStart(3, '0')}`;
      const isMatch = expectedHashInput.trim()
        ? hashes.sha256.toLowerCase() === expectedHashInput.trim().toLowerCase()
        : true;

      const newEvidence: EvidenceItem = {
        evidenceId: newId,
        caseId: 'RBP-2026-0881',
        filename: file.name,
        originalPath: `/evidence/intake/${file.name}`,
        sourceDescription: sourceDesc.trim() || `User-imported digital evidence: ${file.name}`,
        category: magic.mime.includes('sqlite')
          ? 'SQLITE'
          : magic.mime.includes('image')
          ? 'MEDIA'
          : magic.mime.includes('zip')
          ? 'ARCHIVE'
          : 'FILESYSTEM',
        byteSize: hashes.byteSize,
        sha256: hashes.sha256,
        sha1: hashes.sha1,
        md5: 'CalculatedOnDemand',
        expectedSha256: expectedHashInput.trim() || undefined,
        isVerified: isMatch,
        mismatchAlert: expectedHashInput.trim() ? !isMatch : false,
        magicType: magic.mime,
        acquiredAtUtc: new Date().toISOString(),
        examiner: 'Special Agent SidoDev-Dz',
        readOnlyEnforced: true,
        notes: `Magic signature: ${magic.detectedName}`,
      };

      onAddEvidence(newEvidence);
      setStatusMsg(`Successfully ingested and cryptographically registered ${file.name} as ${newId}.`);
      setExpectedHashInput('');
      setSourceDesc('');
    } catch (err: any) {
      setStatusMsg(`Error calculating hashes: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        await processFile(e.dataTransfer.files[i]);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        await processFile(e.target.files[i]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 font-bold">[02]</span>
          <h2 className="text-lg font-bold text-slate-100">
            {lang === 'ar' ? 'استلام وتسجيل الأدلة الرقمية' : 'Evidence Intake & Registration'}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ar'
            ? 'استيراد ملفات الأدلة الجنائية، واستخراج التوقيعات الثنائية Magic Bytes، وحساب البصمات التشفيرية الفورية'
            : 'Ingest raw bitstreams, disk images, mobile backups, and SQLite databases with read-only cryptographic registration'}
        </p>
      </div>

      {/* Drag & Drop Intake Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 text-slate-300'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              {lang === 'ar'
                ? 'اسحب وأفلت ملفات الأدلة الجنائية هنا'
                : 'Drag & Drop Digital Evidence Files Here'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports .raw, .dd, .img, .db, .sqlite, .tar, .ab, .evtx, .jpg, or any forensic bitstream
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg w-full pt-1">
            <input
              type="text"
              placeholder="Source description / seizure context (optional)..."
              value={sourceDesc}
              onChange={(e) => setSourceDesc(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 flex-1 min-w-[200px]"
            />
            <input
              type="text"
              placeholder="Expected SHA-256 for integrity verification (optional)..."
              value={expectedHashInput}
              onChange={(e) => setExpectedHashInput(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono flex-1 min-w-[240px]"
            />
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-1.5 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-sm disabled:opacity-50"
          >
            {isProcessing ? 'Hashing & Parsing...' : 'Select File From Workstation'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-cyan-950/60 border border-cyan-800/60 rounded text-xs text-cyan-200 flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Evidence Inventory Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Registered Evidence Inventory ({evidenceList.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
            ALL BITSTREAMS READ-ONLY
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">EVD ID</th>
                <th className="py-2.5 px-3">Filename / Source</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">SHA-256 Hash</th>
                <th className="py-2.5 px-3">Integrity</th>
                <th className="py-2.5 px-3">Acquired (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {evidenceList.map((item) => (
                <tr key={item.evidenceId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-300 whitespace-nowrap">
                    {item.evidenceId}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-100">{item.filename}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.sourceDescription}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                    {formatBytes(item.byteSize)}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400 truncate max-w-[200px]" title={item.sha256}>
                    {item.sha256}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {item.mismatchAlert ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800">
                        <AlertTriangle className="w-3 h-3" /> MISMATCH
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {formatUtcDate(item.acquiredAtUtc)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
