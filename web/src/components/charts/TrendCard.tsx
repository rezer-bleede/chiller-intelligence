import { ReactNode } from 'react';

interface TrendCardProps {
  title: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

const TrendCard = ({ title, value, delta, icon, children }: TrendCardProps) => (
  <div className="card flex flex-col gap-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
        {delta ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{delta}</p> : null}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100">
        {icon ?? '📈'}
      </div>
    </div>
    {children ? <div className="h-32">{children}</div> : null}
  </div>
);

export default TrendCard;
