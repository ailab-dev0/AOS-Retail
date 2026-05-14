import type { Entry } from '@/data/types';
const DOT_COLORS: Record<string, string> = { 'Face to Face class': 'bg-cyan-400', 'Online class': 'bg-purple-400', 'Mentoring': 'bg-yellow-400', 'Other academic work': 'bg-gray-400' };
const CAT_LABELS: Record<string, string> = { 'Face to Face class': 'F2F Class', 'Online class': 'Online Class', 'Mentoring': 'Mentoring', 'Other academic work': 'Other' };
function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'Today'; if (diff === 1) return 'Yesterday'; if (diff < 7) return `${diff}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
export default function ActivityFeed({ entries }: { entries: Entry[] }) {
  return (
    <div className="space-y-3">
      {entries.map((e, i) => (
        <div key={i} className="flex items-start gap-3 py-2 border-b border-[#f1f5f9] last:border-0">
          <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${DOT_COLORS[e.category ?? ''] ?? 'bg-gray-400'}`} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#0f172a] truncate">{e.SPOC_name}</div>
            <div className="text-xs text-[#64748b]">{CAT_LABELS[e.category ?? ''] ?? e.category} · {e.subject}</div>
          </div>
          <span className="text-xs text-[#94a3b8] flex-shrink-0">{timeAgo(e.createdDate ?? '')}</span>
        </div>
      ))}
    </div>
  );
}
