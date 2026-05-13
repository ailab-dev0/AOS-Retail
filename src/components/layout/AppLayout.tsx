'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { usePathname } from 'next/navigation';
import entriesJson from '@/data/entries.json';
import type { Entry } from '@/data/types';

const ALL = entriesJson as Entry[];

const PAGE_META: Record<string, { title: string; pill?: string }> = {
  '/':          { title: 'Operations Dashboard', pill: 'Retail — CPA / CMA' },
  '/entries':   { title: 'Entries',              pill: 'Retail — All'       },
  '/approvals': { title: 'Approvals',            pill: 'Retail — All'       },
  '/reports':   { title: 'Reports',              pill: 'Retail — All'       },
  '/settings':  { title: 'Settings'                                          },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const pendingCount = ALL.filter((e: Entry) => e.approvalStatus === 'Pending').length;
  const meta = PAGE_META[pathname] ?? { title: 'AOS Dashboard' };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f5]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        pendingCount={pendingCount}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar
          title={meta.title}
          pill={meta.pill}
          onToggleSidebar={() => setCollapsed(c => !c)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
