import { Bell } from 'lucide-react';
interface TopbarProps { title: string; breadcrumb?: string; }
export default function Topbar({ title, breadcrumb }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-[#e2e8f0] px-6 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 className="text-base font-semibold text-[#0f172a]">{title}</h2>
        {breadcrumb && <p className="text-xs text-[#64748b]">{breadcrumb}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="text-[#64748b] hover:text-[#0f172a] p-2 rounded-lg hover:bg-[#f1f5f9]"><Bell size={18} /></button>
        <div className="w-8 h-8 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-xs font-semibold cursor-pointer">VB</div>
      </div>
    </header>
  );
}
