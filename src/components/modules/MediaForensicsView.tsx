import React from 'react';
import { MediaForensicItem } from '../../types/forensics';
import { Camera, MapPin, AlertTriangle, ShieldCheck, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { formatBytes, formatUtcDate } from '../../utils/crypto';

interface MediaForensicsViewProps {
  mediaItems: MediaForensicItem[];
  lang: 'en' | 'ar';
}

export const MediaForensicsView: React.FC<MediaForensicsViewProps> = ({ mediaItems, lang }) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 font-bold">[10]</span>
          <h2 className="text-lg font-bold text-slate-100">
            {lang === 'ar' ? 'التحقيق الجنائي في الوسائط الرقمية وبيانات EXIF' : 'Media Forensics & EXIF Analysis'}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ar'
            ? 'استخراج بيانات EXIF والكاميرا، وإحداثيات الموقع الجغرافي GPS، ورصد التعديلات البرمجية المصطنعة'
            : 'Extract camera hardware parameters, embedded GPS coordinates, and detect image editing tampering'}
        </p>
      </div>

      <div className="space-y-6">
        {mediaItems.map((item) => (
          <div key={item.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-cyan-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">{item.filename}</h3>
                  <div className="text-[11px] text-slate-400">
                    {item.mimeType} · {formatBytes(item.byteSize)} · SHA-256: {item.sha256.substring(0, 16)}...
                  </div>
                </div>
              </div>

              {item.softwareEditedAlert && (
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> SOFTWARE EDITING METADATA ALERT
                </span>
              )}
            </div>

            {/* EXIF Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                <span className="text-slate-500 block text-[11px]">Camera Hardware:</span>
                <span className="font-medium text-slate-200 mt-0.5 block">
                  {item.cameraMake} {item.cameraModel}
                </span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                <span className="text-slate-500 block text-[11px]">Software / Processor:</span>
                <span className="font-medium text-amber-300 mt-0.5 block">
                  {item.software || 'Original Firmware'}
                </span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                <span className="text-slate-500 block text-[11px]">Original EXIF Timestamp:</span>
                <span className="font-mono text-cyan-300 mt-0.5 block">
                  {item.dateTimeOriginalUtc ? formatUtcDate(item.dateTimeOriginalUtc) : 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                <span className="text-slate-500 block text-[11px]">Altitude:</span>
                <span className="font-mono text-slate-200 mt-0.5 block">
                  {item.gpsAltitude || 'Not Recorded'}
                </span>
              </div>
            </div>

            {/* Geolocation Section */}
            {item.gpsLatitude && item.gpsLongitude && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <MapPin className="w-4 h-4" />
                    <span>Embedded GPS Geolocation Coordinates:</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${item.gpsLatitude},${item.gpsLongitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Inspect Coordinates Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="font-mono text-xs text-slate-200 p-2.5 bg-slate-900 rounded border border-slate-800 flex flex-wrap gap-4">
                  <div>
                    <span className="text-slate-500">Latitude: </span>
                    <span className="text-cyan-300 font-semibold">{item.gpsLatitude}° N</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Longitude: </span>
                    <span className="text-cyan-300 font-semibold">{item.gpsLongitude}° E</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Coordinate Datum: </span>
                    <span className="text-slate-300">WGS-84 World Geodetic System</span>
                  </div>
                </div>
              </div>
            )}

            {/* Forensic Inconsistency Statement */}
            {item.inconsistencyNotes && (
              <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded text-xs text-amber-200 space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Metadata Inconsistency Review:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">{item.inconsistencyNotes}</p>
                <p className="text-[10px] text-slate-500 italic pt-1">
                  Legal Caveat: EXIF timestamps and coordinates must never be treated as definitive proof without corroborating network and physical evidence.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
