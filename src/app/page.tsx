'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchStats, fetchEntries } from '@/lib/api';
import type { Entry } from '@/data/types';
import EntriesLineChart from '@/components/charts/EntriesLineChart';
import {
  Plus, ArrowUpRight, Video, Pause, Square,
  CheckCircle, Clock, XCircle, Eye, ChevronRight
} from 'lucide-react';

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

/* ─── Stat Card ──────────────────────────────────────────── */
const THEMES = {
  green:   { bg: 'bg-[#1a5d3a]',   text: 'text-white', label: 'text-white/80', iconBg: 'bg-white/20', iconText: 'text-white', sub: 'text-white/70' },
  emerald: { bg: 'bg-[#dcfce7]',   text: 'text-[#166534]', label: 'text-[#166534]/80', iconBg: 'bg-[#166534]/15', iconText: 'text-[#166534]', sub: 'text-[#166534]/70' },
  amber:   { bg: 'bg-[#fef3c7]',   text: 'text-[#92400e]', label: 'text-[#92400e]/80', iconBg: 'bg-[#92400e]/15', iconText: 'text-[#92400e]', sub: 'text-[#92400e]/70' },
  rose:    { bg: 'bg-[#fee2e2]',   text: 'text-[#991b1b]', label: 'text-[#991b1b]/80', iconBg: 'bg-[#991b1b]/15', iconText: 'text-[#991b1b]', sub: 'text-[#991b1b]/70' },
} as const;

type ThemeKey = keyof typeof THEMES;

function StatCard({
  label, value, subtitle, icon: Icon, theme = 'green', href,
}: {
  label: string; value: number; subtitle: string;
  icon: React.ElementType; theme?: ThemeKey; href?: string;
}) {
  const anim = useAnimatedValue(value);
  const t = THEMES[theme];
  const content = (
    <div className={`relative rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${t.bg} ${t.text}`}>
      <div className="flex items-start justify-between">
        <span className={`text-sm font-semibold ${t.label}`}>{label}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.iconBg}`}>
          <ArrowUpRight size={16} className={t.iconText} />
        </div>
      </div>
      <div className={`text-[52px] font-bold mt-4 tabular-nums leading-none tracking-tight ${t.text}`}>
        {anim}
      </div>
      <div className={`flex items-center gap-1.5 mt-3 text-xs font-semibold ${t.sub}`}>
        <Icon size={14} />
        <span>{subtitle}</span>
      </div>
    </div>
  );
  if (href) return <Link href={href} className="block">{content}</Link>;
  return content;
}

/* ─── Weekly Analytics Bar Chart ─────────────────────────── */
function WeeklyAnalytics({ data }: { data: { day: string; value: number; highlighted: boolean }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-white rounded-xl border border-[#eaeaea] p-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1a1a1a]">Entry Analytics</h3>
        <Link href="/reports" className="text-[11px] font-semibold text-[#1a5d3a] hover:underline">View Reports →</Link>
      </div>
      <div className="flex-1 flex items-end justify-between gap-1 mt-3">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <div className="relative w-full flex justify-center">
              {d.highlighted && (
                <span className="absolute -top-5 text-[10px] font-bold text-[#1a5d3a] bg-[#e8f5e9] px-1 py-0.5 rounded">
                  {Math.round((d.value / max) * 100)}%
                </span>
              )}
              <div
                className={`w-full max-w-[28px] rounded-full transition-all duration-500 ${d.highlighted ? 'bg-[#1a5d3a]' : 'bg-[#e8f5e9]'}`}
                style={{ height: `${Math.max((d.value / max) * 120, 16)}px` }}
              />
            </div>
            <span className="text-[11px] text-[#9ca3af] font-medium">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Reminders Card ─────────────────────────────────────── */
function RemindersCard({ pending }: { pending: Entry[] }) {
  const next = pending[0];
  return (
    <div className="bg-white rounded-xl border border-[#eaeaea] p-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1a1a1a]">Reminders</h3>
        <Link href="/approvals" className="text-[11px] font-semibold text-[#1a5d3a] hover:underline">See all →</Link>
      </div>
      {next ? (
        <>
          <div className="mt-2">
            <p className="text-base font-semibold text-[#1a1a1a] leading-snug">
              Approve entry from {next.SPOC_name}
            </p>
            <p className="text-xs text-[#6b7280] mt-1">
              Subject: {next.subject ?? '—'}
            </p>
            <p className="text-[11px] text-[#9ca3af] mt-0.5">
              Due: {next.date ? new Date(next.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </p>
          </div>
          <Link
            href="/approvals"
            className="mt-auto flex items-center justify-center gap-2 w-full bg-[#1a5d3a] hover:bg-[#144d30] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors duration-150"
          >
            <Video size={14} />
            Review Approvals
          </Link>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <CheckCircle size={28} className="text-[#10b981] mb-1.5" />
          <p className="text-xs text-[#6b7280]">All caught up!</p>
        </div>
      )}
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
    <div className="bg-white rounded-xl border border-[#eaeaea] p-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1a1a1a]">Recent Entries</h3>
        <Link href="/entries" className="text-[11px] font-semibold text-[#1a5d3a] border border-[#1a5d3a]/20 px-2 py-0.5 rounded-full hover:bg-[#e8f5e9] transition-colors">
          + New
        </Link>
      </div>
      <div className="mt-2 space-y-2 flex-1 overflow-auto">
        {entries.slice(0, 5).map((e) => (
          <Link
            key={e.trackingID}
            href={`/entries?search=${encodeURIComponent(e.subject ?? '')}`}
            className="flex items-center gap-2.5 group"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${categoryColors[e.category ?? ''] || '#6b7280'}15` }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: categoryColors[e.category ?? ''] || '#6b7280' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1a1a1a] truncate group-hover:text-[#1a5d3a] transition-colors">{e.subject ?? '—'}</p>
              <p className="text-[11px] text-[#9ca3af]">
                {e.date ? new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </p>
            </div>
            <ChevronRight size={14} className="text-[#d1d5db] group-hover:text-[#1a5d3a] transition-colors" />
          </Link>
        ))}
      </div>
      <Link href="/entries" className="mt-3 text-center text-[11px] font-semibold text-[#1a5d3a] hover:underline">
        View all entries →
      </Link>
    </div>
  );
}

/* ─── Team Collaboration ─────────────────────────────────── */
function TeamCollaboration({ members }: {
  members: { name: string; initials: string; color: string; task: string; status: 'Completed' | 'In Progress' | 'Pending' }[];
}) {
  const statusStyles = {
    Completed: 'bg-[#e8f5e9] text-[#1a5d3a]',
    'In Progress': 'bg-[#fef3c7] text-[#b45309]',
    Pending: 'bg-[#fee2e2] text-[#b91c1c]',
  };
  return (
    <div className="bg-white rounded-xl border border-[#eaeaea] p-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1a1a1a]">Team Collaboration</h3>
        <Link href="/entries" className="text-[11px] font-semibold text-[#1a5d3a] border border-[#1a5d3a]/20 px-2 py-0.5 rounded-full hover:bg-[#e8f5e9] transition-colors">
          + Add
        </Link>
      </div>
      <div className="mt-2 space-y-2 flex-1 overflow-auto">
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
              <p className="text-[11px] text-[#6b7280] truncate">
                {m.task}
              </p>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${statusStyles[m.status]}`}>
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

/* ─── Approval Gauge ─────────────────────────────────────── */
function ApprovalGauge({ rate, approved, pending, rejected }: {
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

  const R = 60;
  const cx = 80;
  const cy = 80;
  const circ = Math.PI * R;
  const filled = (anim / 100) * circ;

  return (
    <div className="bg-white rounded-xl border border-[#eaeaea] p-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1a1a1a]">Approval Progress</h3>
        <Link href="/approvals" className="text-[11px] font-semibold text-[#1a5d3a] hover:underline">Details →</Link>
      </div>

      <div className="flex-1 flex items-center justify-center mt-1">
        <svg width={160} height={95} viewBox="0 0 160 95">
          <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="#f3f4f6" strokeWidth={14} strokeLinecap="round" />
          <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="#1a5d3a" strokeWidth={14} strokeLinecap="round" strokeDasharray={`${Math.max(filled, anim === 0 ? 0 : 8)} ${circ}`} />
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="24" fontWeight="700" fill="#1a1a1a" fontFamily="Inter, sans-serif">{anim}%</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="Inter, sans-serif">Overall Rate</text>
        </svg>
      </div>

      <div className="flex items-center justify-center gap-3 mt-1">
        {[
          { label: 'Approved', dot: 'bg-[#1a5d3a]', href: '/approvals' },
          { label: 'Pending', dot: 'bg-[#9ca3af]', href: '/approvals' },
          { label: 'Rejected', dot: 'bg-[#ef4444]', href: '/entries?status=Rejected' },
        ].map(s => (
          <Link key={s.label} href={s.href} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
            <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            <span className="text-[10px] text-[#6b7280]">{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Time Tracker ───────────────────────────────────────── */
function TimeTracker({ totalHours }: { totalHours: string }) {
  return (
    <Link href="/reports" className="block h-full">
      <div className="relative rounded-xl p-4 h-full text-white overflow-hidden flex flex-col" style={{ background: '#1a5d3a' }}>
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="waves" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 10 Q10 0 20 10 T40 10" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#waves)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Time Tracker</h3>
            <ChevronRight size={14} className="text-white/60" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-[36px] font-bold tabular-nums tracking-tight">{totalHours}</p>
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <button className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <Pause size={14} />
            </button>
            <button className="w-9 h-9 rounded-full bg-[#ef4444] hover:bg-[#dc2626] flex items-center justify-center transition-colors">
              <Square size={12} />
            </button>
          </div>
        </div>
      </div>
    </Link>
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

      // Approximate weekly distribution from total entries
      const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const weights = [0.08, 0.16, 0.18, 0.20, 0.18, 0.14, 0.06];
      setWeeklyData(days.map((day, i) => ({
        day,
        value: Math.round(statsData.total * weights[i]),
        highlighted: i === 2,
      })));

      setRecentEntries((statsData.recentActivity || []).slice(0, 5));

      const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];
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
    <div className="max-w-[1440px] mx-auto space-y-3">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Dashboard</h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Plan, prioritize, and accomplish your tasks with ease.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/entries" className="flex items-center gap-1.5 px-3 py-2 bg-[#1a5d3a] hover:bg-[#144d30] text-white text-xs font-semibold rounded-xl transition-colors">
            <Plus size={14} /> Add Entry
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#eaeaea] text-[#1a1a1a] text-xs font-semibold rounded-xl hover:bg-[#f5f5f5] transition-colors">
            Import Data
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Entries" value={stats.total} subtitle="Increased from last month" icon={ArrowUpRight} theme="green" href="/entries" />
        <StatCard label="Approved Entries" value={stats.approved} subtitle="Increased from last month" icon={CheckCircle} theme="emerald" href="/approvals" />
        <StatCard label="Pending Entries" value={stats.pending} subtitle="Needs your attention" icon={Clock} theme="amber" href="/approvals" />
        <StatCard label="Rejected Entries" value={stats.rejected} subtitle="On review" icon={XCircle} theme="rose" href="/entries" />
      </div>

      {/* Middle Row: Analytics | Reminders | Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-5"><WeeklyAnalytics data={weeklyData} /></div>
        <div className="lg:col-span-3"><RemindersCard pending={pendingEntries} /></div>
        <div className="lg:col-span-4"><RecentEntries entries={recentEntries} /></div>
      </div>

      {/* Bottom Row: Team | Gauge | Time Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-5"><TeamCollaboration members={faculty} /></div>
        <div className="lg:col-span-3">
          <ApprovalGauge rate={stats.approvalRate} approved={stats.approved} pending={stats.pending} rejected={stats.rejected} />
        </div>
        <div className="lg:col-span-4"><TimeTracker totalHours={totalHours} /></div>
      </div>

      {/* Entries Over Time Chart */}
      <div className="bg-white rounded-xl border border-[#eaeaea] p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-[#1a1a1a]">Entries Over Time — Jan to May 2026</h3>
          <div className="flex items-center gap-2">
            <Link href="/reports" className="text-xs font-semibold text-[#1a5d3a] hover:text-[#144d30] transition-colors">Full Reports →</Link>
            <button className="text-xs font-medium text-[#1a5d3a] hover:text-[#144d30] transition-colors">Export →</button>
          </div>
        </div>
        <EntriesLineChart data={catByMonth} height={200} />
      </div>
    </div>
  );
}
