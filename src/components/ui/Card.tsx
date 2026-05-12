import clsx from 'clsx';
interface CardProps { children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode; hover?: boolean; }
export default function Card({ children, className, title, action, hover = false }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-xl shadow-sm border border-[#f8fafc] overflow-hidden', hover && 'card-lift cursor-pointer', className)}>
      {title && (
        <div className="flex items-center justify-between px-5 pt-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={clsx('p-5', title && 'pt-3')}>{children}</div>
    </div>
  );
}
