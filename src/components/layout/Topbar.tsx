export default function Topbar({ title, breadcrumb }: { title: string; breadcrumb?: string }) {
  return <div className="h-16 bg-white border-b border-[#e2e8f0] px-6 flex items-center"><h2 className="text-lg font-semibold text-[#0f172a]">{title}</h2></div>;
}
