'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, CheckCircle, BarChart2, Settings,
  ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard',  icon: LayoutDashboard, href: '/',          badge: false },
  { label: 'Approvals',  icon: CheckCircle,      href: '/approvals', badge: true  },
  { label: 'Entries',    icon: FileText,          href: '/entries',   badge: false },
  { label: 'Reports',    icon: BarChart2,         href: '/reports',   badge: false },
  { label: 'Settings',   icon: Settings,          href: '/settings',  badge: false },
];

interface SidebarProps { collapsed: boolean; onToggle: () => void; pendingCount: number; }

export default function Sidebar({ collapsed, onToggle, pendingCount }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside
      className="sidebar-transition flex-shrink-0 bg-[#0f172a] flex flex-col overflow-hidden relative"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06] flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-[#2563eb] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div className="overflow-hidden">
              <div className="text-white font-semibold text-sm leading-tight">AOS Retail</div>
              <div className="text-white/35 text-[10px] leading-tight">CPA / CMA</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-[#2563eb] flex items-center justify-center mx-auto">
            <span className="text-white text-xs font-bold">A</span>
          </div>
        )}
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-white/30 hover:text-white/80 hover:bg-white/[0.06] p-1.5 rounded-lg transition-colors duration-150 flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
        {NAV.map(({ label, icon: Icon, href, badge }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          const count = badge ? pendingCount : 0;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`
                relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                transition-colors duration-150 group min-h-[40px]
                ${active
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/[0.04]'
                }
              `}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#3b82f6] rounded-r-full" />
              )}

              <Icon size={17} className="flex-shrink-0" />

              {!collapsed && <span className="flex-1 truncate">{label}</span>}

              {/* Badge — visible when expanded */}
              {!collapsed && badge && count > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[#f97316] text-white text-[10px] font-bold rounded-full animate-fade-in-scale">
                  {count}
                </span>
              )}

              {/* Dot badge — visible when collapsed */}
              {collapsed && badge && count > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f97316] rounded-full" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-white/[0.06]" />

      {/* User section */}
      <div className="p-3">
        <div className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-white/10">
            VB
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="text-white text-xs font-semibold truncate">Vikram B</div>
              <div className="text-white/35 text-[10px] truncate">Retail Ops Lead</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
