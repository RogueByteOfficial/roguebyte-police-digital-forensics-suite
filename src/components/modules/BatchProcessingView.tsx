import React, { useState } from 'react';
import { BatchJob } from '../../types/forensics';
import { Layers, Play, Pause, XCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatBytes } from '../../utils/crypto';

interface BatchProcessingViewProps {
  batchJobs: BatchJob[];
  lang: 'en' | 'ar';
}

export const BatchProcessingView: React.FC<BatchProcessingViewProps> = ({ batchJobs, lang }) => {
  const [jobs, setJobs] = useState<BatchJob[]>(batchJobs);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulateNewJob = () => {
    const newJob: BatchJob = {
      jobId: `JOB-${String(jobs.length + 1).padStart(3, '0')}`,
      evidenceName: `evidence_partition_ext4_${jobs.length + 1}.dd`,
      totalBytes: 8589934592,
      status: 'PENDING',
      progressPercent: 0,
      logs: ['00:00:00 - Enqueued in safe multi-threaded processing worker.'],
    };
    setJobs([...jobs, newJob]);
  };

  const handleRunQueue = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) => ({
          ...j,
          status: 'COMPLETED',
          progressPercent: 100,
          logs: [...j.logs, '100% completed. Cryptographic hash and headers confirmed.'],
        }))
      );
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">[17]</span>
            <h2 className="text-lg font-bold text-slate-100">
              {lang === 'ar' ? 'طابور المعالجة المجمعة للأدلة' : 'Batch Evidence Processing & Intake Queue'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'معالجة مجموعات الأدلة المتعددة بالتوازي مع نقاط فحص آمنة وسجلات معالجة تفصيلية'
              : 'Multi-evidence automated parser pipeline with progress tracking and interruption checkpoints'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateNewJob}
            className="px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            + Enqueue Evidence Task
          </button>
          <button
            onClick={handleRunQueue}
            disabled={isProcessing}
            className="px-3.5 py-1.5 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Process Queue</span>
          </button>
        </div>
      </div>

      {/* Queue Cards */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.jobId} className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-cyan-400 font-bold">{job.jobId}</span>
                <span className="font-semibold text-slate-100 font-mono">{job.evidenceName}</span>
                <span className="text-[11px] font-mono text-slate-400">({formatBytes(job.totalBytes)})</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  job.status === 'COMPLETED'
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                }`}
              >
                {job.status} ({job.progressPercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-cyan-500 h-full transition-all duration-300"
                style={{ width: `${job.progressPercent}%` }}
              />
            </div>

            {/* Job Log Console */}
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-slate-400 space-y-1">
              {job.logs.map((log, lIdx) => (
                <div key={lIdx} className="truncate">
                  {log}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
