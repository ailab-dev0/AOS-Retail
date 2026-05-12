const MAP: Record<string, { bg: string; text: string; label: string }> = {
  'Face to Face class': { bg: 'bg-cyan-50', text: 'text-cyan-700', label: 'F2F' },
  'Online class': { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Online' },
  'Mentoring': { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Mentoring' },
  'Other academic work': { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Other' },
};
export default function CategoryPill({ category }: { category: string }) {
  const s = MAP[category] ?? MAP['Other academic work'];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>;
}
