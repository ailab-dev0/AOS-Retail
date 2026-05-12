'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { usePathname } from 'next/navigation';
import entriesJson from '@/data/entries.json';
import type { Entry } from '@/data/types';

const ALL = entriesJson as Entry[];
const PAGE_TITLES: Record<string, string> = { '/': 'Dashboard', '/entries': 'Entries', '/approvals': 'Approvals', '/reports': 'Reports', '/settings': 'Settings' };
const PAGE_BREADCRUMBS: Record<string, string> = { '/': 'AOS Retail', '/entries': 'AOS Retail / Entries', '/approvals': 'AOS Retail / Approvals', '/reports': 'AOS Retail / Reports', '/settings': 'AOS Retail / Settings' };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const pendingCount = ALL.filter((e: Entry) => e.approvalStatus === 'Pending').length;
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} pendingCount={pendingCount} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={PAGE_TITLES[pathname] ?? 'AOS Dashboard'} breadcrumb={PAGE_BREADCRUMBS[pathname]} />
        <main className="flex-1 overflow-y-auto p-6 bg-[#f0f2f5]">{children}</main>
      </div>
    </div>
  );
}
