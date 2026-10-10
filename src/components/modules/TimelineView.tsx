import React, { useState } from 'react';
import { TimelineEventItem } from '../../types/forensics';
import { CalendarDays, Filter, Download, ArrowUpDown, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatUtcDate } from '../../utils/crypto';

interface TimelineViewProps {
  timelineEvents: TimelineEventItem[];
  lang: 'en' | 'ar';
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timelineEvents, lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  const filtered = timelineEvents.filter((ev) => {
    return selectedCategory === 'ALL' || ev.category === selectedCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(a.utcTimestamp).getTime() - new Date(b.utcTimestamp).getTime();
    return sortOrder === 'ASC' ? diff : -diff;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">[11]</span>
            <h2 className="text-lg font-bold text-slate-100">
              {lang === 'ar' ? 'الجدول الزمني الموحد للتحقيق الجنائي' : 'Unified Chronological Investigation Timeline'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'تسلسل زمني موحد لجميع الآثار الرقمية وفق توقيت UTC مع توثيق المصدر ومستوى الثقة'
              : 'Multi-source normalized event model preserving original timezones, source artifacts, and confidence notes'}
          </p>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
          >
            <option value="ALL">All Categories ({timelineEvents.length})</option>
            <option value="MESSAGE">Messages</option>
            <option value="CALL">Calls</option>
            <option value="SYSTEM">System Logs</option>
            <option value="FILESYSTEM">Filesystem</option>
            <option value="MEDIA">Media / EXIF</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
            className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:bg-slate-800 flex items-center gap-1 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>{sortOrder === 'ASC' ? 'Oldest First' : 'Newest First'}</span>
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {sorted.map((ev, idx) => (
          <div key={ev.eventId} className="relative group">
            {/* Timeline Dot Marker */}
            <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-slate-950 shadow-sm shadow-cyan-500/50" />

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 transition-colors hover:border-slate-700 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-300 font-bold">{ev.eventId}</span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    {ev.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Source: <strong className="text-slate-300">{ev.sourceArtifact}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {formatUtcDate(ev.utcTimestamp)}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                    {ev.confidenceScore}% Confidence
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-100 font-sans leading-relaxed select-all">
                {ev.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                <div>
                  <span className="text-slate-500">Original Timestamp: </span>
                  <span className="text-slate-300">{ev.originalTimestamp}</span>
                </div>
                <div>
                  <span className="text-slate-500">Original Timezone: </span>
                  <span className="text-slate-300">{ev.originalTz}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Confidence Analysis: </span>
                  <span className="text-slate-300">{ev.confidenceNotes}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
