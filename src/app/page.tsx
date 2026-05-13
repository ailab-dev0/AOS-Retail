'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getStats, getThisWeekStats, getCategoryWithStatus,
  getCategoryByMonth, getSubjectDistribution,
} from '@/lib/data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Clock, CheckCircle, FileText, Users, ClipboardList } from 'lucide-react';
import EntriesLineChart from '@/components/charts/EntriesLineChart';

const CHART_H = 224;

const MONTHS = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026'];
const CATEGORIES = ['All', 'Face to Face class', 'Online class', 'Mentoring', 'Other academic work'];
const STATUSES = ['All Status', 'Pending', 'Approved', 'Rejected'];

type Period = 'today' | 'week' | 'month';

/* ─── Filter Bar ─────────────────────────────────────────── */
function FilterBar({
  period, onPeriod,
  from, onFrom,
  to, onTo,
  category, onCategory,
  status, onStatus,
  onApply, onReset,
}: {
  period: Period; onPeriod: (p: Period) => void;
  from: string; onFrom: (v: string) => void;
  to: string; onTo: (v: string) => void;
  category: string; onCategory: (v: string) => void;
  status: string; onStatus: (v: string) => void;
  onApply: () => void; onReset: () => void;
}) {
  const tabs: { key: Period; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week',  label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm px-5 py-2.5">
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Period tabs */}
        <div className="flex items-center bg-[#f8fafc] rounded-lg p-0.5 gap-0.5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => onPeriod(t.key)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors duration-150 ${
                period === t.key
                  ? 'bg-white text-[#0f172a] shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#64748b]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-[#e2e8f0]" />

        {/* Date range */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94a3b8] font-medium">From</span>
          <select
            value={from}
            onChange={e => onFrom(e.target.value)}
            className="text-xs font-medium text-[#0f172a] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 cursor-pointer"
          >
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          <span className="text-xs text-[#94a3b8] font-medium">To</span>
          <select
            value={to}
            onChange={e => onTo(e.target.value)}
            className="text-xs font-medium text-[#0f172a] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 cursor-pointer"
          >
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="w-px h-5 bg-[#e2e8f0]" />

        {/* Vertical (static) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94a3b8] font-medium">Vertical</span>
          <select
            disabled
            className="text-xs font-medium text-[#0f172a] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-2 py-1 focus:outline-none cursor-not-allowed opacity-70"
          >
            <option>Retail — All</option>
          </select>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94a3b8] font-medium">Category</span>
          <select
            value={category}
            onChange={e => onCategory(e.target.value)}
            className="text-xs font-medium text-[#0f172a] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 cursor-pointer"
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94a3b8] font-medium">Status</span>
          <select
            value={status}
            onChange={e => onStatus(e.target.value)}
            className="text-xs font-medium text-[#0f172a] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 cursor-pointer"
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Apply */}
        <button
          onClick={onApply}
          className="ml-auto px-3.5 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.97] text-white text-xs font-semibold rounded-lg transition-colors duration-150"
        >
          Apply
        </button>
      </div>

      {/* Reset row */}
      <div className="mt-1.5 pt-1.5 border-t border-[#f1f5f9]">
        <button
          onClick={onReset}
          className="text-xs font-medium text-[#94a3b8] hover:text-[#64748b] transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/* ─── Needs Your Attention ───────────────────────────────── */
function NeedsAttention({
  pending,
  byCategory,
}: {
  pending: number;
  byCategory: { category: string; pending: number }[];
}) {
  const rows = [
    { key: 'Face to Face class',  label: 'F2F',         color: '#3b82f6' },
    { key: 'Online class',        label: 'Online',      color: '#10b981' },
    { key: 'Other academic work', label: 'Forum/Other', color: '#eab308' },
    { key: 'Mentoring',           label: 'Mentoring',   color: '#f97316' },
  ];
  const map = Object.fromEntries(byCategory.map(d => [d.category, d.pending]));

  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col w-full h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f97316]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">
            Needs Your Attention
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-[#f0fdf4] text-[#16a34a] px-2 py-0.5 rounded-full">
          Today
        </span>
      </div>

      <div className="px-5 pt-5 pb-4">
        <div className="text-[56px] font-black leading-none text-[#dc2626] tabular-nums">
          {pending}
        </div>
        <div className="text-sm font-semibold text-[#dc2626] mt-1.5">
          {pending} Entrys Pending Approval
        </div>
        <div className="mt-3 inline-flex items-center bg-[#f8fafc] text-[#64748b] text-xs px-3 py-1 rounded-full">
          — same as yesterday
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between px-5 py-4 border-t border-[#f1f5f9]">
        {rows.map(r => (
          <div key={r.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
              <span className="text-sm text-[#64748b]">{r.label}</span>
            </div>
            <span className="text-sm font-semibold text-[#0f172a] tabular-nums">
              {map[r.key] ?? 0}
            </span>
          </div>
        ))}
      </div>

      <div className="px-5 pb-5">
        <Link
          href="/approvals"
          className="flex items-center justify-center gap-2 w-full bg-[#10b981] hover:bg-[#059669] active:scale-[0.98] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors duration-150"
        >
          <ClipboardList size={14} />
          Open Approval Queue
        </Link>
      </div>
    </div>
  );
}

/* ─── Approval Rate Donut ────────────────────────────────── */
function ApprovalDonut({
  rate, approved, pending, rejected,
}: {
  rate: number; approved: number; pending: number; rejected: number;
}) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / 900, 1);
      setAnim(Math.round(rate * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    const id = setTimeout(() => requestAnimationFrame(step), 200);
    return () => clearTimeout(id);
  }, [rate]);

  const R = 54, cx = 68, cy = 68;
  const circ = 2 * Math.PI * R;
  const filled = (anim / 100) * circ;

  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col w-full h-full p-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <h3 className="text-sm font-semibold text-[#0f172a]">Approval Rate</h3>
        <span className="text-[10px] font-bold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded-full">
          +2.6%
        </span>
      </div>

      {/* Donut — vertically centered in the remaining space */}
      <div className="flex-1 flex items-center justify-center">
        <svg width={136} height={136} viewBox="0 0 136 136">
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth={12} />
          <circle
            cx={cx} cy={cy} r={R} fill="none"
            stroke="#10b981" strokeWidth={12} strokeLinecap="round"
            strokeDasharray={`${Math.max(filled, anim === 0 ? 0 : 6)} ${circ}`}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="24" fontWeight="700" fill="#0f172a" fontFamily="Inter, sans-serif">
            {anim}%
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="Inter, sans-serif">
            Overall Rate
          </text>
        </svg>
      </div>

      {/* Stats — pinned to bottom */}
      <div className="grid grid-cols-3 text-center gap-2 pt-4 border-t border-[#f1f5f9] flex-shrink-0">
        {[
          { label: 'Approved', value: approved, color: '#10b981' },
          { label: 'Pending',  value: pending,  color: '#f97316' },
          { label: 'Rejected', value: rejected, color: '#ef4444' },
        ].map(s => (
          <div key={s.label}>
            <div className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[11px] text-[#94a3b8] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── This Week ──────────────────────────────────────────── */
function ThisWeek({ stats }: { stats: { entries: number; approved: number; hours: number; faculty: number } }) {
  const rows = [
    { icon: <FileText size={14} />,    label: 'Entries Added',  value: stats.entries,       delta: '+0%',  color: '#2563eb' },
    { icon: <CheckCircle size={14} />, label: 'Approved',       value: stats.approved,      delta: '+0%',  color: '#10b981' },
    { icon: <Clock size={14} />,       label: 'Total Hours',    value: `${stats.hours}h`,                  color: '#f97316' },
    { icon: <Users size={14} />,       label: 'Active Faculty', value: stats.faculty,       addBtn: true,  color: '#8b5cf6' },
  ] as const;

  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col w-full h-full p-5">
      <h3 className="text-sm font-semibold text-[#0f172a] flex-shrink-0">This Week</h3>

      {/* Rows fill the remaining height evenly */}
      <div className="flex-1 flex flex-col justify-between mt-4">
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between py-2 border-b border-[#f8fafc] last:border-0">
            <div className="flex items-center gap-2.5" style={{ color: r.color }}>
              {r.icon}
              <span className="text-sm text-[#64748b]">{r.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[#0f172a] tabular-nums">{r.value}</span>
              {'delta' in r && r.delta && (
                <span className="text-[10px] font-bold text-[#10b981] bg-[#f0fdf4] px-1.5 py-0.5 rounded-full">
                  {r.delta}
                </span>
              )}
              {'addBtn' in r && r.addBtn && (
                <button className="text-[10px] font-bold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe] px-1.5 py-0.5 rounded-full transition-colors">
                  +add
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function DashboardPage() {
  const [period, setPeriod]     = useState<Period>('week');
  const [from, setFrom]         = useState('Apr 2026');
  const [to, setTo]             = useState('May 2026');
  const [category, setCategory] = useState('All');
  const [status, setStatus]     = useState('All Status');

  const stats        = getStats();
  const weekStats    = getThisWeekStats();
  const categoryData = getCategoryWithStatus();
  const catByMonth   = getCategoryByMonth();
  const subjects     = getSubjectDistribution();

  const byCategory = categoryData.map(d => ({ category: d.category, pending: d.pending }));

  function handleReset() {
    setPeriod('week');
    setFrom('Apr 2026');
    setTo('May 2026');
    setCategory('All');
    setStatus('All Status');
  }

  return (
    <div className="space-y-4 max-w-[1400px]">
      <FilterBar
        period={period}   onPeriod={setPeriod}
        from={from}       onFrom={setFrom}
        to={to}           onTo={setTo}
        category={category} onCategory={setCategory}
        status={status}   onStatus={setStatus}
        onApply={() => {}}
        onReset={handleReset}
      />

      {/* Row 1: 3 equal-height columns */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <div className="min-w-0 h-full">
          <NeedsAttention pending={stats.pending} byCategory={byCategory} />
        </div>
        <div className="min-w-0 h-full">
          <ApprovalDonut
            rate={stats.approvalRate}
            approved={stats.approved}
            pending={stats.pending}
            rejected={stats.rejected}
          />
        </div>
        <div className="min-w-0 h-full">
          <ThisWeek stats={weekStats} />
        </div>
      </div>

      {/* Row 2: 2 equal-height columns — charts share the same CHART_H */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#0f172a]">
              Entries Over Time — Jan to May 2026
            </h3>
            <button className="text-xs font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
              Export →
            </button>
          </div>
          <EntriesLineChart data={catByMonth} height={CHART_H} />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#0f172a]">Entries by Subject</h3>
            <button className="text-xs font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
              View all →
            </button>
          </div>
          <ResponsiveContainer width="100%" height={CHART_H}>
            <BarChart data={subjects} margin={{ top: 4, right: 4, bottom: 32, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="subject"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={52}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#0f172a', border: 'none', borderRadius: 10,
                  fontSize: 12, color: '#fff', padding: '8px 12px',
                }}
                itemStyle={{ color: '#94a3b8' }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}
              />
              <Bar dataKey="count" name="Entries" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
