import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface SeriesConfig {
  key: string;
  name: string;
  color: string;
}

interface CoolingConsumptionChartProps {
  data: any[];
  xKey?: string;
  series?: SeriesConfig[];
  yLabel?: string;
}

const CoolingConsumptionChart = ({
  data,
  xKey = 'month',
  series = [
    { key: 'baseline', name: 'Baseline', color: '#818cf8' },
    { key: 'actual', name: 'Actual', color: '#22c55e' },
  ],
  yLabel = 'RTh',
}: CoolingConsumptionChartProps) => (
  <div className="h-full min-h-[280px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
        <defs>
          {series.map((item) => (
            <linearGradient key={item.key} id={`gradient-${item.key}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={item.color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={item.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={xKey} tick={{ fill: '#94a3b8' }} />
        <YAxis tick={{ fill: '#94a3b8' }} label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
        <Tooltip />
        <Legend />
        {series.map((item) => (
          <Area
            key={item.key}
            type="monotone"
            dataKey={item.key}
            name={item.name}
            stroke={item.color}
            fill={`url(#gradient-${item.key})`}
            strokeWidth={3}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default CoolingConsumptionChart;
