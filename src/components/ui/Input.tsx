import clsx from 'clsx';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { icon?: React.ReactNode; }
export default function Input({ icon, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">{icon}</span>}
      <input className={clsx('border border-[#e2e8f0] rounded-lg py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent', icon ? 'pl-9 pr-3' : 'px-3', className)} {...props} />
    </div>
  );
}
