'use client';
import { useState, useMemo } from 'react';
import entriesJson from '@/data/entries.json';
import type { Entry, MonthStats } from '@/data/types';
import Card from '@/components/ui/Card';
import EntriesLineChart from '@/components/charts/EntriesLineChart';
import CategoryBarChart from '@/components/charts/CategoryBarChart';
import FacultyBarChart from '@/components/charts/FacultyBarChart';
import SubjectPieChart from '@/components/charts/SubjectPieChart';
import { Download } from 'lucide-react';

const ALL = entriesJson as Entry[];
const MONTHS = ['Jan','Feb','Mar','Apr','May'];
const MONTH_IDX: Record<string, number> = { Jan:0, Feb:1, Mar:2, Apr:3, May:4 };

function parseHours(s: string): number { const [h,m] = (s||'0:00').split(':'); return Number(h)+(Number(m)||0)/60; }
function monthOf(d: string): string { return MONTHS[new Date(d).getMonth()] ?? ''; }

export default function ReportsPage() {
  const [fromMonth, setFromMonth] = useState('Jan');
  const [toMonth, setToMonth] = useState('May');

  const filtered = useMemo(() => {
    const fi = MONTH_IDX[fromMonth] ?? 0;
    const ti = MONTH_IDX[toMonth] ?? 4;
    return ALL.filter(e => { const mi = MONTH_IDX[monthOf(e.date)] ?? -1; return mi >= fi && mi <= ti; });
  }, [fromMonth, toMonth]);

  const entriesOverTime = useMemo<MonthStats[]>(() => {
    const range = MONTHS.slice(MONTH_IDX[fromMonth], (MONTH_IDX[toMonth] ?? 4)+1);
    return range.map(m => { const es = filtered.filter(e => monthOf(e.date)===m); return { month:m, count:es.length, approved:es.filter(e=>e.approvalStatus==='Approved').length, pending:es.filter(e=>e.approvalStatus==='Pending').length, rejected:es.filter(e=>e.approvalStatus==='Rejected').length }; });
  }, [filtered, fromMonth, toMonth]);

  const entriesByCategory = useMemo(() => {
    const m: Record<string,number> = {};
    filtered.forEach(e => { m[e.category] = (m[e.category]||0)+1; });
    return Object.entries(m).map(([category,count]) => ({category,count})).sort((a,b)=>b.count-a.count);
  }, [filtered]);

  const hoursByFaculty = useMemo(() => {
    const m: Record<string,number> = {};
    filtered.forEach(e => { m[e.SPOC_name] = (m[e.SPOC_name]||0)+parseHours(e.totalHours); });
    return Object.entries(m).map(([name,hours]) => ({name,hours:Math.round(hours*10)/10})).sort((a,b)=>b.hours-a.hours).slice(0,10);
  }, [filtered]);

  const subjectDist = useMemo(() => {
    const m: Record<string,number> = {};
    filtered.forEach(e => { m[e.subject] = (m[e.subject]||0)+1; });
    return Object.entries(m).map(([subject,count]) => ({subject,count})).sort((a,b)=>b.count-a.count).slice(0,8);
  }, [filtered]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a]">Reports & Analytics</h1>
          <p className="text-sm text-[#64748b]">Visualise faculty activity and approval trends</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#e2e8f0] rounded-lg px-3 py-2">
            <span className="text-xs text-[#94a3b8]">From</span>
            <select value={fromMonth} onChange={e => setFromMonth(e.target.value)} className="text-sm bg-transparent focus:outline-none cursor-pointer">{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
            <span className="text-xs text-[#94a3b8]">To</span>
            <select value={toMonth} onChange={e => setToMonth(e.target.value)} className="text-sm bg-transparent focus:outline-none cursor-pointer">{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-[#e2e8f0] bg-white rounded-lg hover:bg-[#f8fafc] text-[#64748b]"><Download size={14}/> Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Entries by Category"><CategoryBarChart data={entriesByCategory} /></Card>
        <Card title="Entries Over Time"><EntriesLineChart data={entriesOverTime} /></Card>
        <Card title="Hours by Faculty (Top 10)"><FacultyBarChart data={hoursByFaculty} /></Card>
        <Card title="Subject Distribution"><SubjectPieChart data={subjectDist} /></Card>
      </div>
    </div>
  );
}
