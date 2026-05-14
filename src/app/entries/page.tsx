'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { Entry } from '@/data/types';
import { fetchEntries, fetchStats, bulkApproveEntries } from '@/lib/api';
import {
  Search, ChevronLeft, ChevronRight, X, ChevronUp, ChevronDown,
  FileText, Filter, CheckCircle, Clock, Trash2, CheckSquare, Square,
  ArrowUpRight, Eye, MoreHorizontal
} from 'lucide-react';

const PAGE_SIZE = 15;
const CATEGORIES = ['All', 'Face to Face class', 'Online class', 'Mentoring', 'Other academic work'];
const STATUSES = ['All', 'Pending', 'Approved', 'Rejected'];

const CAT_PILL: Record<string, string> = {
  'Face to Face class': 'bg-blue-50 text-blue-700 border border-blue-100',
  'Online class': 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  'Mentoring': 'bg-amber-50 text-amber-700 border border-amber-100',
  'Other academic work': 'bg-purple-50 text-purple-700 border border-purple-100',
};
const CAT_LABEL: Record<string, string> = {
  'Face to Face class': 'F2F', 'Online class': 'Online', 'Mentoring': 'Mentoring', 'Other academic work': 'Other',
};
const STATUS_PILL: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border border-amber-100',
  Approved: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  Rejected: 'bg-rose-50 text-rose-700 border border-rose-100',
};

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

type SortKey = 'SPOC_name' | 'date' | 'totalHours' | 'approvalStatus' | null;

const STAT_THEMES = [
  { bg: 'bg-[#1a5d3a]', text: 'text-white', label: 'text-white/80', sub: 'text-white/70', iconBg: 'bg-white/20', filter: {} as Record<string,string> },
  { bg: 'bg-[#dcfce7]', text: 'text-[#166534]', label: 'text-[#166534]/80', sub: 'text-[#166534]/70', iconBg: 'bg-[#166534]/15', filter: { status: 'Approved' } },
  { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', label: 'text-[#92400e]/80', sub: 'text-[#92400e]/70', iconBg: 'bg-[#92400e]/15', filter: { status: 'Pending' } },
  { bg: 'bg-[#fee2e2]', text: 'text-[#991b1b]', label: 'text-[#991b1b]/80', sub: 'text-[#991b1b]/70', iconBg: 'bg-[#991b1b]/15', filter: {} as Record<string,string> },
] as const;

function EntriesPageInner() {
  const params = useSearchParams();
  const { data: session } = useSession();
  const [search, setSearch]   = useState(params.get('search') ?? '');
  const [cat, setCat]         = useState('All');
  const [status, setStatus]   = useState('All');
  const [page, setPage]       = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [entries, setEntries]     = useState<Entry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [statsData, setStatsData] = useState({ total: 0, approved: 0, pending: 0, hours: 0 });
  const [loading, setLoading]     = useState(true);

  // Fetch global stats once
  useEffect(() => {
    fetchStats()
      .then(s => setStatsData({
        total: s.total,
        approved: s.approved,
        pending: s.pending,
        hours: Math.round(
          (s.hoursByFaculty || []).reduce((sum: number, f: { hours: number }) => sum + (Number(f.hours) || 0), 0)
        ),
      }))
      .catch(console.error);
  }, []);

  const loadEntries = () => {
    setLoading(true);
    fetchEntries({ search, category: cat, status, page, limit: PAGE_SIZE })
      .then(res => {
        setEntries(res.data);
        setTotalCount(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Fetch entries when filters or page change
  useEffect(() => { loadEntries(); }, [search, cat, status, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBulkAction = async (newStatus: string) => {
    const approvedBy = session?.user?.name ?? 'Admin';
    const numericIds = entries
      .filter(e => selected.has(e.trackingID) && e.id)
      .map(e => e.id as number);
    if (!numericIds.length) return;
    setBulkLoading(true);
    try {
      await bulkApproveEntries(numericIds, newStatus, approvedBy);
      setSelected(new Set());
      loadEntries();
    } catch {
      // silent — API already logs
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const activeFilters = [
    search && { key: 'search', label: `"${search}"`, clear: () => setSearch('') },
    cat !== 'All' && { key: 'cat', label: CAT_LABEL[cat] ?? cat, clear: () => setCat('All') },
    status !== 'All' && { key: 'status', label: status, clear: () => setStatus('All') },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  // Sort within current page
  const sortedEntries = useMemo(() => {
    if (!sortKey) return entries;
    return [...entries].sort((a, b) => {
      const va = String(a[sortKey as keyof Entry] ?? '');
      const vb = String(b[sortKey as keyof Entry] ?? '');
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [entries, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const reset = () => { setSearch(''); setCat('All'); setStatus('All'); setPage(1); setSortKey(null); setSelected(new Set()); };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={11} className="text-[#1a5d3a]" /> : <ChevronDown size={11} className="text-[#1a5d3a]" />) : <ChevronUp size={11} className="text-[#d1d5db] group-hover:text-[#9ca3af]" />;

  const statItems = [
    { label: 'Total Entries', value: statsData.total, sub: 'Showing filtered', icon: FileText, filter: {} },
    { label: 'Approved', value: statsData.approved, sub: 'Cleared entries', icon: CheckCircle, filter: { status: 'Approved' } },
    { label: 'Pending', value: statsData.pending, sub: 'Needs action', icon: Clock, filter: { status: 'Pending' } },
    { label: 'Total Hours', value: statsData.hours, sub: 'Hours logged', icon: Filter, filter: {} },
  ];

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === sortedEntries.length) setSelected(new Set());
    else setSelected(new Set(sortedEntries.map(e => e.trackingID)));
  };

  const detailEntry = detailId ? sortedEntries.find(e => e.trackingID === detailId) : null;

  return (
    <div className="space-y-3 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Entries</h1>
          <p className="text-xs text-[#6b7280] mt-0.5">All faculty activity entries</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/entries" className="flex items-center gap-1.5 px-3 py-2 bg-[#1a5d3a] hover:bg-[#144d30] text-white text-xs font-semibold rounded-xl transition-colors">
            <FileText size={14} /> New Entry
          </Link>
        </div>
      </div>

      {/* Big Stat Cards - clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statItems.map((s, i) => {
          const t = STAT_THEMES[i];
          return (
            <button
              key={s.label}
              onClick={() => { if (s.filter.status) setStatus(s.filter.status); setPage(1); }}
              className={`text-left rounded-xl p-5 ${t.bg} ${t.text} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
            >
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
            </button>
          );
        })}
      </div>

      {/* Quick filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-[#9ca3af] uppercase">Quick filters:</span>
        {['Pending', 'Approved', 'Rejected'].map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${status === s ? 'bg-[#1a5d3a] text-white border-[#1a5d3a]' : 'bg-white text-[#6b7280] border-[#eaeaea] hover:border-[#1a5d3a]/30'}`}
          >
            {s}
          </button>
        ))}
        {['Face to Face class', 'Online class', 'Mentoring'].map(c => (
          <button
            key={c}
            onClick={() => { setCat(c); setPage(1); }}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${cat === c ? 'bg-[#1a5d3a] text-white border-[#1a5d3a]' : 'bg-white text-[#6b7280] border-[#eaeaea] hover:border-[#1a5d3a]/30'}`}
          >
            {CAT_LABEL[c]}
          </button>
        ))}
        {(status !== 'All' || cat !== 'All' || search) && (
          <button onClick={reset} className="text-[11px] font-semibold text-[#ef4444] hover:underline">Clear all</button>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-[#eaeaea]">
        <div className="flex flex-wrap gap-2 items-center p-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search faculty, subject, ID…"
              className="w-full border border-[#eaeaea] rounded-xl pl-9 pr-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 focus:border-[#1a5d3a]/20 transition-all"
            />
          </div>

          <select
            value={cat} onChange={e => { setCat(e.target.value); setPage(1); }}
            className="border border-[#eaeaea] rounded-xl px-3 py-2 text-sm bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 cursor-pointer"
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>

          <select
            value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="border border-[#eaeaea] rounded-xl px-3 py-2 text-sm bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 cursor-pointer"
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex gap-2 px-3 pb-2 flex-wrap">
            {activeFilters.map(f => (
              <span key={f.key} className="inline-flex items-center gap-1 text-xs font-semibold bg-[#e8f5e9] text-[#1a5d3a] border border-[#1a5d3a]/20 px-2 py-0.5 rounded-full">
                {f.label}
                <button onClick={f.clear} className="hover:text-[#991b1b]"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-[#1a1a1a] text-white rounded-xl px-4 py-2.5 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <CheckSquare size={16} className="text-[#1a5d3a]" />
            <span className="text-sm font-semibold">{selected.size} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('Approved')}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-lg transition-colors"
            >
              <CheckCircle size={12} /> Approve
            </button>
            <button
              onClick={() => handleBulkAction('Pending')}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 disabled:opacity-60 rounded-lg transition-colors"
            >
              <Clock size={12} /> Hold
            </button>
            <button
              onClick={() => handleBulkAction('Rejected')}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-lg transition-colors"
            >
              <Trash2 size={12} /> Reject
            </button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button onClick={() => setSelected(new Set())} className="text-xs text-white/70 hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#eaeaea] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-2 animate-pulse">
              <Search size={18} className="text-[#d1d5db]" />
            </div>
            <p className="text-sm font-medium text-[#6b7280]">Loading entries…</p>
          </div>
        ) : sortedEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in-up">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-2">
              <Search size={18} className="text-[#d1d5db]" />
            </div>
            <p className="text-sm font-medium text-[#6b7280]">No entries found</p>
            <p className="text-xs text-[#9ca3af] mt-0.5">Try adjusting your filters</p>
            <button onClick={reset} className="mt-3 text-xs font-semibold text-[#1a5d3a] hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-[#f5f5f5] bg-[#fafafa]">
                  <th className="text-left px-3 py-2.5 w-10">
                    <button onClick={toggleAll} className="text-[#9ca3af] hover:text-[#1a5d3a]">
                      {selected.size === sortedEntries.length && sortedEntries.length > 0 ? <CheckSquare size={16} className="text-[#1a5d3a]" /> : <Square size={16} />}
                    </button>
                  </th>
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
                      className={`text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] whitespace-nowrap ${col.key ? 'cursor-pointer group hover:text-[#6b7280] select-none' : ''}`}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.key && <SortIcon k={col.key} />}
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((e, i) => (
                  <tr
                    key={i}
                    className={`border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] transition-colors duration-100 group relative animate-fade-in-up ${selected.has(e.trackingID) ? 'bg-[#e8f5e9]/40' : ''}`}
                    style={{ animationDelay: `${Math.min(i, 10) * 20}ms` }}
                  >
                    <td className="px-3 py-2.5">
                      <button onClick={() => toggleSelect(e.trackingID)} className="text-[#9ca3af] hover:text-[#1a5d3a]">
                        {selected.has(e.trackingID) ? <CheckSquare size={16} className="text-[#1a5d3a]" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="relative px-3 py-2.5 font-mono text-[11px] text-[#9ca3af]">
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#1a5d3a] rounded-r opacity-0 group-hover:opacity-100 transition-opacity" />
                      AOS-{e.trackingID}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-[#1a1a1a]">
                      <button onClick={() => { setSearch(e.SPOC_name); setPage(1); }} className="hover:text-[#1a5d3a] hover:underline text-left">
                        {e.SPOC_name}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => { setCat(e.category ?? 'All'); setPage(1); }}>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${CAT_PILL[e.category ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                          {CAT_LABEL[e.category ?? ''] ?? e.category ?? '—'}
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-[#6b7280] max-w-[160px] truncate" title={e.subject ?? ''}>{e.subject ?? '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-[#6b7280] text-[11px]">{e.totalHours ?? '—'}</td>
                    <td className="px-3 py-2.5 text-[#6b7280] text-[11px] whitespace-nowrap">{formatDate(e.date)}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => { setStatus(e.approvalStatus); setPage(1); }}>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_PILL[e.approvalStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                          {e.approvalStatus}
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setDetailId(e.trackingID)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9ca3af] hover:text-[#1a5d3a] hover:bg-[#e8f5e9] transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && sortedEntries.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-[#f5f5f5]">
            <span className="text-[11px] text-[#9ca3af] tabular-nums">
              {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, totalCount)} of {totalCount}
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

      {/* Detail Drawer */}
      {detailEntry && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailId(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-slide-in-right" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#eaeaea]">
              <h2 className="text-lg font-bold text-[#1a1a1a]">Entry Detail</h2>
              <button onClick={() => setDetailId(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5] text-[#6b7280]">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-white font-bold">
                  {detailEntry.SPOC_name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-[#1a1a1a]">{detailEntry.SPOC_name}</div>
                  <div className="text-xs text-[#6b7280]">{detailEntry.category}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['Tracking ID', `AOS-${detailEntry.trackingID}`],
                  ['Subject', detailEntry.subject ?? '—'],
                  ['Category', detailEntry.category ?? '—'],
                  ['Sub-category', detailEntry.subCategory ?? '—'],
                  ['Hours', detailEntry.totalHours ?? '—'],
                  ['Date', detailEntry.date ?? '—'],
                  ['Status', detailEntry.approvalStatus],
                  ['Created', detailEntry.createdDate ?? '—'],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="bg-[#f5f5f5] rounded-xl p-3">
                    <div className="text-[10px] font-semibold text-[#9ca3af] uppercase">{label}</div>
                    <div className="text-sm font-medium text-[#1a1a1a] mt-1">{value}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Link href="/approvals" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1a5d3a] text-white text-sm font-semibold rounded-xl hover:bg-[#144d30] transition-colors">
                  Go to Approvals
                </Link>
                <button onClick={() => setDetailId(null)} className="flex-1 py-2.5 border border-[#eaeaea] text-sm font-semibold rounded-xl hover:bg-[#f5f5f5] transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EntriesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-3 max-w-[1440px] mx-auto">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-24 bg-white rounded-xl border border-[#eaeaea] animate-pulse" />
        <div className="h-96 bg-white rounded-xl border border-[#eaeaea] animate-pulse" />
      </div>
    }>
      <EntriesPageInner />
    </Suspense>
  );
}
