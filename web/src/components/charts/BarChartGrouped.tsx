import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface GroupedSeries {
  name: string;
  first: number;
  second: number;
}

interface BarChartGroupedProps {
  data: GroupedSeries[];
  firstLabel?: string;
  secondLabel?: string;
  colors?: [string, string];
}

const BarChartGrouped = ({ data, firstLabel = 'First', secondLabel = 'Second', colors = ['#6366f1', '#06b6d4'] }: BarChartGroupedProps) => (
  <ResponsiveContainer width="100%" height={320}>
    <BarChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
      <YAxis tick={{ fill: '#94a3b8' }} />
      <Tooltip cursor={{ fill: '#f8fafc' }} />
      <Legend />
      <Bar dataKey="first" name={firstLabel} fill={colors[0]} radius={[8, 8, 0, 0]} />
      <Bar dataKey="second" name={secondLabel} fill={colors[1]} radius={[8, 8, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export default BarChartGrouped;
