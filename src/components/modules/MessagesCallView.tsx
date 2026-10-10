import React, { useState } from 'react';
import { MessageRecord, CallRecord } from '../../types/forensics';
import { MessageSquare, Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, Filter, AlertCircle } from 'lucide-react';
import { formatUtcDate } from '../../utils/crypto';

interface MessagesCallViewProps {
  messages: MessageRecord[];
  calls: CallRecord[];
  lang: 'en' | 'ar';
}

export const MessagesCallView: React.FC<MessagesCallViewProps> = ({
  messages,
  calls,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'MESSAGES' | 'CALLS'>('MESSAGES');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');

  const filteredMessages = messages.filter((m) => {
    const matchPlatform = selectedPlatform === 'ALL' || m.platform === selectedPlatform;
    const matchQuery =
      m.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.recipient.toLowerCase().includes(searchQuery.toLowerCase());
    return matchPlatform && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">[05]</span>
            <h2 className="text-lg font-bold text-slate-100">
              {lang === 'ar' ? 'سجلات الرسائل النصية والمكالمات الهاتفية' : 'Messages & Call Records Forensic Extraction'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'استخراج محادثات واتساب والرسائل القصيرة وسجلات المكالمات مع توثيق المصدر والجداول وقيد الاسترجاع'
              : 'Structured extraction of WhatsApp, SMS, and Call Logs preserving SQLite schema row IDs and timestamps'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-1">
          <button
            onClick={() => setActiveTab('MESSAGES')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'MESSAGES'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Messages ({messages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('CALLS')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'CALLS'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Records ({calls.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'MESSAGES' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search message bodies, participants, phone numbers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Platform:</span>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              >
                <option value="ALL">All Platforms</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="SMS">SMS / MMS</option>
                <option value="Signal">Signal</option>
              </select>
            </div>
          </div>

          {/* Messages Conversational Feed */}
          <div className="space-y-3">
            {filteredMessages.map((msg) => {
              const isSuspectSender = msg.sender.includes('Suspect');
              return (
                <div
                  key={msg.id}
                  className={`border rounded-lg p-4 transition-all ${
                    msg.isDeletedFragment
                      ? 'bg-amber-950/20 border-amber-800/60'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold">{msg.id}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {msg.platform}
                      </span>
                      {msg.isDeletedFragment && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> RECOVERED FREELIST REMNANT
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">
                      {formatUtcDate(msg.timestampUtc)}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 mb-2 gap-1 font-mono">
                    <div>
                      <span className="text-slate-500">From: </span>
                      <span className="text-slate-200 font-semibold">{msg.sender}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">To: </span>
                      <span className="text-slate-200 font-semibold">{msg.recipient}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-100 bg-slate-950/80 p-3 rounded border border-slate-800/80 leading-relaxed font-sans select-all">
                    {msg.body}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                    <span>Source: {msg.sourceTable} (Row #{msg.rowId})</span>
                    <span>Status: {msg.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Calls Log Table */
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>Call Records Log ({calls.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Call ID</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Telephone Number</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Carrier / Network</th>
                  <th className="py-2.5 px-3">Timestamp (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {calls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-cyan-300">{call.id}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {call.type === 'INCOMING' && (
                        <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                          <PhoneIncoming className="w-3 h-3" /> Incoming
                        </span>
                      )}
                      {call.type === 'OUTGOING' && (
                        <span className="flex items-center gap-1 text-cyan-400 font-mono text-[11px]">
                          <PhoneOutgoing className="w-3 h-3" /> Outgoing
                        </span>
                      )}
                      {call.type === 'MISSED' && (
                        <span className="flex items-center gap-1 text-rose-400 font-mono text-[11px]">
                          <PhoneMissed className="w-3 h-3" /> Missed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-200">{call.phoneNumber}</td>
                    <td className="py-3 px-3 text-slate-300">{call.contactName || 'Unknown'}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{call.durationSeconds}s</td>
                    <td className="py-3 px-3 text-slate-400">{call.carrier || 'N/A'}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{formatUtcDate(call.timestampUtc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
