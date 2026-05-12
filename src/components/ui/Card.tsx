import clsx from 'clsx';
interface CardProps { children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode; }
export default function Card({ children, className, title, action }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-xl shadow-sm', className)}>
      {title && (
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <h3 className="text-sm font-semibold text-[#0f172a]">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6 pt-4">{children}</div>
    </div>
  );
}
