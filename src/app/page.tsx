'use client';
import { useEffect, useState, useRef } from 'react';
import { getStats, getEntriesOverTime, getThisWeekStats, getCategoryWithStatus, getRecentActivity } from '@/lib/data';
import type { MonthStats, WeekStatsData } from '@/data/types';
import EntriesLineChart from '@/components/charts/EntriesLineChart';
import { Clock, CheckCircle, FileText, TrendingUp, Users, BarChart2 } from 'lucide-react';

/* ─── Animated counter hook ─────────────────────────────── */
function useCounter(target: number, duration = 700, delay = 0) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (started.current) return;
      started.current = true;
      const startTime = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return value;
}

/* ─── KPI Card ───────────────────────────────────────────── */
function KPICard({
  title, value, raw, delta, deltaType = 'neutral', icon, accentColor, delay = 0
}: {
  title: string; value: string; raw: number; delta?: string;
  deltaType?: 'up' | 'down' | 'neutral'; icon: React.ReactNode;
  accentColor: string; delay?: number;
}) {
  const count = useCounter(raw, 700, delay);
  const display = raw > 0 && !value.includes('%') ? count.toString() : value;
  const deltaStyle = deltaType === 'up' ? 'text-[#10b981]' : deltaType === 'down' ? 'text-[#ef4444]' : 'text-[#94a3b8]';
  const deltaIcon = deltaType === 'up' ? '↑' : deltaType === 'down' ? '↓' : '';

  return (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm card-lift animate-fade-in-up border-l-4 stagger-${Math.min(delay/50, 4)}`}
      style={{ borderLeftColor: accentColor, animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">{title}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}18` }}>
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
      </div>
      <div className="text-3xl font-bold text-[#0f172a] tabular-nums animate-count-up leading-none">
        {value.includes('%') ? value : display}
      </div>
      {delta && (
        <div className={`text-xs font-medium mt-2 ${deltaStyle}`}>
          {deltaIcon} {delta} vs last month
        </div>
      )}
    </div>
  );
}

/* ─── Approval Gauge ─────────────────────────────────────── */
function ApprovalGauge({ rate, approvedCount, pendingCount }: { rate: number; approvedCount: number; pendingCount: number }) {
  const [animatedRate, setAnimatedRate] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / 900, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedRate(Math.round(rate * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    const id = setTimeout(() => requestAnimationFrame(step), 300);
    return () => clearTimeout(id);
  }, [rate]);

  const r = 68, cx = 100, cy = 88;
  const half = Math.PI * r;
  const filled = (animatedRate / 100) * half;
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div className="flex flex-col items-center pt-2 pb-1">
      <svg viewBox="0 0 200 100" className="w-full max-w-[180px]" overflow="visible">
        {/* Track */}
        <path d={d} fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
        {/* Fill — gradient */}
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <path
          d={d} fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${filled} ${half}`}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="26" fontWeight="700" fill="#0f172a" fontFamily="Inter, sans-serif">
          {animatedRate}%
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="Inter, sans-serif">
          Approval Rate
        </text>
      </svg>
      <div className="flex gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block" />
          <span className="text-xs text-[#64748b]">Approved <strong className="text-[#0f172a] font-semibold tabular-nums">{approvedCount}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#f97316] inline-block" />
          <span className="text-xs text-[#64748b]">Pending <strong className="text-[#0f172a] font-semibold tabular-nums">{pendingCount}</strong></span>
        </div>
      </div>
    </div>
  );
}

/* ─── Week Stats ─────────────────────────────────────────── */
function WeekStatsPanel({ stats }: { stats: WeekStatsData }) {
  const rows = [
    { icon: <FileText size={14} />, label: 'Entries', value: stats.entries, color: '#2563eb' },
    { icon: <CheckCircle size={14} />, label: 'Approved', value: stats.approved, color: '#10b981' },
    { icon: <Clock size={14} />, label: 'Hours', value: `${stats.hours}h`, color: '#f97316' },
    { icon: <Users size={14} />, label: 'Faculty', value: stats.faculty, color: '#8b5cf6' },
  ];
  return (
    <div className="divide-y divide-[#f8fafc]">
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
          <div className="flex items-center gap-2.5" style={{ color: r.color }}>
            {r.icon}
            <span className="text-sm text-[#64748b]">{r.label}</span>
          </div>
          <span className="text-sm font-semibold text-[#0f172a] tabular-nums">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Category Breakdown ─────────────────────────────────── */
function CategoryBreakdown({ data }: { data: { category: string; total: number; approved: number; pending: number }[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 200); return () => clearTimeout(t); }, []);
  const icons: Record<string, string> = {
    'Face to Face class': '👥', 'Online class': '💻', 'Mentoring': '📚', 'Other academic work': '📋',
  };
  return (
    <div className="space-y-4">
      {data.map(d => {
        const appPct = d.total > 0 ? (d.approved / d.total) * 100 : 0;
        const penPct = d.total > 0 ? (d.pending / d.total) * 100 : 0;
        const label = d.category.replace(' class','').replace(' academic work','');
        return (
          <div key={d.category}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{icons[d.category] ?? '📋'}</span>
                <span className="text-sm font-medium text-[#0f172a]">{label}</span>
              </div>
              <span className="text-xs font-semibold text-[#64748b] tabular-nums">{d.total}</span>
            </div>
            <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden flex">
              <div
                className="bg-[#10b981] rounded-full transition-all duration-700 ease-out"
                style={{ width: mounted ? `${appPct}%` : '0%' }}
              />
              <div
                className="bg-[#f97316] rounded-full transition-all duration-700 ease-out"
                style={{ width: mounted ? `${penPct}%` : '0%', transitionDelay: '100ms' }}
              />
            </div>
          </div>
        );
      })}
      <div className="flex gap-4 pt-1">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]" /><span className="text-xs text-[#94a3b8]">Approved</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f97316]" /><span className="text-xs text-[#94a3b8]">Pending</span></div>
      </div>
    </div>
  );
}

/* ─── Activity Feed ──────────────────────────────────────── */
function ActivityFeed({ entries }: { entries: import('@/data/types').Entry[] }) {
  const colors: Record<string, string> = {
    'Face to Face class': '#06b6d4', 'Online class': '#8b5cf6', 'Mentoring': '#eab308', 'Other academic work': '#94a3b8',
  };
  const labels: Record<string, string> = {
    'Face to Face class': 'F2F', 'Online class': 'Online', 'Mentoring': 'Mentoring', 'Other academic work': 'Other',
  };
  function timeAgo(s: string) {
    const diff = Math.floor((Date.now() - new Date(s).getTime()) / 86400000);
    if (diff === 0) return 'Today'; if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  return (
    <div className="space-y-1">
      {entries.map((e, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f8fafc] transition-colors duration-100 group animate-fade-in-up"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-150 group-hover:scale-125"
            style={{ background: colors[e.category] ?? '#94a3b8' }}
          />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-[#0f172a]">{e.SPOC_name}</span>
            <span className="text-xs text-[#94a3b8] ml-2">{labels[e.category] ?? e.category}</span>
          </div>
          <span className="text-xs text-[#94a3b8] tabular-nums flex-shrink-0">{timeAgo(e.createdDate)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Card wrapper ───────────────────────────────────────── */
function Card({ title, children, className = '', action }: { title?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-5 pt-3">{children}</div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function DashboardPage() {
  const stats        = getStats();
  const overtime     = getEntriesOverTime();
  const weekStats    = getThisWeekStats();
  const categoryData = getCategoryWithStatus();
  const recentActs   = getRecentActivity(8);

  const kpis = [
    { title: 'Pending Approval',  raw: stats.pending,      value: String(stats.pending),      icon: <Clock size={16}/>,      accentColor: '#f97316', delta: '+4', deltaType: 'down' as const, delay: 0   },
    { title: 'Total Entries',     raw: stats.total,        value: String(stats.total),        icon: <FileText size={16}/>,   accentColor: '#2563eb', delay: 50  },
    { title: 'Approved',          raw: stats.approved,     value: String(stats.approved),     icon: <CheckCircle size={16}/>, accentColor: '#10b981', delta: '+12', deltaType: 'up' as const, delay: 100 },
    { title: 'Approval Rate',     raw: stats.approvalRate, value: `${stats.approvalRate}%`,   icon: <TrendingUp size={16}/>, accentColor: '#8b5cf6', delta: '+2.1%', deltaType: 'up' as const, delay: 150 },
  ];

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Row 1: KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => <KPICard key={k.title} {...k} />)}
      </div>

      {/* Row 2: Chart + Gauge + Week */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Entries Over Time — Jan to May 2026" className="lg:col-span-2 animate-fade-in-up stagger-2">
          <EntriesLineChart data={overtime} />
        </Card>
        <div className="space-y-4">
          <Card title="Approval Rate" className="animate-fade-in-up stagger-3">
            <ApprovalGauge rate={stats.approvalRate} approvedCount={stats.approved} pendingCount={stats.pending} />
          </Card>
          <Card title="This Week" className="animate-fade-in-up stagger-4">
            <WeekStatsPanel stats={weekStats} />
          </Card>
        </div>
      </div>

      {/* Row 3: Category + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Category Breakdown" className="animate-fade-in-up">
          <CategoryBreakdown data={categoryData} />
        </Card>
        <Card title="Recent Activity" className="lg:col-span-2 animate-fade-in-up stagger-1">
          <ActivityFeed entries={recentActs} />
        </Card>
      </div>
    </div>
  );
}
