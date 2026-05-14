'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, CheckCircle, BarChart2, Settings,
  HelpCircle, LogOut, Users, Download, Table2
} from 'lucide-react';

const MENU_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Approvals', icon: CheckCircle, href: '/approvals', badge: true },
  { label: 'Entries', icon: FileText, href: '/entries' },
  { label: 'All Entries', icon: Table2, href: '/users' },
  { label: 'Reports', icon: BarChart2, href: '/reports' },
  { label: 'Team', icon: Users, href: '/settings' },
];

const GENERAL_NAV = [
  { label: 'Settings', icon: Settings, href: '/settings' },
  { label: 'Help', icon: HelpCircle, href: '#' },
  { label: 'Logout', icon: LogOut, href: '#' },
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
                  ? 'bg-[#e8f5e9] text-[#1a5d3a]'
                  : 'text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#f5f5f5]'
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#1a5d3a] rounded-r-full" />
              )}
              <Icon size={16} className="flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
              <span className="flex-1 truncate">{label}</span>
              {badge && count > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#1a5d3a] text-white text-[10px] font-bold rounded-full">
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
                transition-colors duration-150 group min-h-[38px]
                ${active
                  ? 'bg-[#e8f5e9] text-[#1a5d3a]'
                  : 'text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#f5f5f5]'
                }
              `}
            >
              <Icon size={16} className="flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
              <span className="flex-1 truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 min-h-[8px]" />

      {/* Download CTA */}
      <div className="p-3">
        <div className="rounded-xl bg-[#1a5d3a] p-3 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center mb-2">
              <Download size={12} />
            </div>
            <p className="text-xs font-semibold leading-snug">Download our Mobile App</p>
            <p className="text-[10px] text-white/60 mt-0.5">Get easy in another way</p>
            <button className="mt-2 w-full py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] font-semibold transition-colors">
              Download
            </button>
          </div>
          <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-white/5" />
          <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-white/5" />
        </div>
      </div>
    </aside>
  );
}
