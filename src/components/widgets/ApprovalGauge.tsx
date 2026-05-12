interface ApprovalGaugeProps { rate: number; approvedCount: number; pendingCount: number; }
export default function ApprovalGauge({ rate, approvedCount, pendingCount }: ApprovalGaugeProps) {
  const r = 70, cx = 100, cy = 90;
  const circ = Math.PI * r;
  const filled = (rate / 100) * circ;
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <div className="flex flex-col items-center py-2">
      <svg viewBox="0 0 200 100" className="w-full max-w-[200px]">
        <path d={d} fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
        <path d={d} fill="none" stroke="#2563eb" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`} />
        <text x={cx} y={cy - 10} textAnchor="middle" className="font-bold" fontSize="22" fill="#0f172a" fontWeight="700">{rate}%</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="11" fill="#94a3b8">Approval Rate</text>
      </svg>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /><span className="text-xs text-[#64748b]">Approved <strong className="text-[#0f172a]">{approvedCount}</strong></span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /><span className="text-xs text-[#64748b]">Pending <strong className="text-[#0f172a]">{pendingCount}</strong></span></div>
      </div>
    </div>
  );
}
