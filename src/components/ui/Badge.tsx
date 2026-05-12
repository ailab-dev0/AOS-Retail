interface BadgeProps { status: string; pulse?: boolean; className?: string; }
const MAP: Record<string, string> = {
  Pending:  'bg-orange-50 text-orange-600 border-orange-200',
  Approved: 'bg-green-50  text-green-600  border-green-200',
  Rejected: 'bg-red-50    text-red-600    border-red-200',
};
export default function Badge({ status, pulse = false, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${MAP[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'} ${className}`}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />}
      {status}
    </span>
  );
}
