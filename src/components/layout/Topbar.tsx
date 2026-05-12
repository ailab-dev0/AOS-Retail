'use client';
import { Bell, Search } from 'lucide-react';

interface TopbarProps { title: string; breadcrumb?: string; }

export default function Topbar({ title, breadcrumb }: TopbarProps) {
  return (
    <header className="h-14 bg-white border-b border-[#f1f5f9] px-5 flex items-center justify-between flex-shrink-0">
      {/* Left: title + breadcrumb */}
      <div>
        {breadcrumb && (
          <p className="text-[10px] font-medium text-[#94a3b8] uppercase tracking-wider mb-0.5">
            {breadcrumb}
          </p>
        )}
        <h1 className="text-[15px] font-semibold text-[#0f172a] leading-none">{title}</h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          title="Notifications"
          className="relative w-8 h-8 flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f8fafc] rounded-lg transition-colors duration-150"
        >
          <Bell size={16} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[#f1f5f9]" />

        {/* User avatar */}
        <button
          title="Vikram B — Retail Ops Lead"
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[#f8fafc] transition-colors duration-150"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center text-white text-[11px] font-bold">
            VB
          </div>
          <span className="text-xs font-medium text-[#0f172a] hidden sm:block">Vikram B</span>
        </button>
      </div>
    </header>
  );
}
