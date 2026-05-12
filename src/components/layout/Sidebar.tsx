'use client';
export default function Sidebar({ collapsed, onToggle, pendingCount }: { collapsed: boolean; onToggle: () => void; pendingCount: number }) {
  return <nav className={`${collapsed ? 'w-16' : 'w-60'} bg-[#0f172a] flex-shrink-0 transition-all duration-200`} />;
}
