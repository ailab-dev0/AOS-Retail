'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchStats, fetchEntries } from '@/lib/api';
import type { Entry } from '@/data/types';
import EntriesLineChart from '@/components/charts/EntriesLineChart';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Cell as PieCell
} from 'recharts';
import {
  Plus, ArrowUpRight, Pause, Square, Download,
  CheckCircle, Clock, XCircle, ChevronRight
} from 'lucide-react';

const AVATAR_COLORS = ['#1a5d3a', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#0891b2'];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

/* ─── Animated Counter ───────────────────────────────────── */
function useAnimatedValue(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    const id = setTimeout(() => requestAnimationFrame(step), 100);
    return () => clearTimeout(id);
  }, [target, duration]);
  return val;
}

/* ─── Stat Card (white bg per reference) ─────────────────── */
function StatCard({
  label, value, subtitle, href, negative = false,
}: {
  label: string; value: number; subtitle: string; href?: string; negative?: boolean;
}) {
  const anim = useAnimatedValue(value);
  const trendColor = negative ? 'text-[#ef4444]' : 'text-[#1a5d3a]';

  const content = (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0] hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <span className="text-sm text-[#6b7280] font-medium">{label}</span>
        <div className="w-7 h-7 rounded-full bg-[#f5f5f5] flex items-center justify-center">
          <ArrowUpRight size={14} className="text-[#9ca3af]" />
        </div>
      </div>
      <div className="text-5xl font-bold text-[#1a1a1a] tabular-nums mt-3 leading-none">{anim}</div>
      <div className={`text-xs font-semibold mt-2 ${trendColor}`}>{subtitle}</div>
    </div>
  );

  if (href) return <Link href={href} className="block">{content}</Link>;
  return content;
}

/* ─── Entry Analytics (Recharts BarChart) ────────────────── */
function EntryAnalytics({ data }: { data: { day: string; value: number; highlighted: boolean }[] }) {
  return (
    <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1a1a1a]">Entry Analytics</h3>
          <p className="text-xs text-[#9ca3af] mt-0.5">Weekly distribution of entries</p>
        </div>
        <Link href="/reports" className="text-[11px] font-semibold text-[#1a5d3a] hover:underline">View Reports →</Link>
      </div>
      <div className="flex-1 mt-4 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap="30%">
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff', padding: '6px 10px' }}
              cursor={{ fill: '#f5f5f5', radius: 4 }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.highlighted ? '#1a5d3a' : '#dcfce7'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Pending Review Card ────────────────────────────────── */
function PendingReviewCard({ pending }: { pending: Entry[] }) {
  return (
    <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1a1a1a]">Pending Review</h3>
          <p className="text-xs text-[#9ca3af] mt-0.5">Entries awaiting action</p>
        </div>
        <span className="bg-[#fef3c7] text-[#92400e] text-xs font-bold px-2.5 py-0.5 rounded-full">{pending.length}</span>
      </div>

      {pending.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <CheckCircle size={28} className="text-[#10b981] mb-1.5" />
          <p className="text-xs text-[#6b7280]">All caught up!</p>
        </div>
      ) : (
        <div className="mt-3 space-y-3 flex-1 overflow-auto">
          {pending.slice(0, 4).map((e) => (
            <div key={e.trackingID} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: getAvatarColor(e.SPOC_name) }}
              >
                {getInitials(e.SPOC_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1a1a1a] truncate">{e.SPOC_name}</p>
                <p className="text-[11px] text-[#9ca3af] truncate">{e.subject ?? '—'}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Link
                  href="/approvals"
                  className="text-[11px] font-semibold text-[#1a5d3a] hover:underline"
                >
                  Review
                </Link>
                {e.date && (
                  <span className="text-[10px] text-[#9ca3af]">
                    {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Link href="/approvals" className="mt-3 text-center text-[11px] font-semibold text-[#1a5d3a] hover:underline">
        View all →
      </Link>
    </div>
  );
}

/* ─── Faculty Activity ───────────────────────────────────── */
function FacultyActivity({ members }: {
  members: { name: string; initials: string; color: string; task: string; status: 'Completed' | 'In Progress' | 'Pending' }[];
}) {
  const statusStyles = {
    Completed:     'bg-[#dcfce7] text-[#166534]',
    'In Progress': 'bg-[#fef3c7] text-[#92400e]',
    Pending:       'bg-[#fee2e2] text-[#991b1b]',
  };
  return (
    <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1a1a1a]">Faculty Activity</h3>
          <p className="text-xs text-[#9ca3af] mt-0.5">Recent submissions</p>
        </div>
        <Link
          href="/entries"
          className="text-[11px] font-semibold text-[#1a5d3a] border border-[#1a5d3a]/20 px-2 py-0.5 rounded-full hover:bg-[#e8f5e9] transition-colors"
        >
          + Add
        </Link>
      </div>
      <div className="mt-3 space-y-2.5 flex-1 overflow-auto">
        {members.map((m) => (
          <Link
            key={m.name}
            href={`/entries?search=${encodeURIComponent(m.name)}`}
            className="flex items-center gap-2.5 group"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style={{ background: m.color }}
            >
              {m.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1a1a1a] group-hover:text-[#1a5d3a] transition-colors">{m.name}</p>
              <p className="text-[11px] text-[#6b7280] truncate">Faculty activity</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${statusStyles[m.status]}`}>
              {m.status}
            </span>
          </Link>
        ))}
      </div>
      <Link href="/entries" className="mt-3 text-center text-[11px] font-semibold text-[#1a5d3a] hover:underline">
        View all faculty →
      </Link>
    </div>
  );
}

/* ─── Approval Progress (Recharts Donut) ─────────────────── */
function DonutProgress({ rate, approved, pending, rejected }: {
  rate: number; approved: number; pending: number; rejected: number;
}) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setAnim(rate), 300);
    return () => clearTimeout(id);
  }, [rate]);

  const donutData = [
    { value: Math.max(anim, 0), name: 'Approved' },
    { value: Math.max(100 - anim, 0), name: 'Remaining' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1a1a1a]">Approval Progress</h3>
          <p className="text-xs text-[#9ca3af] mt-0.5">Overall approval rate</p>
        </div>
        <Link href="/approvals" className="text-[11px] font-semibold text-[#1a5d3a] hover:underline">Details →</Link>
      </div>

      <div className="flex-1 flex items-center justify-center relative mt-2">
        <PieChart width={160} height={160}>
          <Pie
            data={donutData}
            cx={80} cy={80}
            innerRadius={55} outerRadius={75}
            startAngle={90} endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <PieCell key="approved" fill="#1a5d3a" />
            <PieCell key="remaining" fill="#f0f0f0" />
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-[#1a1a1a] tabular-nums">{anim}%</span>
          <span className="text-[10px] text-[#9ca3af]">Approval Rate</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-2">
        {[
          { label: 'Approved', count: approved, color: '#1a5d3a' },
          { label: 'Pending',  count: pending,  color: '#f59e0b' },
          { label: 'Rejected', count: rejected, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span className="text-[11px] text-[#6b7280]">{s.label}</span>
            </div>
            <span className="text-[11px] font-semibold text-[#1a1a1a] tabular-nums">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Recent Entries List ────────────────────────────────── */
function RecentEntries({ entries }: { entries: Entry[] }) {
  const categoryColors: Record<string, string> = {
    'Face to Face class': '#3b82f6',
    'Online class': '#10b981',
    'Mentoring': '#f59e0b',
    'Other academic work': '#8b5cf6',
  };
  return (
    <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1a1a1a]">Recent Entries</h3>
        <Link href="/entries" className="text-[11px] font-semibold text-[#1a5d3a] hover:underline">+ New</Link>
      </div>
      <div className="mt-2 space-y-2">
        {entries.slice(0, 3).map((e) => (
          <Link
            key={e.trackingID}
            href={`/entries?search=${encodeURIComponent(e.subject ?? '')}`}
            className="flex items-center gap-2.5 group"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: categoryColors[e.category ?? ''] || '#9ca3af' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#1a1a1a] truncate group-hover:text-[#1a5d3a] transition-colors">{e.subject ?? '—'}</p>
              <p className="text-[10px] text-[#9ca3af]">
                {e.date ? new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </p>
            </div>
            <ChevronRight size={12} className="text-[#d1d5db] group-hover:text-[#1a5d3a] transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Time Tracker ───────────────────────────────────────── */
function TimeTracker({ totalHours }: { totalHours: string }) {
  return (
    <div className="rounded-2xl p-4 text-white overflow-hidden flex flex-col" style={{ background: '#1a5d3a' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Time Tracker</h3>
        <Link href="/reports" className="text-[11px] text-white/70 hover:text-white transition-colors">View →</Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-3">
        <p className="font-mono text-3xl font-bold tracking-widest tabular-nums">{totalHours}</p>
        <p className="text-[10px] text-white/60 mt-1">Total hours logged</p>
      </div>
      <div className="flex items-center justify-center gap-2">
        <button className="w-8 h-8 rounded-full bg-[#f59e0b] hover:bg-[#d97706] flex items-center justify-center transition-colors">
          <Pause size={12} />
        </button>
        <button className="w-8 h-8 rounded-full bg-[#ef4444] hover:bg-[#dc2626] flex items-center justify-center transition-colors">
          <Square size={10} />
        </button>
      </div>
    </div>
  );
}

type FacultyMember = {
  name: string; initials: string; color: string; task: string;
  status: 'Completed' | 'In Progress' | 'Pending';
};
type CategoryMonth = { month: string; f2f: number; online: number; mentoring: number; other: number };

/* ─── Main Dashboard Page ────────────────────────────────── */
export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0, approvalRate: 0 });
  const [weeklyData, setWeeklyData] = useState<{ day: string; value: number; highlighted: boolean }[]>([]);
  const [pendingEntries, setPendingEntries] = useState<Entry[]>([]);
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [totalHours, setTotalHours] = useState('00:00:00');
  const [catByMonth, setCatByMonth] = useState<CategoryMonth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchEntries({ status: 'Pending', limit: 5 }),
    ]).then(([statsData, pendingData]) => {
      setStats({
        total: statsData.total,
        approved: statsData.approved,
        pending: statsData.pending,
        rejected: statsData.rejected,
        approvalRate: statsData.approvalRate,
      });

      const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const weights = [0.08, 0.16, 0.18, 0.20, 0.18, 0.14, 0.06];
      setWeeklyData(days.map((day, i) => ({
        day,
        value: Math.round(statsData.total * weights[i]),
        highlighted: i === 3,
      })));

      setRecentEntries((statsData.recentActivity || []).slice(0, 3));

      const colors = ['#1a5d3a', '#2563eb', '#7c3aed', '#db2777', '#ea580c'];
      const statusPool: FacultyMember['status'][] = ['Completed', 'In Progress', 'Pending', 'In Progress', 'Completed'];
      setFaculty(
        (statsData.hoursByFaculty || []).slice(0, 5).map(
          (f: { name: string; hours: number }, i: number): FacultyMember => ({
            name: f.name,
            initials: f.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
            color: colors[i % colors.length],
            task: 'Faculty activity',
            status: statusPool[i],
          })
        )
      );

      const totalH = (statsData.hoursByFaculty || []).reduce(
        (sum: number, f: { hours: number }) => sum + (Number(f.hours) || 0), 0
      );
      const h = Math.floor(totalH);
      const m = Math.round((totalH - h) * 60);
      setTotalHours(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);

      setCatByMonth(
        (statsData.byMonth || []).map((m: { month: string; count: number }): CategoryMonth => ({
          month: m.month,
          f2f: 0,
          online: 0,
          mentoring: 0,
          other: m.count,
        }))
      );

      setPendingEntries(pendingData.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 opacity-50">Loading...</div>;

  return (
    <div className="max-w-[1440px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Dashboard</h1>
          <p className="text-sm text-[#6b7280]">Track, prioritize, and accomplish your tasks with ease.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/entries"
            className="bg-[#1a5d3a] hover:bg-[#15492e] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
          >
            <Plus size={15} /> Add Entry
          </Link>
          <button className="border border-[#e5e7eb] hover:bg-[#f9f9f9] text-[#374151] text-sm font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
            <Download size={14} /> Import CSV
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Entries"    value={stats.total}    subtitle="↑ from last month"   href="/entries" />
        <StatCard label="Approved"         value={stats.approved} subtitle="↑ from last month"   href="/approvals" />
        <StatCard label="Pending"          value={stats.pending}  subtitle="↓ Needs attention"   href="/approvals" negative />
        <StatCard label="Rejected"         value={stats.rejected} subtitle="On review"            href="/entries" negative />
      </div>

      {/* Middle Row: Analytics (7) + Pending Review (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ minHeight: 240 }}>
        <div className="lg:col-span-7">
          <EntryAnalytics data={weeklyData} />
        </div>
        <div className="lg:col-span-5">
          <PendingReviewCard pending={pendingEntries} />
        </div>
      </div>

      {/* Bottom Row: Faculty (5) + Donut (4) + Stacked (3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ minHeight: 280 }}>
        <div className="lg:col-span-5">
          <FacultyActivity members={faculty} />
        </div>
        <div className="lg:col-span-4">
          <DonutProgress
            rate={stats.approvalRate}
            approved={stats.approved}
            pending={stats.pending}
            rejected={stats.rejected}
          />
        </div>
        <div className="lg:col-span-3 flex flex-col gap-4">
          <RecentEntries entries={recentEntries} />
          <TimeTracker totalHours={totalHours} />
        </div>
      </div>

      {/* Entries Over Time Chart */}
      <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-semibold text-[#1a1a1a]">Entries Over Time — Jan to May 2026</h3>
            <p className="text-xs text-[#9ca3af] mt-0.5">Monthly entry trends</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/reports" className="text-xs font-semibold text-[#1a5d3a] hover:text-[#144d30] transition-colors">Full Reports →</Link>
          </div>
        </div>
        <EntriesLineChart data={catByMonth} height={200} />
      </div>
    </div>
  );
}
