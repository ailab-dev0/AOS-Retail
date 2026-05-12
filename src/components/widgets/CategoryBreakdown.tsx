import { Users, Monitor, BookOpen, MoreHorizontal } from 'lucide-react';
const ICONS: Record<string, React.ReactNode> = {
  'Face to Face class': <Users size={14} className="text-cyan-600" />,
  'Online class': <Monitor size={14} className="text-purple-600" />,
  'Mentoring': <BookOpen size={14} className="text-yellow-600" />,
  'Other academic work': <MoreHorizontal size={14} className="text-gray-500" />,
};
interface CatData { category: string; total: number; approved: number; pending: number; }
export default function CategoryBreakdown({ data }: { data: CatData[] }) {
  return (
    <div className="space-y-4">
      {data.map(d => {
        const appPct = d.total > 0 ? Math.round((d.approved / d.total) * 100) : 0;
        const penPct = d.total > 0 ? Math.round((d.pending / d.total) * 100) : 0;
        const label = d.category.replace(' class', '').replace(' academic work', '');
        return (
          <div key={d.category}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">{ICONS[d.category]}<span className="text-sm text-[#0f172a] font-medium">{label}</span></div>
              <span className="text-xs text-[#94a3b8]">{d.total}</span>
            </div>
            <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden flex">
              <div className="bg-green-400 rounded-full transition-all" style={{ width: `${appPct}%` }} />
              <div className="bg-orange-400 rounded-full transition-all" style={{ width: `${penPct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
