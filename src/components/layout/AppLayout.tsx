'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard', '/entries': 'Entries', '/approvals': 'Approvals', '/reports': 'Reports', '/settings': 'Settings',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'AOS Dashboard';
  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f5]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} pendingCount={18} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} breadcrumb="AOS Retail" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
