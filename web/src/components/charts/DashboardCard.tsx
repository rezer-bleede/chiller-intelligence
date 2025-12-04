import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const DashboardCard = ({ title, subtitle, actions, children }: DashboardCardProps) => (
  <section className="card flex h-full flex-col gap-4 overflow-hidden">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{subtitle}</p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {actions}
    </div>
    <div className="min-h-[200px] flex-1">{children}</div>
  </section>
);

export default DashboardCard;
