import { forwardRef } from 'react';
import clsx from 'clsx';
type Variant = 'primary' | 'white' | 'ghost' | 'danger' | 'success';
type Size = 'xs' | 'sm' | 'md';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; loading?: boolean; icon?: React.ReactNode; }
const V: Record<Variant, string> = {
  primary: 'bg-[#2563eb] text-white border-[#2563eb] hover:bg-[#1d4ed8] shadow-sm shadow-blue-200/50',
  white:   'bg-white text-[#374151] border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#cbd5e1]',
  ghost:   'bg-transparent text-[#64748b] border-transparent hover:bg-[#f8fafc] hover:text-[#0f172a]',
  danger:  'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
  success: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
};
const S: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1',
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
};
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'white', size = 'md', loading, icon, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-1',
        V[variant], S[size], className
      )}
      {...props}
    >
      {loading ? <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> : icon}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
export default Button;
