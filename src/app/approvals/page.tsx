'use client';
import { useState, useMemo } from 'react';
import entriesJson from '@/data/entries.json';
import type { Entry, ApprovalStatus } from '@/data/types';
import Badge from '@/components/ui/Badge';
import CategoryPill from '@/components/ui/CategoryPill';
import { CheckCircle, X } from 'lucide-react';

const INITIAL = (entriesJson as Entry[]);

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

type Tab = 'pending' | 'approved';

export default function ApprovalsPage() {
  const [entries, setEntries] = useState<Entry[]>(INITIAL);
  const [tab, setTab] = useState<Tab>('pending');

  const pending = useMemo(() => entries.filter(e => e.approvalStatus === 'Pending'), [entries]);
  const approved = useMemo(() => entries.filter(e => e.approvalStatus === 'Approved'), [entries]);
  const approvedToday = useMemo(() => approved.filter(e => e.date === '2026-05-13').length, [approved]);

  const updateStatus = (id: string, status: ApprovalStatus) => {
    setEntries(prev => prev.map(e => e.trackingID === id ? { ...e, approvalStatus: status } : e));
  };

  const displayed = tab === 'pending' ? pending : approved;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#0f172a]">Approvals</h1>
        <p className="text-sm text-[#64748b]">Review and action pending faculty entries</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
          <div className="text-2xl font-bold text-orange-600">{pending.length}</div>
          <div className="text-xs mt-0.5 opacity-70 text-orange-600">Total Pending</div>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
          <div className="text-2xl font-bold text-[#64748b]">2.3 days</div>
          <div className="text-xs mt-0.5 opacity-70 text-[#64748b]">Avg Wait Time</div>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <div className="text-2xl font-bold text-green-600">{approvedToday}</div>
          <div className="text-xs mt-0.5 opacity-70 text-green-600">Approved Today</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('pending')} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${tab==='pending' ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]'}`}>
          Pending ({pending.length})
        </button>
        <button onClick={() => setTab('approved')} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${tab==='approved' ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]'}`}>
          Approved ({approved.length})
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#94a3b8]">
            <CheckCircle size={40} className="text-green-400 mb-3" />
            <p className="font-medium text-[#64748b]">All caught up!</p>
            <p className="text-sm">No {tab} entries at the moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                {['ID','Faculty','Category','Subject','Hours','Submitted','Status', tab === 'pending' ? 'Actions' : ''].filter(Boolean).map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">{h}</th>)}
              </tr></thead>
              <tbody>
                {displayed.map((e, i) => (
                  <tr key={i} className="border-b border-[#f8fafc] hover:bg-[#f8fafc]">
                    <td className="px-4 py-3 font-mono text-xs text-[#94a3b8]">AOS-{e.trackingID}</td>
                    <td className="px-4 py-3 font-medium text-[#0f172a]">{e.SPOC_name}</td>
                    <td className="px-4 py-3"><CategoryPill category={e.category} /></td>
                    <td className="px-4 py-3 text-[#64748b] max-w-[140px] truncate">{e.subject}</td>
                    <td className="px-4 py-3 font-mono text-[#64748b]">{e.totalHours}</td>
                    <td className="px-4 py-3 text-[#64748b] whitespace-nowrap">{formatDate(e.createdDate)}</td>
                    <td className="px-4 py-3"><Badge status={e.approvalStatus} /></td>
                    {tab === 'pending' && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(e.trackingID, 'Approved')} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                            <CheckCircle size={12}/> Approve
                          </button>
                          <button onClick={() => updateStatus(e.trackingID, 'Rejected')} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                            <X size={12}/> Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
