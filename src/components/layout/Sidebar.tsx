'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, CheckCircle, BarChart2, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Entries', icon: FileText, href: '/entries' },
  { label: 'Approvals', icon: CheckCircle, href: '/approvals', badge: true },
  { label: 'Reports', icon: BarChart2, href: '/reports' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

interface SidebarProps { collapsed: boolean; onToggle: () => void; pendingCount: number; }

export default function Sidebar({ collapsed, onToggle, pendingCount }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-[#0f172a] flex-shrink-0 flex flex-col transition-all duration-200 overflow-hidden`}>
      <div className="flex items-center h-16 px-4 border-b border-white/10 relative">
        {!collapsed && (<div><span className="text-[#2563eb] font-bold text-xl">AOS</span><span className="text-white/50 text-xs ml-1.5">Retail</span></div>)}
        {collapsed && <span className="text-[#2563eb] font-bold text-xl mx-auto">A</span>}
        <button onClick={onToggle} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 rounded">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV.map(({ label, icon: Icon, href, badge }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1">{label}</span>}
              {!collapsed && badge && pendingCount > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{pendingCount}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">VB</div>
        {!collapsed && (<div className="overflow-hidden"><div className="text-white text-sm font-medium truncate">Vikram B</div><div className="text-white/40 text-xs truncate">Retail Ops Lead</div></div>)}
      </div>
    </aside>
  );
}
