'use client';
import { useState, useEffect, useRef } from 'react';
import type { Entry } from '@/data/types';
import { fetchEntries, fetchCategories } from '@/lib/api';
import { Search, ChevronLeft, ChevronRight, AlertCircle, Users } from 'lucide-react';

const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected'];
const PAGE_SIZE = 50;

const AVATAR_COLORS = ['#1a5d3a', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#0891b2'];
function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
function avatarInitials(name: string) { return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(); }

const STATUS_BADGE: Record<string, string> = {
  Pending:  'bg-[#fef3c7] text-[#92400e]',
  Approved: 'bg-[#dcfce7] text-[#166534]',
  Rejected: 'bg-[#fee2e2] text-[#991b1b]',
};

const CAT_PILL: Record<string, string> = {
  'Face to Face class':  'bg-blue-50 text-blue-700 border border-blue-100',
  'Online class':        'bg-emerald-50 text-emerald-700 border border-emerald-100',
  'Mentoring':           'bg-amber-50 text-amber-700 border border-amber-100',
  'Other academic work': 'bg-purple-50 text-purple-700 border border-purple-100',
};

const CAT_LABEL: Record<string, string> = {
  'Face to Face class': 'F2F', 'Online class': 'Online',
  'Mentoring': 'Mentoring', 'Other academic work': 'Other',
};

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

export default function UsersPage() {
  const [entries, setEntries]           = useState<Entry[]>([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [search, setSearch]             = useState('');
  const [debouncedSearch, setDebounced] = useState('');
  const [category, setCategory]         = useState('All');
  const [status, setStatus]             = useState('All');
  const [categories, setCategories]     = useState<string[]>(['All']);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchCategories()
      .then(cats => setCategories(['All', ...cats]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchEntries({ search: debouncedSearch, category, status, page, limit: PAGE_SIZE })
      .then(res => { setEntries(res.data); setTotal(res.total); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [debouncedSearch, category, status, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);
  const isFiltered = debouncedSearch || category !== 'All' || status !== 'All';

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">All Entries</h1>
          <p className="text-sm text-[#6b7280]">Complete view of all faculty activity records</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-white rounded-xl border border-[#f0f0f0] shadow-sm px-4 py-2.5 flex items-center gap-2">
          <Users size={14} className="text-[#9ca3af]" />
          <span className="text-sm font-semibold text-[#1a1a1a]">{loading ? '…' : total.toLocaleString()}</span>
          <span className="text-xs text-[#9ca3af]">total entries</span>
        </div>
        {isFiltered && !loading && (
          <div className="bg-[#e8f5e9] rounded-xl border border-[#1a5d3a]/20 px-4 py-2.5 flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1a5d3a]">{entries.length}</span>
            <span className="text-xs text-[#1a5d3a]/70">shown (filtered)</span>
          </div>
        )}
        {isFiltered && (
          <button
            onClick={() => { setSearch(''); setCategory('All'); setStatus('All'); setPage(1); }}
            className="text-xs font-semibold text-[#ef4444] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-[340px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tracking ID, faculty, subject…"
            className="w-full border border-[#eaeaea] rounded-xl pl-9 pr-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 focus:border-[#1a5d3a]/20 transition-all"
          />
        </div>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="border border-[#eaeaea] rounded-xl px-3 py-2 text-sm bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 cursor-pointer"
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="border border-[#eaeaea] rounded-xl px-3 py-2 text-sm bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 cursor-pointer"
        >
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#9ca3af] text-sm">
            Loading entries…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <AlertCircle size={24} className="text-[#ef4444]" />
            <p className="text-sm font-semibold text-[#6b7280]">Failed to load entries</p>
            <p className="text-xs text-[#9ca3af]">{error}</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Users size={28} className="text-[#d1d5db]" />
            <p className="text-sm font-semibold text-[#6b7280]">No entries found</p>
            <p className="text-xs text-[#9ca3af]">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#f5f5f5] bg-[#fafafa]">
                  {['#', 'Tracking ID', 'Faculty (SPOC)', 'Subject', 'Category', 'Date', 'Hours', 'Status'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e.trackingID || i} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#f9fffe] transition-colors duration-100">
                    <td className="px-3 py-2.5 text-[11px] text-[#9ca3af] tabular-nums">{start + i}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-[#9ca3af]">AOS-{e.trackingID}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                          style={{ background: avatarColor(e.SPOC_name) }}
                        >
                          {avatarInitials(e.SPOC_name)}
                        </div>
                        <span className="font-medium text-[#1a1a1a] text-sm">{e.SPOC_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[#6b7280] max-w-[160px] truncate">{e.subject ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${CAT_PILL[e.category ?? ''] ?? 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        {CAT_LABEL[e.category ?? ''] ?? e.category ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-[#9ca3af] whitespace-nowrap">{formatDate(e.date)}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-[#6b7280]">{e.totalHours ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_BADGE[e.approvalStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                        {e.approvalStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {!loading && !error && entries.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-[#f5f5f5]">
            <span className="text-[11px] text-[#9ca3af] tabular-nums">
              Showing {start}–{end} of {total.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#eaeaea] disabled:opacity-30 hover:bg-[#f5f5f5] transition-colors"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startP = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = startP + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs font-medium rounded-lg border transition-colors ${p === page ? 'bg-[#1a5d3a] text-white border-[#1a5d3a]' : 'border-[#eaeaea] text-[#6b7280] hover:bg-[#f5f5f5]'}`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#eaeaea] disabled:opacity-30 hover:bg-[#f5f5f5] transition-colors"
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
