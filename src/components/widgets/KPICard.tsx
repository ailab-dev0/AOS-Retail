import clsx from 'clsx';
interface KPICardProps { title: string; value: string | number; delta?: string; deltaType?: 'up'|'down'|'neutral'; icon: React.ReactNode; iconBg?: string; accentColor?: string; }
export default function KPICard({ title, value, delta, deltaType='neutral', icon, iconBg='bg-[#2563eb]', accentColor }: KPICardProps) {
  const deltaC = deltaType==='up' ? 'text-[#10b981]' : deltaType==='down' ? 'text-[#ef4444]' : 'text-[#94a3b8]';
  const arrow = deltaType==='up' ? '↑' : deltaType==='down' ? '↓' : '';
  return (
    <div className={clsx('bg-white rounded-xl p-5 shadow-sm card-lift border-l-4')} style={{ borderLeftColor: accentColor ?? '#e2e8f0' }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">{title}</p>
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0', iconBg)}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-[#0f172a] tabular-nums leading-none">{value}</div>
      {delta && <div className={`text-xs font-medium mt-2 ${deltaC}`}>{arrow} {delta}</div>}
    </div>
  );
}
