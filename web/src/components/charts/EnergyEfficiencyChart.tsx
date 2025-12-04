import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface EnergyEfficiencyPoint {
  name: string;
  benchmark: number;
  yearOne: number;
  yearTwo: number;
}

interface EnergyEfficiencyChartProps {
  data: EnergyEfficiencyPoint[];
}

const EnergyEfficiencyChart = ({ data }: EnergyEfficiencyChartProps) => (
  <div className="h-full min-h-[280px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 20, left: 12, bottom: 12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
        <YAxis tick={{ fill: '#94a3b8' }} domain={[0, 'auto']} label={{ value: 'kWh/TR', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="yearOne" name="First year" stroke="#6366f1" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="yearTwo" name="Second year" stroke="#22c55e" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default EnergyEfficiencyChart;
