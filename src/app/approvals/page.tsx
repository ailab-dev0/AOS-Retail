'use client';
import { useState, useMemo, useEffect } from 'react';
import type { Entry, ApprovalStatus } from '@/data/types';
import { fetchEntries, updateEntry, bulkApproveEntries } from '@/lib/api';
import {
  CheckCircle, X, Clock, AlertCircle, Search, CheckSquare, Square,
  ChevronLeft, ChevronRight, Filter
} from 'lucide-react';

const CAT_PILL: Record<string, string> = {
  'Face to Face class': 'bg-blue-50 text-blue-700 border border-blue-100',
  'Online class': 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  'Mentoring': 'bg-amber-50 text-amber-700 border border-amber-100',
  'Other academic work': 'bg-purple-50 text-purple-700 border border-purple-100',
};
const CAT_LABEL: Record<string, string> = {
  'Face to Face class': 'F2F', 'Online class': 'Online', 'Mentoring': 'Mentoring', 'Other academic work': 'Other',
};

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface Toast { id: number; message: string; type: 'success' | 'error'; }

const STAT_THEMES = [
  { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', label: 'text-[#92400e]/80', sub: 'text-[#92400e]/70', iconBg: 'bg-[#92400e]/15' },
  { bg: 'bg-[#f3f4f6]', text: 'text-[#374151]', label: 'text-[#374151]/80', sub: 'text-[#374151]/70', iconBg: 'bg-[#374151]/15' },
  { bg: 'bg-[#dcfce7]', text: 'text-[#166534]', label: 'text-[#166534]/80', sub: 'text-[#166534]/70', iconBg: 'bg-[#166534]/15' },
] as const;

const CATEGORIES = ['All', 'Face to Face class', 'Online class', 'Mentoring', 'Other academic work'];
const PAGE_SIZE = 12;

export default function ApprovalsPage() {
  const [entries, setEntries]         = useState<Entry[]>([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState<'pending' | 'approved'>('pending');
  const [exiting, setExiting]         = useState<Set<string>>(new Set());
  const [toasts, setToasts]           = useState<Toast[]>([]);
  const [toastId, setToastId]         = useState(0);
  const [search, setSearch]           = useState('');
  const [cat, setCat]                 = useState('All');
  const [page, setPage]               = useState(1);
  const [selected, setSelected]       = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchEntries({ status: 'Pending', limit: 200 }),
      fetchEntries({ status: 'Approved', limit: 200 }),
    ]).then(([pendingRes, approvedRes]) => {
      setEntries([...(pendingRes.data || []), ...(approvedRes.data || [])]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const pending  = useMemo(() => entries.filter(e => e.approvalStatus === 'Pending'),  [entries]);
  const approved = useMemo(() => entries.filter(e => e.approvalStatus === 'Approved'), [entries]);
  const approvedToday = useMemo(() => approved.filter(e => (e.date ?? '') >= '2026-05-13').length, [approved]);

  const displayedRaw = tab === 'pending' ? pending : approved;
  const displayed = useMemo(() => {
    let data = displayedRaw;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(e => e.SPOC_name.toLowerCase().includes(q) || (e.subject ?? '').toLowerCase().includes(q) || e.trackingID.includes(q));
    }
    if (cat !== 'All') data = data.filter(e => e.category === cat);
    return data;
  }, [displayedRaw, search, cat]);

  const totalPages = Math.max(1, Math.ceil(displayed.length / PAGE_SIZE));
  const paged = displayed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = toastId + 1;
    setToastId(id);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const updateStatus = (trackingID: string, status: ApprovalStatus) => {
    const entry = entries.find(e => e.trackingID === trackingID);
    setExiting(s => new Set([...s, trackingID]));

    // Optimistic update after animation delay
    setTimeout(() => {
      setEntries(prev => prev.map(e => e.trackingID === trackingID ? { ...e, approvalStatus: status } : e));
      setExiting(s => { const n = new Set(s); n.delete(trackingID); return n; });
      addToast(status === 'Approved' ? 'Entry approved ✓' : 'Entry rejected', status === 'Approved' ? 'success' : 'error');
    }, 280);

    // Fire-and-forget API call
    if (entry?.id) {
      updateEntry(entry.id, { approval_status: status }).catch(() => {
        addToast('Failed to save to server', 'error');
      });
    }
  };

  const bulkApprove = () => {
    const numericIds = entries
      .filter(e => selected.has(e.trackingID) && e.id)
      .map(e => e.id as number);
    setEntries(prev => prev.map(e => selected.has(e.trackingID) ? { ...e, approvalStatus: 'Approved' } : e));
    addToast(`${selected.size} entries approved ✓`, 'success');
    setSelected(new Set());
    if (numericIds.length) {
      bulkApproveEntries(numericIds, 'Approved').catch(() => addToast('Failed to save some entries', 'error'));
    }
  };

  const bulkReject = () => {
    const numericIds = entries
      .filter(e => selected.has(e.trackingID) && e.id)
      .map(e => e.id as number);
    setEntries(prev => prev.map(e => selected.has(e.trackingID) ? { ...e, approvalStatus: 'Rejected' } : e));
    addToast(`${selected.size} entries rejected`, 'error');
    setSelected(new Set());
    if (numericIds.length) {
      bulkApproveEntries(numericIds, 'Rejected').catch(() => addToast('Failed to save some entries', 'error'));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map(e => e.trackingID)));
  };

  const statItems = [
    { label: 'Needs Action', value: pending.length, sub: 'Pending review', icon: AlertCircle },
    { label: 'Avg Wait', value: '2.3 days', sub: 'Average time', icon: Clock },
    { label: 'Done Today', value: approvedToday, sub: 'Approved today', icon: CheckCircle },
  ];

  if (loading) return <div className="p-8 opacity-50">Loading approvals…</div>;

  return (
    <div className="space-y-3 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Approvals</h1>
          <p className="text-xs text-[#6b7280] mt-0.5">Review and action pending faculty entries</p>
        </div>
      </div>

      {/* Big Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {statItems.map((s, i) => {
          const t = STAT_THEMES[i];
          return (
            <div key={s.label} className={`rounded-xl p-5 ${t.bg} ${t.text} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${t.label}`}>{s.label}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.iconBg}`}>
                  <s.icon size={16} />
                </div>
              </div>
              <div className={`text-[44px] font-bold mt-3 tabular-nums leading-none tracking-tight ${t.text}`}>
                {s.value}
              </div>
              <div className={`text-[11px] font-semibold mt-2 ${t.sub}`}>{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search faculty, subject..."
            className="w-full border border-[#eaeaea] rounded-xl pl-9 pr-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 focus:border-[#1a5d3a]/20 transition-all"
          />
        </div>
        <select
          value={cat} onChange={e => { setCat(e.target.value); setPage(1); }}
          className="border border-[#eaeaea] rounded-xl px-3 py-2 text-sm bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 cursor-pointer"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        {(search || cat !== 'All') && (
          <button onClick={() => { setSearch(''); setCat('All'); setPage(1); }} className="text-xs font-semibold text-[#ef4444] hover:underline">Clear</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#eaeaea] pb-0">
        {[
          { key: 'pending' as const, label: 'Pending', count: pending.length },
          { key: 'approved' as const, label: 'Approved', count: approved.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1); setSelected(new Set()); }}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors duration-150 rounded-t-xl ${tab===t.key ? 'text-[#1a5d3a]' : 'text-[#9ca3af] hover:text-[#6b7280]'}`}
          >
            {t.label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${tab===t.key ? 'bg-[#e8f5e9] text-[#1a5d3a]' : 'bg-[#f5f5f5] text-[#9ca3af]'}`}>{t.count}</span>
            {tab===t.key && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#1a5d3a] rounded-t" />}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && tab === 'pending' && (
        <div className="flex items-center justify-between bg-[#1a1a1a] text-white rounded-xl px-4 py-2.5 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <CheckSquare size={16} className="text-[#1a5d3a]" />
            <span className="text-sm font-semibold">{selected.size} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={bulkApprove} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
              <CheckCircle size={12} /> Approve All
            </button>
            <button onClick={bulkReject} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors">
              <X size={12} /> Reject All
            </button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button onClick={() => setSelected(new Set())} className="text-xs text-white/70 hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#eaeaea] overflow-hidden">
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in-up">
            <CheckCircle size={32} className="text-[#10b981] mb-2" />
            <p className="text-sm font-semibold text-[#6b7280]">All caught up!</p>
            <p className="text-xs text-[#9ca3af] mt-0.5">No {tab} entries right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#f5f5f5] bg-[#fafafa]">
                  {tab === 'pending' && (
                    <th className="text-left px-3 py-2.5 w-10">
                      <button onClick={toggleAll} className="text-[#9ca3af] hover:text-[#1a5d3a]">
                        {selected.size === paged.length && paged.length > 0 ? <CheckSquare size={16} className="text-[#1a5d3a]" /> : <Square size={16} />}
                      </button>
                    </th>
                  )}
                  {['ID','Faculty','Category','Subject','Hours','Submitted', tab==='pending'?'Actions':'Status'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((e, i) => (
                  <tr
                    key={e.trackingID}
                    className={`border-b border-[#f5f5f5] last:border-0 animate-fade-in-up ${exiting.has(e.trackingID) ? 'row-exiting' : 'hover:bg-[#fafafa]'} transition-colors duration-100 ${selected.has(e.trackingID) ? 'bg-[#e8f5e9]/40' : ''}`}
                    style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}
                  >
                    {tab === 'pending' && (
                      <td className="px-3 py-2.5">
                        <button onClick={() => toggleSelect(e.trackingID)} className="text-[#9ca3af] hover:text-[#1a5d3a]">
                          {selected.has(e.trackingID) ? <CheckSquare size={16} className="text-[#1a5d3a]" /> : <Square size={16} />}
                        </button>
                      </td>
                    )}
                    <td className="px-3 py-2.5 font-mono text-[11px] text-[#9ca3af]">AOS-{e.trackingID}</td>
                    <td className="px-3 py-2.5 font-medium text-[#1a1a1a]">{e.SPOC_name}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${CAT_PILL[e.category ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                        {CAT_LABEL[e.category ?? ''] ?? e.category ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[#6b7280] max-w-[140px] truncate">{e.subject ?? '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-[#6b7280]">{e.totalHours ?? '—'}</td>
                    <td className="px-3 py-2.5 text-[11px] text-[#9ca3af] whitespace-nowrap">{formatDate(e.createdDate)}</td>
                    <td className="px-3 py-2.5">
                      {tab === 'pending' ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => updateStatus(e.trackingID, 'Approved')}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle size={11}/> Approve
                          </button>
                          <button
                            onClick={() => updateStatus(e.trackingID, 'Rejected')}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                          >
                            <X size={11}/> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {paged.length > 0 && displayed.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-[#f5f5f5]">
            <span className="text-[11px] text-[#9ca3af] tabular-nums">
              {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, displayed.length)} of {displayed.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#eaeaea] disabled:opacity-30 hover:bg-[#f5f5f5] transition-colors">
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs font-medium rounded-lg border transition-colors ${p===page ? 'bg-[#1a5d3a] text-white border-[#1a5d3a]' : 'border-[#eaeaea] text-[#6b7280] hover:bg-[#f5f5f5]'}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#eaeaea] disabled:opacity-30 hover:bg-[#f5f5f5] transition-colors">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 space-y-2 z-50">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast-enter flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${t.type==='success' ? 'bg-[#1a5d3a]' : 'bg-[#ef4444]'}`}
          >
            {t.type==='success' ? <CheckCircle size={15}/> : <X size={15}/>}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
