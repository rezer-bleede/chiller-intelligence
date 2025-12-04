import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface HorizontalBarData {
  name: string;
  value: number;
  color?: string;
}

interface HorizontalBarChartProps {
  data: HorizontalBarData[];
}

const HorizontalBarChart = ({ data }: HorizontalBarChartProps) => (
  <div className="h-full min-h-[260px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={data} margin={{ left: 32, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fill: '#94a3b8' }} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8' }} width={120} />
        <Tooltip cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color ?? '#0ea5e9'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default HorizontalBarChart;
