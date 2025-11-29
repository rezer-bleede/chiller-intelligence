import { ReactNode } from 'react';

interface DataSummaryCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  accent?: string;
}

const DataSummaryCard = ({ title, value, description, icon, accent = 'from-brand-500 to-blue-500' }: DataSummaryCardProps) => (
  <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-10`} aria-hidden />
    <div className="relative flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
        {description ? <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p> : null}
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-lg shadow-sm ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700">
        {icon ?? '✨'}
      </div>
    </div>
  </div>
);

export default DataSummaryCard;
