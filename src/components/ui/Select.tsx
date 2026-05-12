import clsx from 'clsx';
interface SelectProps { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; className?: string; }
export default function Select({ options, value, onChange, className }: SelectProps) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={clsx('border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] cursor-pointer', className)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
