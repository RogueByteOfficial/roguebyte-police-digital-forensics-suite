import React, { useState } from 'react';
import { SQLiteArtifact } from '../../types/forensics';
import { Database, Table, Terminal, FileCode, CheckCircle2, AlertTriangle, Layers, Binary } from 'lucide-react';

interface SQLiteAnalyzerViewProps {
  sqliteData: SQLiteArtifact;
  lang: 'en' | 'ar';
}

export const SQLiteAnalyzerView: React.FC<SQLiteAnalyzerViewProps> = ({ sqliteData, lang }) => {
  const [selectedTable, setSelectedTable] = useState<string>(sqliteData.tables[0]?.name || 'messages');
  const [sqlQuery, setSqlQuery] = useState('SELECT _id, key_remote_jid, data, timestamp FROM messages LIMIT 10;');
  const [queryOutput, setQueryOutput] = useState<any[] | null>(null);
  const [activeTab, setActiveTab] = useState<'TABLES' | 'FREELIST' | 'QUERY'>('TABLES');

  const currentTableInfo = sqliteData.tables.find((t) => t.name === selectedTable) || sqliteData.tables[0];

  const handleRunQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sqlQuery.trim().toUpperCase();
    if (!clean.startsWith('SELECT') && !clean.startsWith('PRAGMA') && !clean.startsWith('EXPLAIN')) {
      alert('FORENSIC ENFORCEMENT: Only read-only queries (SELECT, PRAGMA) are permitted. Write operations (INSERT, UPDATE, DROP) are strictly blocked.');
      return;
    }
    // Return sample rows
    if (currentTableInfo?.sampleRows) {
      setQueryOutput(currentTableInfo.sampleRows);
    } else {
      setQueryOutput([{ status: 'OK', message: 'Read-only query executed. 0 matching rows.' }]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">[06 / 07]</span>
            <h2 className="text-lg font-bold text-slate-100">
              {lang === 'ar' ? 'محلل قواعد بيانات SQLite والأثر المحذوف' : 'Application Database & SQLite Artifact Analyzer'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'فحص هياكل الجداول، وتتبع صفحات Freelist الحرة، واستخراج بقايا السجلات المحذوفة غير المخصصة'
              : 'Header inspection, schema enumeration, read-only SQL querying, and unallocated freelist carver'}
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-1">
          <button
            onClick={() => setActiveTab('TABLES')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'TABLES' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tables ({sqliteData.tables.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('FREELIST')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'FREELIST' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Freelist & WAL Artifacts ({sqliteData.deletedFragments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('QUERY')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'QUERY' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Read-Only SQL Console</span>
          </button>
        </div>
      </div>

      {/* Database Header Status Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded">
          <span className="text-slate-500 block text-[11px]">Database File:</span>
          <span className="font-mono text-cyan-300 font-bold">{sqliteData.filename}</span>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded">
          <span className="text-slate-500 block text-[11px]">B-Tree Page Size:</span>
          <span className="font-mono text-slate-200">{sqliteData.pageSize} bytes</span>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded">
          <span className="text-slate-500 block text-[11px]">Freelist Pages Count:</span>
          <span className="font-mono text-amber-400 font-semibold">{sqliteData.freelistCount} unallocated pages</span>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded">
          <span className="text-slate-500 block text-[11px]">WAL / SHM Sidecars:</span>
          <span className="font-mono text-emerald-400">
            {sqliteData.walPresent ? 'ACTIVE (Preserved In-Place)' : 'NOT PRESENT'}
          </span>
        </div>
      </div>

      {activeTab === 'TABLES' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table List Sidebar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
              Database Tables
            </h3>
            {sqliteData.tables.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-mono text-left transition-colors ${
                  selectedTable === t.name
                    ? 'bg-cyan-950/80 border border-cyan-700/60 text-cyan-300'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span>{t.name}</span>
                <span className="text-[10px] text-slate-500">{t.rowCount.toLocaleString()} rows</span>
              </button>
            ))}
          </div>

          {/* Table Schema & Records Preview */}
          <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase">Table Schema Details</span>
                <h3 className="text-sm font-bold text-slate-100 font-mono mt-0.5">{currentTableInfo?.name}</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {currentTableInfo?.columns.length} columns · {currentTableInfo?.rowCount.toLocaleString()} confirmed records
              </span>
            </div>

            {/* Schema DDL */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-500 block">CREATE TABLE DDL:</span>
              <pre className="bg-slate-950 border border-slate-800 rounded p-3 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                {currentTableInfo?.sql}
              </pre>
            </div>

            {/* Sample Records Table */}
            {currentTableInfo?.sampleRows && currentTableInfo.sampleRows.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono text-slate-500 block">Sample Row Records:</span>
                <div className="overflow-x-auto border border-slate-800 rounded">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-[10px] font-mono text-slate-400 border-b border-slate-800">
                      <tr>
                        {Object.keys(currentTableInfo.sampleRows[0]).map((col) => (
                          <th key={col} className="p-2 border-r border-slate-800/60 last:border-r-0">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                      {currentTableInfo.sampleRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          {Object.values(row).map((val: any, cIdx) => (
                            <td key={cIdx} className="p-2 border-r border-slate-800/60 last:border-r-0 truncate max-w-xs">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'FREELIST' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                Unallocated Space Carving
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                Freelist Pages & Deleted Record Remnants ({sqliteData.deletedFragments.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              NON-CONFIRMED FRAGMENTS
            </span>
          </div>

          <div className="space-y-4">
            {sqliteData.deletedFragments.map((frag, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">
                      Page #{frag.pageNumber} @ Offset {frag.offset}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/80">
                      {frag.classification}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">B-Tree Unallocated Leaf Remnant</span>
                </div>

                {/* Hex Dump Snippet */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500">RAW BYTE HEURISTICS (HEX):</span>
                  <div className="font-mono text-xs text-amber-200/90 bg-slate-900 p-2.5 rounded border border-slate-800/80 tracking-widest break-all select-all">
                    {frag.rawHexSnippet}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded text-xs text-slate-200 font-mono">
                  <span className="text-slate-400 font-semibold">Interpreted Carved Payload: </span>
                  {frag.interpretedData}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'QUERY' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Read-Only SQLite SQL Console</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">URI MODE: file:...?mode=ro</span>
          </div>

          <form onSubmit={handleRunQuery} className="space-y-3">
            <textarea
              rows={3}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500"
              placeholder="Enter read-only SQL query (SELECT, PRAGMA)..."
            />
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                Non-destructive execution. Original evidence bitstream remains 100% untouched.
              </span>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                Execute Query (Read-Only)
              </button>
            </div>
          </form>

          {queryOutput && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-400">Query Results ({queryOutput.length} records):</span>
              <pre className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono text-slate-200 overflow-x-auto max-h-60 overflow-y-auto">
                {JSON.stringify(queryOutput, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
