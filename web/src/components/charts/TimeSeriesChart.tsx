import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface TimeSeriesPoint {
  name: string;
  value: number;
}

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  color?: string;
}

const TimeSeriesChart = ({ data, color = '#10b981' }: TimeSeriesChartProps) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <XAxis dataKey="name" hide />
      <YAxis hide domain={['auto', 'auto']} />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export default TimeSeriesChart;
