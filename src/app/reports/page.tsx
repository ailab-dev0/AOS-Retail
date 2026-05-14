'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { MonthStats } from '@/data/types';
import { fetchStats } from '@/lib/api';
import CategoryBarChart from '@/components/charts/CategoryBarChart';
import FacultyBarChart from '@/components/charts/FacultyBarChart';
import SubjectPieChart from '@/components/charts/SubjectPieChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, BarChart2, TrendingUp, Users, BookOpen, FileText, CheckCircle, Clock, ChevronRight } from 'lucide-react';

function MonthlyLineChart({ data }: { data: MonthStats[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: 10, fontSize: 12, color: '#fff', padding: '8px 12px' }} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Line type="monotone" dataKey="count"    name="Total"    stroke="#1a5d3a" strokeWidth={2.5} dot={{ r: 3, fill: '#1a5d3a', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
        <Line type="monotone" dataKey="approved" name="Approved" stroke="#10b981" strokeWidth={2} strokeDasharray="5 4" dot={false} />
        <Line type="monotone" dataKey="pending"  name="Pending"  stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const MONTHS = ['Jan','Feb','Mar','Apr','May'];
const MONTH_NUMS: Record<string, number> = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };

const CHART_DEFS = [
  { id: 'entries-over-time', title: 'Entries Over Time',         icon: <TrendingUp size={14}/>,  color: '#1a5d3a', href: '/entries' },
  { id: 'by-category',       title: 'Entries by Category',       icon: <BarChart2 size={14}/>,   color: '#3b82f6', href: '/entries' },
  { id: 'hours-faculty',     title: 'Hours by Faculty (Top 10)', icon: <Users size={14}/>,       color: '#8b5cf6', href: '/entries' },
  { id: 'subject-dist',      title: 'Subject Distribution',      icon: <BookOpen size={14}/>,    color: '#f59e0b', href: '/entries' },
];

const STAT_THEMES = [
  { bg: 'bg-[#1a5d3a]', text: 'text-white', label: 'text-white/80', sub: 'text-white/70', iconBg: 'bg-white/20' },
  { bg: 'bg-[#dcfce7]', text: 'text-[#166534]', label: 'text-[#166534]/80', sub: 'text-[#166534]/70', iconBg: 'bg-[#166534]/15' },
  { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', label: 'text-[#92400e]/80', sub: 'text-[#92400e]/70', iconBg: 'bg-[#92400e]/15' },
  { bg: 'bg-[#fee2e2]', text: 'text-[#991b1b]', label: 'text-[#991b1b]/80', sub: 'text-[#991b1b]/70', iconBg: 'bg-[#991b1b]/15' },
] as const;

export default function ReportsPage() {
  const [fromM, setFromM] = useState('Jan');
  const [toM,   setToM]   = useState('May');
  const [statsData, setStatsData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then(setStatsData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredMonths = useMemo(() => {
    const allMonths = (statsData?.byMonth as { month: string; month_num: number; count: number; approved: number; pending: number; rejected: number }[]) || [];
    const from = MONTH_NUMS[fromM] ?? 1;
    const to   = MONTH_NUMS[toM]   ?? 12;
    return allMonths.filter(m => m.month_num >= from && m.month_num <= to);
  }, [statsData, fromM, toM]);

  const entriesOverTime = useMemo<MonthStats[]>(() => filteredMonths.map(m => ({
    month: m.month,
    count: m.count,
    approved: m.approved,
    pending: m.pending,
    rejected: m.rejected,
  })), [filteredMonths]);

  const byCategory = useMemo(() =>
    ((statsData?.byCategory as { category: string; count: number }[]) || []).map(c => ({ category: c.category, count: c.count })),
    [statsData]
  );

  const byFaculty = useMemo(() =>
    ((statsData?.hoursByFaculty as { name: string; hours: number }[]) || []).map(f => ({ name: f.name, hours: f.hours })),
    [statsData]
  );

  const bySubject: { subject: string; count: number }[] = [];

  const stats = useMemo(() => {
    const total    = filteredMonths.reduce((s, m) => s + m.count, 0);
    const approved = filteredMonths.reduce((s, m) => s + m.approved, 0);
    const pending  = filteredMonths.reduce((s, m) => s + m.pending, 0);
    const hours    = Math.round(
      ((statsData?.hoursByFaculty as { hours: number }[]) || []).reduce((s, f) => s + (Number(f.hours) || 0), 0)
    );
    return { total, approved, pending, hours };
  }, [filteredMonths, statsData]);

  const statItems = [
    { label: 'Total Entries', value: stats.total, sub: 'In selected range', icon: FileText },
    { label: 'Approved', value: stats.approved, sub: 'Cleared entries', icon: CheckCircle },
    { label: 'Pending', value: stats.pending, sub: 'Awaiting review', icon: Clock },
    { label: 'Hours', value: stats.hours, sub: 'Total hours', icon: TrendingUp },
  ];

  if (loading) return <div className="p-8 opacity-50">Loading reports…</div>;

  return (
    <div className="space-y-3 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Reports & Analytics</h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            {stats.total} entries · {fromM}–{toM} 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-[#eaeaea] rounded-xl px-3 py-2 text-sm">
            <select value={fromM} onChange={e=>setFromM(e.target.value)} className="bg-transparent text-[#1a1a1a] text-sm focus:outline-none cursor-pointer">
              {MONTHS.map(m=><option key={m}>{m}</option>)}
            </select>
            <span className="text-[#9ca3af] mx-1">→</span>
            <select value={toM} onChange={e=>setToM(e.target.value)} className="bg-transparent text-[#1a1a1a] text-sm focus:outline-none cursor-pointer">
              {MONTHS.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <button
            onClick={()=>alert('Export coming soon')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#1a5d3a] bg-[#e8f5e9] border border-[#1a5d3a]/20 rounded-xl hover:bg-[#d1fae5] transition-colors"
          >
            <Download size={14}/> Export
          </button>
        </div>
      </div>

      {/* Big Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statItems.map((s, i) => {
          const t = STAT_THEMES[i];
          return (
            <Link key={s.label} href="/entries" className="block">
              <div className={`rounded-xl p-5 ${t.bg} ${t.text} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}>
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
            </Link>
          );
        })}
      </div>

      {/* Quick nav chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-[#9ca3af] uppercase">Jump to:</span>
        <Link href="/entries" className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-[#eaeaea] text-[#6b7280] hover:border-[#1a5d3a]/30 transition-colors">All Entries</Link>
        <Link href="/approvals" className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-[#eaeaea] text-[#6b7280] hover:border-[#1a5d3a]/30 transition-colors">Pending Approvals</Link>
        <Link href="/entries?status=Approved" className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-[#eaeaea] text-[#6b7280] hover:border-[#1a5d3a]/30 transition-colors">Approved</Link>
        <Link href="/entries?status=Rejected" className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-[#eaeaea] text-[#6b7280] hover:border-[#1a5d3a]/30 transition-colors">Rejected</Link>
      </div>

      {/* 2x2 chart grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[
          { def: CHART_DEFS[0], chart: <MonthlyLineChart data={entriesOverTime} /> },
          { def: CHART_DEFS[1], chart: <CategoryBarChart data={byCategory} /> },
          { def: CHART_DEFS[2], chart: <FacultyBarChart data={byFaculty} /> },
          { def: CHART_DEFS[3], chart: <SubjectPieChart data={bySubject} /> },
        ].map(({ def, chart }, i) => (
          <Link key={def.id} href={def.href} className="block">
            <div className={`bg-white rounded-xl border border-[#eaeaea] overflow-hidden card-lift animate-fade-in-up stagger-${i+1} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}>
              <div className="flex items-center justify-between px-4 pt-3 pb-0">
                <div className="flex items-center gap-2">
                  <span style={{ color: def.color }}>{def.icon}</span>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">{def.title}</h3>
                </div>
                <ChevronRight size={14} className="text-[#d1d5db]" />
              </div>
              <div className="p-4 pt-2">{chart}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
