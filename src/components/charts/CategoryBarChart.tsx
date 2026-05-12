'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
const COLORS = ['#2563eb','#06b6d4','#8b5cf6','#f97316'];
export default function CategoryBarChart({ data }: { data: { category: string; count: number }[] }) {
  const shortened = data.map(d => ({ ...d, name: d.category.replace(' class','').replace(' academic work','') }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={shortened} layout="vertical" margin={{ left: 0, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
        <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 12 }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
          {shortened.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
