'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Bell, Search, Mail, Command, LogOut } from 'lucide-react';

export default function Topbar() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/entries?search=${encodeURIComponent(q)}`);
  }

  return (
    <header className="h-14 bg-white flex items-center justify-between px-5 flex-shrink-0 border-b border-[#eaeaea]">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-[400px]">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3 text-[#9ca3af] pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search task"
            className="w-full pl-9 pr-10 py-2 text-sm bg-[#f5f5f5] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 focus:bg-white focus:border-[#1a5d3a]/20 placeholder:text-[#9ca3af] transition-all duration-150"
          />
          <div className="absolute right-2">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.5 bg-white border border-[#e5e5e5] rounded text-[10px] font-medium text-[#9ca3af] shadow-sm">
              <Command size={9} />
              <span>F</span>
            </kbd>
          </div>
        </div>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          title="Messages"
          className="relative w-9 h-9 flex items-center justify-center text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#f5f5f5] rounded-xl transition-colors duration-150"
        >
          <Mail size={17} strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ef4444] rounded-full border-2 border-white" />
        </button>

        <button
          title="Notifications"
          className="relative w-9 h-9 flex items-center justify-center text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#f5f5f5] rounded-xl transition-colors duration-150"
        >
          <Bell size={17} strokeWidth={1.8} />
        </button>

        {/* User */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2 pl-0.5 pr-2 py-0.5 rounded-xl hover:bg-[#f5f5f5] transition-colors duration-150">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-[#1a1a1a] leading-none">{user?.name ?? 'Loading…'}</div>
              <div className="text-[10px] text-[#9ca3af] leading-none mt-0.5">{user?.email ?? ''}</div>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sign out"
            className="w-9 h-9 flex items-center justify-center text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fee2e2] rounded-xl transition-colors duration-150"
          >
            <LogOut size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
}
