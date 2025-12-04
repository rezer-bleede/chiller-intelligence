import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface PieSlice {
  name: string;
  value: number;
  color?: string;
}

interface PieChartSimpleProps {
  data: PieSlice[];
}

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PieChartSimple = ({ data }: PieChartSimpleProps) => (
  <div className="h-full min-h-[240px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color ?? '#6366f1'} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default PieChartSimple;
