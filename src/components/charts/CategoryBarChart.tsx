'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
const COLORS = ['#2563eb','#06b6d4','#8b5cf6','#f97316'];
const Tip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-[#0f172a] text-white rounded-xl px-3 py-2 text-xs shadow-xl border border-white/10">
    <p className="text-white/60 mb-1">{payload[0]?.payload?.name ?? payload[0]?.payload?.category}</p>
    <p className="font-bold tabular-nums">{payload[0]?.value} entries</p>
  </div>
) : null;
export default function CategoryBarChart({ data }: { data: { category: string; count: number }[] }) {
  const d = data.map(x => ({ ...x, name: x.category.replace(' class','').replace(' academic work','') }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={d} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={76} />
        <Tooltip content={<Tip />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="count" radius={[0,6,6,0]} barSize={16} background={{ fill: '#f8fafc', radius: 6 }}>
          {d.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
