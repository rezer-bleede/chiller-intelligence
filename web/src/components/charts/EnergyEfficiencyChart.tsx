import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AxisConfig, LineSeriesConfig } from './LineChartMultiAxis';

interface EnergyEfficiencyChartProps {
  data: any[];
  xKey?: string;
  axes?: AxisConfig[];
  series: LineSeriesConfig[];
}

const EnergyEfficiencyChart = ({ data, xKey = 'name', axes = [{ id: 'left', orientation: 'left' }], series }: EnergyEfficiencyChartProps) => (
  <div className="h-full min-h-[280px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 20, left: 12, bottom: 12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={xKey} tick={{ fill: '#94a3b8' }} />
        {axes.map((axis) => (
          <YAxis
            key={axis.id}
            yAxisId={axis.id}
            orientation={axis.orientation}
            domain={axis.domain}
            tickFormatter={axis.tickFormatter}
            label={axis.label ? { value: axis.label, angle: -90, position: 'insideLeft', fill: '#94a3b8' } : undefined}
            tick={{ fill: '#94a3b8' }}
          />
        ))}
        <Tooltip />
        <Legend />
        {series.map((item) => (
          <Line
            key={item.dataKey}
            type="monotone"
            dataKey={item.dataKey}
            name={item.name}
            stroke={item.color}
            strokeWidth={3}
            dot={false}
            yAxisId={item.yAxisId ?? axes[0].id}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default EnergyEfficiencyChart;
