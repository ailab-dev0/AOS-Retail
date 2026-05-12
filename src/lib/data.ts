import entriesJson from '@/data/entries.json';
import type { Entry, DashboardStats, MonthStats, WeekStatsData, FilterState } from '@/data/types';

const ALL = entriesJson as Entry[];
const MONTHS = ['Jan','Feb','Mar','Apr','May'];

function monthOf(d: string): string {
  return MONTHS[new Date(d).getMonth()] ?? '';
}
function parseHours(s: string): number {
  const [h, m] = (s || '0:00').split(':');
  return Number(h) + (Number(m) || 0) / 60;
}

export function getAllEntries(): Entry[] { return ALL; }

export function getFilteredEntries(f: Partial<FilterState>): Entry[] {
  return ALL.filter(e => {
    if (f.search) {
      const q = f.search.toLowerCase();
      if (!e.SPOC_name.toLowerCase().includes(q) && !e.subject.toLowerCase().includes(q) && !e.trackingID.includes(q)) return false;
    }
    if (f.category && f.category !== 'All' && e.category !== f.category) return false;
    if (f.status && f.status !== 'All' && e.approvalStatus !== f.status) return false;
    return true;
  });
}

export function getPendingEntries(): Entry[] { return ALL.filter(e => e.approvalStatus === 'Pending'); }

export function getStats(): DashboardStats {
  const total = ALL.length;
  const approved = ALL.filter(e => e.approvalStatus === 'Approved').length;
  const pending = ALL.filter(e => e.approvalStatus === 'Pending').length;
  const rejected = ALL.filter(e => e.approvalStatus === 'Rejected').length;
  return { total, approved, pending, rejected, approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0 };
}

export function getEntriesOverTime(): MonthStats[] {
  return MONTHS.map(m => {
    const es = ALL.filter(e => monthOf(e.date) === m);
    return { month: m, count: es.length, approved: es.filter(e => e.approvalStatus === 'Approved').length, pending: es.filter(e => e.approvalStatus === 'Pending').length, rejected: es.filter(e => e.approvalStatus === 'Rejected').length };
  });
}

export function getEntriesByCategory(): { category: string; count: number }[] {
  const m: Record<string, number> = {};
  ALL.forEach(e => { m[e.category] = (m[e.category] || 0) + 1; });
  return Object.entries(m).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
}

export function getCategoryWithStatus(): { category: string; total: number; approved: number; pending: number }[] {
  const m: Record<string, { total: number; approved: number; pending: number }> = {};
  ALL.forEach(e => {
    if (!m[e.category]) m[e.category] = { total: 0, approved: 0, pending: 0 };
    m[e.category].total++;
    if (e.approvalStatus === 'Approved') m[e.category].approved++;
    if (e.approvalStatus === 'Pending') m[e.category].pending++;
  });
  return Object.entries(m).map(([category, d]) => ({ category, ...d }));
}

export function getHoursByFaculty(): { name: string; hours: number }[] {
  const m: Record<string, number> = {};
  ALL.forEach(e => { m[e.SPOC_name] = (m[e.SPOC_name] || 0) + parseHours(e.totalHours); });
  return Object.entries(m).map(([name, hours]) => ({ name, hours: Math.round(hours * 10) / 10 })).sort((a, b) => b.hours - a.hours).slice(0, 10);
}

export function getSubjectDistribution(): { subject: string; count: number }[] {
  const m: Record<string, number> = {};
  ALL.forEach(e => { m[e.subject] = (m[e.subject] || 0) + 1; });
  return Object.entries(m).map(([subject, count]) => ({ subject, count })).sort((a, b) => b.count - a.count).slice(0, 8);
}

export function getRecentActivity(n = 8): Entry[] {
  return [...ALL].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()).slice(0, n);
}

export function getThisWeekStats(): WeekStatsData {
  const s = new Date('2026-05-01'), e2 = new Date('2026-05-07');
  const wk = ALL.filter(e => { const d = new Date(e.date); return d >= s && d <= e2; });
  return {
    entries: wk.length,
    approved: wk.filter(e => e.approvalStatus === 'Approved').length,
    pending: wk.filter(e => e.approvalStatus === 'Pending').length,
    hours: Math.round(wk.reduce((s, e) => s + parseHours(e.totalHours), 0)),
    faculty: new Set(wk.map(e => e.SPOC_name)).size,
  };
}
