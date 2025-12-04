import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface CoolingConsumptionPoint {
  month: string;
  baseline: number;
  actual: number;
}

interface CoolingConsumptionChartProps {
  data: CoolingConsumptionPoint[];
}

const CoolingConsumptionChart = ({ data }: CoolingConsumptionChartProps) => (
  <div className="h-full min-h-[280px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="baseline" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="actual" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
        <YAxis tick={{ fill: '#94a3b8' }} label={{ value: 'RTh', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="baseline" name="Baseline" stroke="#6366f1" fill="url(#baseline)" strokeWidth={3} />
        <Area type="monotone" dataKey="actual" name="Actual" stroke="#22c55e" fill="url(#actual)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default CoolingConsumptionChart;
