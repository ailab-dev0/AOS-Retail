import { forwardRef } from 'react';
import clsx from 'clsx';
type Variant = 'primary' | 'white' | 'ghost' | 'danger';
type Size = 'sm' | 'md';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; }
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] border border-[#2563eb]',
  white: 'bg-white text-[#0f172a] border border-[#e2e8f0] hover:bg-[#f8fafc]',
  ghost: 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] border border-transparent',
  danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
};
const SIZES: Record<Size, string> = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'white', size = 'md', className, children, ...props }, ref) => (
  <button ref={ref} className={clsx('inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed', VARIANTS[variant], SIZES[size], className)} {...props}>{children}</button>
));
Button.displayName = 'Button';
export default Button;
