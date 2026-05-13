'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Plus, Menu } from 'lucide-react';

interface TopbarProps {
  title: string;
  pill?: string;
  onToggleSidebar?: () => void;
}

export default function Topbar({ title, pill, onToggleSidebar }: TopbarProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/entries?search=${encodeURIComponent(q)}`);
  }

  return (
    <header className="h-13 bg-white border-b border-[#f1f5f9] px-4 flex items-center gap-3 flex-shrink-0">
      {/* Left: toggle + title + pill */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title="Toggle sidebar"
            className="w-7 h-7 flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f8fafc] rounded-lg transition-colors duration-150"
          >
            <Menu size={15} />
          </button>
        )}
        <h1 className="text-[15px] font-semibold text-[#0f172a] leading-none whitespace-nowrap">
          {title}
        </h1>
        {pill && (
          <span className="text-[11px] font-semibold bg-[#eff6ff] text-[#3b82f6] border border-[#dbeafe] px-2.5 py-0.5 rounded-full whitespace-nowrap">
            {pill}
          </span>
        )}
      </div>

      {/* Center: search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-[360px] mx-auto">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search entries, faculty, subjects"
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] placeholder:text-[#94a3b8] transition-colors duration-150"
          />
        </div>
      </form>

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
        {/* Bell */}
        <button
          title="Notifications"
          className="relative w-8 h-8 flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f8fafc] rounded-lg transition-colors duration-150"
        >
          <Bell size={15} />
        </button>

        {/* Create Entry */}
        <button
          onClick={() => router.push('/entries')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10b981] hover:bg-[#059669] active:scale-[0.97] text-white text-xs font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap"
        >
          <Plus size={13} strokeWidth={2.5} />
          Create Entry
        </button>

        <div className="w-px h-5 bg-[#f1f5f9]" />

        {/* User */}
        <button
          title="Vikram B — Retail Ops Lead"
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[#f8fafc] transition-colors duration-150"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            VB
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-[#0f172a] leading-none">Vikram B</div>
            <div className="text-[10px] text-[#94a3b8] leading-none mt-0.5">Retail Ops Lead</div>
          </div>
        </button>
      </div>
    </header>
  );
}
