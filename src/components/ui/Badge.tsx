interface BadgeProps { status: string; className?: string; }
export default function Badge({ status, className = '' }: BadgeProps) {
  const map: Record<string, string> = {
    Pending: 'bg-orange-50 text-orange-600 border border-orange-200',
    Approved: 'bg-green-50 text-green-600 border border-green-200',
    Rejected: 'bg-red-50 text-red-600 border border-red-200',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center ${map[status] ?? 'bg-gray-50 text-gray-600 border border-gray-200'} ${className}`}>{status}</span>;
}
