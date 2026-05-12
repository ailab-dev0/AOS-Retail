import { FileText, CheckCircle, Clock, Users } from 'lucide-react';
import type { WeekStatsData } from '@/data/types';
export default function WeekStats({ stats }: { stats: WeekStatsData }) {
  const rows = [
    { icon: <FileText size={14} className="text-[#2563eb]" />, label: 'Entries Added', value: stats.entries },
    { icon: <CheckCircle size={14} className="text-green-500" />, label: 'Approved', value: stats.approved },
    { icon: <Clock size={14} className="text-orange-500" />, label: 'Total Hours', value: `${stats.hours}h` },
    { icon: <Users size={14} className="text-purple-500" />, label: 'Active Faculty', value: stats.faculty },
  ];
  return (
    <div className="space-y-1">
      {rows.map(r => (
        <div key={r.label} className="flex items-center justify-between py-2 border-b border-[#f8fafc] last:border-0">
          <div className="flex items-center gap-2">{r.icon}<span className="text-sm text-[#64748b]">{r.label}</span></div>
          <span className="text-sm font-semibold text-[#0f172a]">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
