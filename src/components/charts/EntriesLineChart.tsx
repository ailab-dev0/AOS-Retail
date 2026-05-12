'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MonthStats } from '@/data/types';
export default function EntriesLineChart({ data }: { data: MonthStats[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 12 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="count" name="Total" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="approved" name="Approved" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} />
        <Line type="monotone" dataKey="pending" name="Pending" stroke="#f97316" strokeWidth={2} strokeDasharray="4 4" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
