'use client';
import { useState, useMemo } from 'react';
import entriesJson from '@/data/entries.json';
import type { Entry } from '@/data/types';
import Badge from '@/components/ui/Badge';
import CategoryPill from '@/components/ui/CategoryPill';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ALL = entriesJson as Entry[];
const PAGE_SIZE = 15;
const CATEGORIES = ['All', 'Face to Face class', 'Online class', 'Mentoring', 'Other academic work'];
const STATUSES = ['All', 'Pending', 'Approved', 'Rejected'];

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EntriesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return ALL.filter(e => {
      if (search) { const q = search.toLowerCase(); if (!e.SPOC_name.toLowerCase().includes(q) && !e.subject.toLowerCase().includes(q) && !e.trackingID.includes(q)) return false; }
      if (category !== 'All' && e.category !== category) return false;
      if (status !== 'All' && e.approvalStatus !== status) return false;
      return true;
    });
  }, [search, category, status]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const reset = () => { setSearch(''); setCategory('All'); setStatus('All'); setPage(1); };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#0f172a]">Entries</h1>
        <p className="text-sm text-[#64748b]">Manage and review all faculty entries</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by faculty, subject, ID…" className="w-full border border-[#e2e8f0] rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]" />
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={reset} className="px-3 py-2 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg bg-white hover:bg-[#f8fafc]">Reset</button>
        <span className="text-sm text-[#94a3b8] ml-auto">Showing {filtered.length} of {ALL.length}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
              {['ID','Faculty','Category','Subject','Hours','Date','Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">{h}</th>)}
            </tr></thead>
            <tbody>
              {paged.map((e, i) => (
                <tr key={i} className="border-b border-[#f8fafc] hover:bg-[#f8fafc] cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#94a3b8]">AOS-{e.trackingID}</td>
                  <td className="px-4 py-3 font-medium text-[#0f172a]">{e.SPOC_name}</td>
                  <td className="px-4 py-3"><CategoryPill category={e.category} /></td>
                  <td className="px-4 py-3 text-[#64748b] max-w-[160px] truncate">{e.subject}</td>
                  <td className="px-4 py-3 font-mono text-[#64748b] text-right">{e.totalHours}</td>
                  <td className="px-4 py-3 text-[#64748b] whitespace-nowrap">{formatDate(e.date)}</td>
                  <td className="px-4 py-3"><Badge status={e.approvalStatus} /></td>
                </tr>
              ))}
              {paged.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-[#94a3b8]">No entries match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#f1f5f9]">
          <span className="text-xs text-[#94a3b8]">Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="p-1.5 rounded border border-[#e2e8f0] disabled:opacity-40 hover:bg-[#f8fafc]"><ChevronLeft size={14}/></button>
            {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
              const p = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
              return <button key={p} onClick={() => setPage(p)} className={`px-2.5 py-1 text-xs rounded border ${p === page ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'border-[#e2e8f0] hover:bg-[#f8fafc]'}`}>{p}</button>;
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="p-1.5 rounded border border-[#e2e8f0] disabled:opacity-40 hover:bg-[#f8fafc]"><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
