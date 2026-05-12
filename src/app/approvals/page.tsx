'use client';
import { useState, useMemo, useEffect } from 'react';
import entriesJson from '@/data/entries.json';
import type { Entry, ApprovalStatus } from '@/data/types';
import { CheckCircle, X, Clock, AlertCircle } from 'lucide-react';

const CAT_PILL: Record<string, string> = {
  'Face to Face class': 'bg-cyan-50 text-cyan-700 border border-cyan-100',
  'Online class': 'bg-purple-50 text-purple-700 border border-purple-100',
  'Mentoring': 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  'Other academic work': 'bg-gray-100 text-gray-600 border border-gray-200',
};
const CAT_LABEL: Record<string, string> = {
  'Face to Face class': 'F2F', 'Online class': 'Online', 'Mentoring': 'Mentoring', 'Other academic work': 'Other',
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface Toast { id: number; message: string; type: 'success' | 'error'; }

export default function ApprovalsPage() {
  const [entries, setEntries]         = useState<Entry[]>(entriesJson as Entry[]);
  const [tab, setTab]                 = useState<'pending' | 'approved'>('pending');
  const [exiting, setExiting]         = useState<Set<string>>(new Set());
  const [toasts, setToasts]           = useState<Toast[]>([]);
  const [toastId, setToastId]         = useState(0);

  const pending  = useMemo(() => entries.filter(e => e.approvalStatus === 'Pending'),  [entries]);
  const approved = useMemo(() => entries.filter(e => e.approvalStatus === 'Approved'), [entries]);
  const approvedToday = useMemo(() => approved.filter(e => e.date >= '2026-05-13').length, [approved]);
  const displayed = tab === 'pending' ? pending : approved;

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = toastId + 1;
    setToastId(id);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const updateStatus = (trackingID: string, status: ApprovalStatus) => {
    setExiting(s => new Set([...s, trackingID]));
    setTimeout(() => {
      setEntries(prev => prev.map(e => e.trackingID === trackingID ? { ...e, approvalStatus: status } : e));
      setExiting(s => { const n = new Set(s); n.delete(trackingID); return n; });
      addToast(status === 'Approved' ? 'Entry approved ✓' : 'Entry rejected', status === 'Approved' ? 'success' : 'error');
    }, 280);
  };

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-[#0f172a]">Approvals</h1>
        <p className="text-xs text-[#94a3b8] mt-0.5">Review and action pending faculty entries</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Needs Action', value: pending.length, icon: <AlertCircle size={16}/>, color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200' },
          { label: 'Avg Wait',     value: '2.3 days',     icon: <Clock size={16}/>,       color: '#64748b', bg: 'bg-gray-50',   border: 'border-[#e2e8f0]' },
          { label: 'Done Today',   value: approvedToday,  icon: <CheckCircle size={16}/>, color: '#10b981', bg: 'bg-green-50',  border: 'border-green-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 animate-fade-in-scale card-lift`}>
            <div className="flex items-center gap-2 mb-1.5" style={{ color: s.color }}>{s.icon}<span className="text-xs font-semibold uppercase tracking-wider opacity-70">{s.label}</span></div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#f1f5f9] pb-0">
        {[
          { key: 'pending' as const, label: 'Pending', count: pending.length },
          { key: 'approved' as const, label: 'Approved', count: approved.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${tab===t.key ? 'text-[#2563eb]' : 'text-[#94a3b8] hover:text-[#64748b]'}`}
          >
            {t.label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${tab===t.key ? 'bg-[#eff6ff] text-[#2563eb]' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}>{t.count}</span>
            {tab===t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563eb] rounded-t" />}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#f8fafc] overflow-hidden">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
            <CheckCircle size={36} className="text-[#10b981] mb-3" />
            <p className="text-sm font-semibold text-[#64748b]">All caught up!</p>
            <p className="text-xs text-[#94a3b8] mt-1">No {tab} entries right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#f1f5f9] bg-[#fafbfc]">
                  {['ID','Faculty','Category','Subject','Hours','Submitted', tab==='pending'?'Actions':'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((e, i) => (
                  <tr
                    key={e.trackingID}
                    className={`border-b border-[#f8fafc] last:border-0 animate-fade-in-up ${exiting.has(e.trackingID) ? 'row-exiting' : 'hover:bg-[#f8fafc]'} transition-colors duration-100`}
                    style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#94a3b8]">AOS-{e.trackingID}</td>
                    <td className="px-4 py-3 font-medium text-[#0f172a]">{e.SPOC_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${CAT_PILL[e.category]}`}>{CAT_LABEL[e.category]}</span>
                    </td>
                    <td className="px-4 py-3 text-[#64748b] max-w-[140px] truncate">{e.subject}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{e.totalHours}</td>
                    <td className="px-4 py-3 text-xs text-[#94a3b8] whitespace-nowrap">{formatDate(e.createdDate)}</td>
                    <td className="px-4 py-3">
                      {tab === 'pending' ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => updateStatus(e.trackingID, 'Approved')}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-100"
                          >
                            <CheckCircle size={11}/> Approve
                          </button>
                          <button
                            onClick={() => updateStatus(e.trackingID, 'Rejected')}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-100"
                          >
                            <X size={11}/> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-600 border border-green-200">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 space-y-2 z-50">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast-enter flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${t.type==='success' ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}
          >
            {t.type==='success' ? <CheckCircle size={15}/> : <X size={15}/>}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
