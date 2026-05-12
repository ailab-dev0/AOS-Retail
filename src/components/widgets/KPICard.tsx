import clsx from 'clsx';
interface KPICardProps { title: string; value: string | number; delta?: string; deltaType?: 'up' | 'down' | 'neutral'; icon: React.ReactNode; iconBg?: string; }
export default function KPICard({ title, value, delta, deltaType = 'neutral', icon, iconBg = 'bg-[#2563eb]' }: KPICardProps) {
  const deltaColor = deltaType === 'up' ? 'text-green-600' : deltaType === 'down' ? 'text-red-600' : 'text-[#64748b]';
  const deltaArrow = deltaType === 'up' ? '↑' : deltaType === 'down' ? '↓' : '';
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0', iconBg)}>{icon}</div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-[#0f172a] leading-tight">{value}</div>
        <div className="text-sm text-[#64748b] mt-0.5">{title}</div>
        {delta && <div className={clsx('text-xs mt-1 font-medium', deltaColor)}>{deltaArrow} {delta}</div>}
      </div>
    </div>
  );
}
