import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface CircuitPoint {
  time: string;
  capacity: number;
  dischargeA: number;
  suctionA: number;
  dischargeB: number;
  suctionB: number;
}

interface ChillerCircuitChartProps {
  data: CircuitPoint[];
  dischargeLimit?: number;
  suctionLimit?: number;
}

const ChillerCircuitChart = ({ data, dischargeLimit = 320, suctionLimit = 55 }: ChillerCircuitChartProps) => {
  const start = data[0]?.time;
  const end = data[data.length - 1]?.time;

  return (
    <div className="h-full min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" tick={{ fill: '#94a3b8' }} />
          <YAxis
            yAxisId="capacity"
            tick={{ fill: '#94a3b8' }}
            domain={[0, 110]}
            label={{ value: 'Capacity %', angle: -90, fill: '#94a3b8', position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="pressure"
            orientation="right"
            tick={{ fill: '#94a3b8' }}
            domain={[0, Math.max(dischargeLimit + 40, 400)]}
            label={{ value: 'Pressure (kPa)', angle: 90, fill: '#94a3b8', position: 'insideRight' }}
          />
          <Tooltip />
          <Legend />
          {start && end ? (
            <ReferenceArea
              x1={start}
              x2={end}
              y1={dischargeLimit}
              y2={dischargeLimit + 60}
              yAxisId="pressure"
              fill="#fef2f2"
              fillOpacity={0.4}
            />
          ) : null}
          {start && end ? (
            <ReferenceArea
              x1={start}
              x2={end}
              y1={suctionLimit + 20}
              y2={suctionLimit + 80}
              yAxisId="pressure"
              fill="#fef9c3"
              fillOpacity={0.35}
            />
          ) : null}
          <Line yAxisId="capacity" type="monotone" dataKey="capacity" name="Capacity" stroke="#6366f1" strokeWidth={3} dot={false} />
          <Line yAxisId="pressure" type="monotone" dataKey="dischargeA" name="Circuit A Discharge" stroke="#ef4444" strokeWidth={2.5} dot={false} />
          <Line yAxisId="pressure" type="monotone" dataKey="suctionA" name="Circuit A Suction" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
          <Line yAxisId="pressure" type="monotone" dataKey="dischargeB" name="Circuit B Discharge" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
          <Line yAxisId="pressure" type="monotone" dataKey="suctionB" name="Circuit B Suction" stroke="#22c55e" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChillerCircuitChart;
