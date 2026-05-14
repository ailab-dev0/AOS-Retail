'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, FileText, CheckSquare, BarChart2, Settings,
  HelpCircle, LogOut, Table2
} from 'lucide-react';

const MENU_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Entries', icon: FileText, href: '/entries' },
  { label: 'Approvals', icon: CheckSquare, href: '/approvals', badge: true },
  { label: 'Reports', icon: BarChart2, href: '/reports' },
  { label: 'All Entries', icon: Table2, href: '/users' },
];

const GENERAL_NAV = [
  { label: 'Settings', icon: Settings, href: '/settings' },
  { label: 'Help', icon: HelpCircle, href: '#' },
];

interface SidebarProps {
  pendingCount: number;
}

export default function Sidebar({ pendingCount }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex-shrink-0 bg-white flex flex-col h-full border-r border-[#eaeaea] w-[220px]">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1a5d3a] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">A</span>
          </div>
          <span className="text-[#1a1a1a] font-semibold text-sm leading-tight">AOS Retail</span>
        </div>
      </div>

      {/* MENU */}
      <div className="px-4 mt-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9ca3af]">Menu</span>
      </div>
      <nav className="px-2 py-1.5 space-y-0.5">
        {MENU_NAV.map(({ label, icon: Icon, href, badge }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          const count = badge ? pendingCount : 0;
          return (
            <Link
              key={href}
              href={href}
              className={`
                relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium
                transition-colors duration-150 group min-h-[38px]
                ${active
                  ? 'bg-[#1a5d3a] text-white'
                  : 'text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#f5f5f5]'
                }
              `}
            >
              <Icon size={16} className="flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
              <span className="flex-1 truncate">{label}</span>
              {badge && count > 0 && (
                <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ${active ? 'bg-white/25 text-white' : 'bg-[#1a5d3a] text-white'}`}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* GENERAL */}
      <div className="px-4 mt-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9ca3af]">General</span>
      </div>
      <nav className="px-2 py-1.5 space-y-0.5">
        {GENERAL_NAV.map(({ label, icon: Icon, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`
                relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium
                transition-colors duration-150 min-h-[38px]
                ${active
                  ? 'bg-[#1a5d3a] text-white'
                  : 'text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#f5f5f5]'
                }
              `}
            >
              <Icon size={16} className="flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
              <span className="flex-1 truncate">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-150 min-h-[38px] text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fee2e2]"
        >
          <LogOut size={16} className="flex-shrink-0" strokeWidth={2} />
          <span className="flex-1 text-left truncate">Logout</span>
        </button>
      </nav>

      <div className="flex-1 min-h-[8px]" />

      {/* Promo Card */}
      <div className="p-3">
        <div className="rounded-xl bg-[#1a5d3a] p-3 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-semibold leading-snug">AOS Retail Next</p>
            <p className="text-[10px] text-white/60 mt-0.5">Faculty activity tracking system</p>
            <span className="mt-2 inline-block px-2 py-0.5 bg-white/20 rounded text-[10px] font-semibold">v2.0</span>
          </div>
          <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white/5" />
          <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-white/5" />
        </div>
      </div>
    </aside>
  );
}
