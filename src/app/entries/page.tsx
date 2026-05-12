'use client';
import { useState, useMemo } from 'react';
import entriesJson from '@/data/entries.json';
import type { Entry } from '@/data/types';
import { Search, ChevronLeft, ChevronRight, X, ChevronUp, ChevronDown } from 'lucide-react';

const ALL = entriesJson as Entry[];
const PAGE_SIZE = 15;
const CATEGORIES = ['All', 'Face to Face class', 'Online class', 'Mentoring', 'Other academic work'];
const STATUSES = ['All', 'Pending', 'Approved', 'Rejected'];

const CAT_PILL: Record<string, string> = {
  'Face to Face class': 'bg-cyan-50 text-cyan-700 border border-cyan-100',
  'Online class': 'bg-purple-50 text-purple-700 border border-purple-100',
  'Mentoring': 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  'Other academic work': 'bg-gray-100 text-gray-600 border border-gray-200',
};
const CAT_LABEL: Record<string, string> = {
  'Face to Face class': 'F2F', 'Online class': 'Online', 'Mentoring': 'Mentoring', 'Other academic work': 'Other',
};
const STATUS_PILL: Record<string, string> = {
  Pending: 'bg-orange-50 text-orange-600 border border-orange-200',
  Approved: 'bg-green-50 text-green-600 border border-green-200',
  Rejected: 'bg-red-50 text-red-600 border border-red-200',
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

type SortKey = 'SPOC_name' | 'date' | 'totalHours' | 'approvalStatus' | null;

export default function EntriesPage() {
  const [search, setSearch]   = useState('');
  const [cat, setCat]         = useState('All');
  const [status, setStatus]   = useState('All');
  const [page, setPage]       = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const activeFilters = [
    search && { key: 'search', label: `"${search}"` },
    cat !== 'All' && { key: 'cat', label: CAT_LABEL[cat] ?? cat },
    status !== 'All' && { key: 'status', label: status },
  ].filter(Boolean) as { key: string; label: string }[];

  const filtered = useMemo(() => {
    let data = ALL.filter(e => {
      if (search) { const q = search.toLowerCase(); if (!e.SPOC_name.toLowerCase().includes(q) && !e.subject.toLowerCase().includes(q) && !e.trackingID.includes(q)) return false; }
      if (cat !== 'All' && e.category !== cat) return false;
      if (status !== 'All' && e.approvalStatus !== status) return false;
      return true;
    });
    if (sortKey) {
      data = [...data].sort((a, b) => {
        const va = String(a[sortKey]), vb = String(b[sortKey]);
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return data;
  }, [search, cat, status, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const reset = () => { setSearch(''); setCat('All'); setStatus('All'); setPage(1); setSortKey(null); };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={11} className="text-[#2563eb]" /> : <ChevronDown size={11} className="text-[#2563eb]" />) : <ChevronUp size={11} className="text-[#cbd5e1] group-hover:text-[#94a3b8]" />;

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0f172a]">Entries</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">All faculty activity entries</p>
        </div>
        <div className="text-xs font-medium text-[#64748b] bg-white border border-[#e2e8f0] px-3 py-1.5 rounded-lg">
          {filtered.length} <span className="text-[#94a3b8]">of {ALL.length}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-[#f1f5f9]">
        <div className="flex flex-wrap gap-2.5 items-center p-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Faculty, subject, ID…"
              className="w-full border border-[#e2e8f0] rounded-lg pl-8 pr-3 py-2 text-sm text-[#0f172a] placeholder:text-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-150"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category */}
          <select
            value={cat} onChange={e => { setCat(e.target.value); setPage(1); }}
            className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm bg-white text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] cursor-pointer"
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>

          {/* Status */}
          <select
            value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm bg-white text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] cursor-pointer"
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>

          {activeFilters.length > 0 && (
            <button onClick={reset} className="flex items-center gap-1.5 text-xs font-medium text-[#94a3b8] hover:text-[#ef4444] border border-[#e2e8f0] rounded-lg px-3 py-2 transition-colors duration-150 bg-white">
              <X size={11} /> Clear all
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex gap-2 px-4 pb-3">
            {activeFilters.map(f => (
              <span key={f.key} className="inline-flex items-center gap-1 text-xs font-medium bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] px-2.5 py-1 rounded-full animate-fade-in-scale">
                {f.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#f1f5f9] overflow-hidden">
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in-up">
            <div className="w-12 h-12 rounded-full bg-[#f8fafc] flex items-center justify-center mb-3">
              <Search size={20} className="text-[#cbd5e1]" />
            </div>
            <p className="text-sm font-medium text-[#64748b]">No entries found</p>
            <p className="text-xs text-[#94a3b8] mt-1">Try adjusting your filters</p>
            <button onClick={reset} className="mt-4 text-xs font-medium text-[#2563eb] hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-[#f1f5f9] bg-[#fafbfc]">
                  {[
                    { label: 'ID', key: null },
                    { label: 'Faculty', key: 'SPOC_name' as SortKey },
                    { label: 'Category', key: null },
                    { label: 'Subject', key: null },
                    { label: 'Hours', key: 'totalHours' as SortKey },
                    { label: 'Date', key: 'date' as SortKey },
                    { label: 'Status', key: 'approvalStatus' as SortKey },
                  ].map(col => (
                    <th
                      key={col.label}
                      onClick={() => col.key && handleSort(col.key)}
                      className={`text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8] whitespace-nowrap ${col.key ? 'cursor-pointer group hover:text-[#64748b] select-none' : ''}`}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.key && <SortIcon k={col.key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((e, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc] transition-colors duration-100 group relative animate-fade-in-up"
                    style={{ animationDelay: `${Math.min(i, 10) * 20}ms` }}
                  >
                    {/* Left hover accent */}
                    <td className="relative px-4 py-3 font-mono text-xs text-[#94a3b8]">
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#2563eb] rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                      AOS-{e.trackingID}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0f172a]">{e.SPOC_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${CAT_PILL[e.category]}`}>
                        {CAT_LABEL[e.category] ?? e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#64748b] max-w-[160px] truncate" title={e.subject}>{e.subject}</td>
                    <td className="px-4 py-3 font-mono text-[#64748b] text-xs">{e.totalHours}</td>
                    <td className="px-4 py-3 text-[#64748b] text-xs whitespace-nowrap">{formatDate(e.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_PILL[e.approvalStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                        {e.approvalStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {paged.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#f8fafc]">
            <span className="text-xs text-[#94a3b8] tabular-nums">
              {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e2e8f0] disabled:opacity-30 hover:bg-[#f8fafc] transition-colors duration-100"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p} onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs font-medium rounded-lg border transition-colors duration-100 ${p===page ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]'}`}
                  >{p}</button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e2e8f0] disabled:opacity-30 hover:bg-[#f8fafc] transition-colors duration-100"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
