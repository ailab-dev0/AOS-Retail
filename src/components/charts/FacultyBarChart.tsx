'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
const COLORS = ['#2563eb','#3b82f6','#06b6d4','#8b5cf6','#10b981','#f97316','#eab308','#ef4444','#64748b','#0f172a'];
export default function FacultyBarChart({ data }: { data: { name: string; hours: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" unit="h" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
        <Tooltip formatter={(v) => [`${v}h`, 'Hours']} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 12 }} />
        <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={14}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
