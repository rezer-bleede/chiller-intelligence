import { ReactNode } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
  icon?: ReactNode;
  sparklineData?: { name: string; value: number }[];
  color?: string;
}

const KPICard = ({ label, value, unit, change, icon, sparklineData, color = '#6366f1' }: KPICardProps) => {
  const gradientId = `spark-${label.replace(/\s+/g, '-')}`;

  return (
  <div className="card flex flex-col gap-3">
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-slate-900 dark:text-white">{value}</span>
          {unit ? <span className="text-sm text-slate-500">{unit}</span> : null}
        </div>
        {change ? <p className="text-sm text-green-600 dark:text-green-400">{change}</p> : null}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-xl text-brand-600 dark:bg-brand-500/15 dark:text-brand-100">
        {icon ?? '📈'}
      </div>
    </div>
    {sparklineData ? (
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip cursor={false} />
            <Area type="monotone" dataKey="value" stroke={color} fill={`url(#${gradientId})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    ) : null}
  </div>
  );
};

export default KPICard;
