'use client';
import { useState, useMemo } from 'react';
import entriesJson from '@/data/entries.json';
import type { Entry, MonthStats } from '@/data/types';
import CategoryBarChart from '@/components/charts/CategoryBarChart';
import FacultyBarChart from '@/components/charts/FacultyBarChart';
import SubjectPieChart from '@/components/charts/SubjectPieChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, BarChart2, TrendingUp, Users, BookOpen } from 'lucide-react';

function MonthlyLineChart({ data }: { data: MonthStats[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 10, fontSize: 12, color: '#fff', padding: '8px 12px' }} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
        <Line type="monotone" dataKey="count"    name="Total"    stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
        <Line type="monotone" dataKey="approved" name="Approved" stroke="#10b981" strokeWidth={2} strokeDasharray="5 4" dot={false} />
        <Line type="monotone" dataKey="pending"  name="Pending"  stroke="#f97316" strokeWidth={2} strokeDasharray="5 4" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const ALL = entriesJson as Entry[];
const MONTHS = ['Jan','Feb','Mar','Apr','May'];
const MI: Record<string,number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4 };
function parseHours(s: string) { const [h,m]=(s||'0:00').split(':'); return Number(h)+Number(m)/60; }
function monthOf(d: string) { return MONTHS[new Date(d).getMonth()] ?? ''; }

const CHART_DEFS = [
  { id: 'entries-over-time', title: 'Entries Over Time',         icon: <TrendingUp size={14}/>,  color: '#2563eb' },
  { id: 'by-category',       title: 'Entries by Category',       icon: <BarChart2 size={14}/>,   color: '#06b6d4' },
  { id: 'hours-faculty',     title: 'Hours by Faculty (Top 10)', icon: <Users size={14}/>,       color: '#8b5cf6' },
  { id: 'subject-dist',      title: 'Subject Distribution',      icon: <BookOpen size={14}/>,    color: '#f97316' },
];

export default function ReportsPage() {
  const [fromM, setFromM] = useState('Jan');
  const [toM,   setToM]   = useState('May');

  const filtered = useMemo(() => {
    const fi = MI[fromM]??0, ti = MI[toM]??4;
    return ALL.filter(e => { const m = MI[monthOf(e.date)]??-1; return m>=fi && m<=ti; });
  }, [fromM, toM]);

  const entriesOverTime = useMemo<MonthStats[]>(() => {
    const range = MONTHS.slice(MI[fromM]??0, (MI[toM]??4)+1);
    return range.map(m => { const es = filtered.filter(e=>monthOf(e.date)===m); return { month:m, count:es.length, approved:es.filter(e=>e.approvalStatus==='Approved').length, pending:es.filter(e=>e.approvalStatus==='Pending').length, rejected:es.filter(e=>e.approvalStatus==='Rejected').length }; });
  }, [filtered, fromM, toM]);

  const byCategory = useMemo(() => { const m:Record<string,number>={}; filtered.forEach(e=>{m[e.category]=(m[e.category]||0)+1;}); return Object.entries(m).map(([category,count])=>({category,count})).sort((a,b)=>b.count-a.count); }, [filtered]);
  const byFaculty  = useMemo(() => { const m:Record<string,number>={}; filtered.forEach(e=>{m[e.SPOC_name]=(m[e.SPOC_name]||0)+parseHours(e.totalHours);}); return Object.entries(m).map(([name,hours])=>({name,hours:Math.round(hours*10)/10})).sort((a,b)=>b.hours-a.hours).slice(0,10); }, [filtered]);
  const bySubject  = useMemo(() => { const m:Record<string,number>={}; filtered.forEach(e=>{m[e.subject]=(m[e.subject]||0)+1;}); return Object.entries(m).map(([subject,count])=>({subject,count})).sort((a,b)=>b.count-a.count).slice(0,8); }, [filtered]);

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0f172a]">Reports & Analytics</h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            {filtered.length} entries · {fromM}–{toM} 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range */}
          <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm shadow-sm">
            <select value={fromM} onChange={e=>setFromM(e.target.value)} className="bg-transparent text-[#0f172a] text-sm focus:outline-none cursor-pointer">
              {MONTHS.map(m=><option key={m}>{m}</option>)}
            </select>
            <span className="text-[#94a3b8] mx-1">→</span>
            <select value={toM} onChange={e=>setToM(e.target.value)} className="bg-transparent text-[#0f172a] text-sm focus:outline-none cursor-pointer">
              {MONTHS.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <button
            onClick={()=>alert('Export coming soon')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors duration-150 shadow-sm"
          >
            <Download size={14}/> Export
          </button>
        </div>
      </div>

      {/* 2x2 chart grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { def: CHART_DEFS[0], chart: <MonthlyLineChart data={entriesOverTime} /> },
          { def: CHART_DEFS[1], chart: <CategoryBarChart data={byCategory} /> },
          { def: CHART_DEFS[2], chart: <FacultyBarChart data={byFaculty} /> },
          { def: CHART_DEFS[3], chart: <SubjectPieChart data={bySubject} /> },
        ].map(({ def, chart }, i) => (
          <div key={def.id} className={`bg-white rounded-xl shadow-sm border border-[#f8fafc] overflow-hidden card-lift animate-fade-in-up stagger-${i+1}`}>
            <div className="flex items-center gap-2.5 px-5 pt-4 pb-0">
              <span style={{ color: def.color }}>{def.icon}</span>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">{def.title}</h3>
            </div>
            <div className="p-5 pt-3">{chart}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
