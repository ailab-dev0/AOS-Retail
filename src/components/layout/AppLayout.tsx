'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { fetchStats } from '@/lib/api';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (pathname === '/login') return;
    fetchStats()
      .then(stats => setPendingCount(stats.pending))
      .catch(console.error);
  }, [pathname]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f5]">
      <Sidebar pendingCount={pendingCount} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
