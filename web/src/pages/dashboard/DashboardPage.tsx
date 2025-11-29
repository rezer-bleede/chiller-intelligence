import { useEffect, useMemo, useState } from 'react';
import {
  BarChartGrouped,
  ChillerCircuitChart,
  CoolingConsumptionChart,
  DataSummaryCard,
  DashboardCard,
  EnergyEfficiencyChart,
  HorizontalBarChart,
  KPICard,
  LineChartMultiAxis,
  PieChartSimple,
  TrendCard,
} from '../../components/charts';
import { listAlertRules } from '../../api/alertRules';
import { listBuildings } from '../../api/buildings';
import { listChillerUnits } from '../../api/chillerUnits';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loading from '../../components/common/Loading';

const DashboardPage = () => {
  const [stats, setStats] = useState({ buildings: 0, chillers: 0, alertRules: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const load = async () => {
      try {
        const [buildings, chillers, alerts] = await Promise.all([
          listBuildings(),
          listChillerUnits(),
          listAlertRules(),
        ]);
        setStats({ buildings: buildings.length, chillers: chillers.length, alertRules: alerts.length });
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const summaryCards = useMemo(
    () => [
      { title: 'Cooling load (tons)', value: '1,250', description: 'Peak midday load across the campus', icon: '❄️', accent: 'from-brand-500 to-cyan-500' },
      { title: 'Power consumption (kWh)', value: '3,820', description: 'Rolling 24h energy', icon: '⚡', accent: 'from-amber-400 to-orange-500' },
      { title: 'Efficiency gain', value: '+8.4%', description: 'vs. baseline model', icon: '📈', accent: 'from-emerald-500 to-green-600' },
      { title: 'Monthly savings (AED)', value: '42,300', description: 'Projecting end-of-month', icon: '💰', accent: 'from-fuchsia-500 to-purple-500' },
      { title: 'CO₂ saved (kg)', value: '7,120', description: 'Reduction from optimization', icon: '🌱', accent: 'from-emerald-500 to-sky-500' },
      { title: 'Assets monitored', value: `${stats.chillers} chillers / ${stats.buildings} buildings`, description: 'Portfolio coverage', icon: '🛰️', accent: 'from-slate-500 to-slate-800' },
    ],
    [stats.buildings, stats.chillers],
  );

  const groupedCooling = [
    { name: 'Q1', first: 820, second: 760 },
    { name: 'Q2', first: 910, second: 860 },
    { name: 'Q3', first: 980, second: 920 },
    { name: 'Q4', first: 870, second: 830 },
  ];

  const efficiencyTrend = [
    { name: 'Jan', benchmark: 0.72, yearOne: 0.69, yearTwo: 0.64 },
    { name: 'Feb', benchmark: 0.7, yearOne: 0.68, yearTwo: 0.63 },
    { name: 'Mar', benchmark: 0.71, yearOne: 0.66, yearTwo: 0.62 },
    { name: 'Apr', benchmark: 0.74, yearOne: 0.67, yearTwo: 0.61 },
    { name: 'May', benchmark: 0.75, yearOne: 0.65, yearTwo: 0.6 },
    { name: 'Jun', benchmark: 0.76, yearOne: 0.66, yearTwo: 0.58 },
  ];

  const equipmentEfficiency = [
    { name: 'Pumps', value: 0.42, color: '#0ea5e9' },
    { name: 'Chiller U2/U3', value: 0.53, color: '#6366f1' },
    { name: 'Chiller U1', value: 0.61, color: '#22c55e' },
  ];

  const pieData = [
    { name: 'Power consumed', value: 62, color: '#6366f1' },
    { name: 'Cooling provided', value: 38, color: '#22c55e' },
  ];

  const plantStatus = [
    {
      label: 'Chiller U1 status',
      value: 'Online',
      unit: '',
      change: 'Stable',
      icon: '🟢',
      spark: [
        { name: 't-4', value: 62 },
        { name: 't-3', value: 64 },
        { name: 't-2', value: 63 },
        { name: 't-1', value: 65 },
        { name: 't-0', value: 66 },
      ],
      color: '#22c55e',
    },
    {
      label: 'Load',
      value: 68,
      unit: '%',
      change: '+4.2% vs 15m',
      icon: '⚙️',
      spark: [
        { name: 't-4', value: 54 },
        { name: 't-3', value: 58 },
        { name: 't-2', value: 63 },
        { name: 't-1', value: 66 },
        { name: 't-0', value: 68 },
      ],
      color: '#6366f1',
    },
    {
      label: 'Setpoint',
      value: 6.7,
      unit: '°C',
      change: 'Optimized',
      icon: '🎯',
      spark: [
        { name: 't-4', value: 7.1 },
        { name: 't-3', value: 6.9 },
        { name: 't-2', value: 6.8 },
        { name: 't-1', value: 6.7 },
        { name: 't-0', value: 6.7 },
      ],
      color: '#f97316',
    },
    {
      label: 'EWT',
      value: 12.1,
      unit: '°C',
      change: '-0.3°C today',
      icon: '🌡️',
      spark: [
        { name: 't-4', value: 12.8 },
        { name: 't-3', value: 12.5 },
        { name: 't-2', value: 12.3 },
        { name: 't-1', value: 12.2 },
        { name: 't-0', value: 12.1 },
      ],
      color: '#0ea5e9',
    },
    {
      label: 'LWT',
      value: 7.6,
      unit: '°C',
      change: '-0.2°C today',
      icon: '💧',
      spark: [
        { name: 't-4', value: 7.9 },
        { name: 't-3', value: 7.8 },
        { name: 't-2', value: 7.7 },
        { name: 't-1', value: 7.6 },
        { name: 't-0', value: 7.6 },
      ],
      color: '#22c55e',
    },
    {
      label: 'Ambient temperature',
      value: 36,
      unit: '°C',
      change: '+1.1°C vs yesterday',
      icon: '☀️',
      spark: [
        { name: 't-4', value: 33 },
        { name: 't-3', value: 34 },
        { name: 't-2', value: 35 },
        { name: 't-1', value: 36 },
        { name: 't-0', value: 36 },
      ],
      color: '#f59e0b',
    },
  ];

  const efficiencyLines = [
    { name: 'Benchmark', dataKey: 'benchmark', color: '#f97316', yAxisId: 'left' },
    { name: 'First year', dataKey: 'yearOne', color: '#6366f1', yAxisId: 'left' },
    { name: 'Second year', dataKey: 'yearTwo', color: '#22c55e', yAxisId: 'left' },
  ];

  const kpiSparklines = {
    ewt: [
      { name: 't-4', value: 12.5 },
      { name: 't-3', value: 12.2 },
      { name: 't-2', value: 12.1 },
      { name: 't-1', value: 12.0 },
      { name: 't-0', value: 11.9 },
    ],
    lwt: [
      { name: 't-4', value: 7.8 },
      { name: 't-3', value: 7.7 },
      { name: 't-2', value: 7.6 },
      { name: 't-1', value: 7.6 },
      { name: 't-0', value: 7.5 },
    ],
    power: [
      { name: 't-4', value: 410 },
      { name: 't-3', value: 430 },
      { name: 't-2', value: 420 },
      { name: 't-1', value: 440 },
      { name: 't-0', value: 450 },
    ],
  };

  const chillerAnalytics = [
    {
      name: 'Chiller U1',
      temperatures: [
        { name: '10:00', capacity: 64, ewt: 12.4, lwt: 7.8 },
        { name: '10:10', capacity: 66, ewt: 12.2, lwt: 7.7 },
        { name: '10:20', capacity: 69, ewt: 12.1, lwt: 7.6 },
        { name: '10:30', capacity: 70, ewt: 12.1, lwt: 7.6 },
        { name: '10:40', capacity: 72, ewt: 12.0, lwt: 7.5 },
      ],
      circuits: [
        { time: '10:00', capacity: 64, dischargeA: 280, suctionA: 72, dischargeB: 270, suctionB: 68 },
        { time: '10:10', capacity: 66, dischargeA: 295, suctionA: 70, dischargeB: 278, suctionB: 67 },
        { time: '10:20', capacity: 69, dischargeA: 305, suctionA: 69, dischargeB: 290, suctionB: 66 },
        { time: '10:30', capacity: 70, dischargeA: 312, suctionA: 68, dischargeB: 298, suctionB: 64 },
        { time: '10:40', capacity: 72, dischargeA: 318, suctionA: 66, dischargeB: 304, suctionB: 62 },
      ],
    },
    {
      name: 'Chiller U2',
      temperatures: [
        { name: '10:00', capacity: 54, ewt: 12.8, lwt: 8.1 },
        { name: '10:10', capacity: 56, ewt: 12.6, lwt: 8.0 },
        { name: '10:20', capacity: 59, ewt: 12.4, lwt: 7.9 },
        { name: '10:30', capacity: 61, ewt: 12.3, lwt: 7.8 },
        { name: '10:40', capacity: 63, ewt: 12.1, lwt: 7.7 },
      ],
      circuits: [
        { time: '10:00', capacity: 54, dischargeA: 270, suctionA: 75, dischargeB: 265, suctionB: 70 },
        { time: '10:10', capacity: 56, dischargeA: 276, suctionA: 74, dischargeB: 270, suctionB: 69 },
        { time: '10:20', capacity: 59, dischargeA: 285, suctionA: 71, dischargeB: 275, suctionB: 67 },
        { time: '10:30', capacity: 61, dischargeA: 294, suctionA: 69, dischargeB: 283, suctionB: 65 },
        { time: '10:40', capacity: 63, dischargeA: 302, suctionA: 67, dischargeB: 288, suctionB: 63 },
      ],
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <ErrorMessage message={error} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <DataSummaryCard key={card.title} {...card} />
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Live plant status</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Chiller health + water conditions</h2>
          </div>
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-200">
            {stats.alertRules} alert rules monitoring
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plantStatus.map((item) => (
            <KPICard
              key={item.label}
              label={item.label}
              value={item.value}
              unit={item.unit}
              change={item.change}
              icon={item.icon}
              sparklineData={item.spark}
              color={item.color}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardCard title="Cooling consumption" subtitle="RTh / month">
          <BarChartGrouped data={groupedCooling} firstLabel="First 12 months" secondLabel="Second 12 months" />
        </DashboardCard>
        <DashboardCard title="Plant efficiencies" subtitle="kWh/TR">
          <EnergyEfficiencyChart data={efficiencyTrend} />
        </DashboardCard>
        <DashboardCard title="Equipment efficiency" subtitle="kWh/TR">
          <HorizontalBarChart data={equipmentEfficiency} />
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TrendCard title="EWT" value="12.1°C" delta="-0.3°C today" icon="🌡️">
          <LineChartMultiAxis
            data={kpiSparklines.ewt}
            series={[{ name: 'EWT', dataKey: 'value', color: '#0ea5e9', yAxisId: 'left' }]}
            axes={[{ id: 'left', orientation: 'left', label: '°C' }]}
          />
        </TrendCard>
        <TrendCard title="LWT" value="7.6°C" delta="-0.2°C today" icon="💧">
          <LineChartMultiAxis
            data={kpiSparklines.lwt}
            series={[{ name: 'LWT', dataKey: 'value', color: '#22c55e', yAxisId: 'left' }]}
            axes={[{ id: 'left', orientation: 'left', label: '°C' }]}
          />
        </TrendCard>
        <TrendCard title="Power" value="450 kW" delta="+3.1% vs 15m" icon="⚡">
          <LineChartMultiAxis
            data={kpiSparklines.power}
            series={[{ name: 'Power', dataKey: 'value', color: '#f97316', yAxisId: 'left' }]}
            axes={[{ id: 'left', orientation: 'left', label: 'kW' }]}
          />
        </TrendCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardCard title="Cooling production" subtitle="Dynamic load vs target">
          <CoolingConsumptionChart
            data={[
              { month: 'Jan', baseline: 780, actual: 720 },
              { month: 'Feb', baseline: 820, actual: 760 },
              { month: 'Mar', baseline: 880, actual: 810 },
              { month: 'Apr', baseline: 920, actual: 850 },
              { month: 'May', baseline: 980, actual: 910 },
              { month: 'Jun', baseline: 1010, actual: 960 },
            ]}
          />
        </DashboardCard>
        <DashboardCard title="Power consumed / Cooling provided" subtitle="Ratio">
          <PieChartSimple data={pieData} />
        </DashboardCard>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Per chiller analytics</p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Circuit pressures and temperature response</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
            Updated every 10 minutes
          </span>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {chillerAnalytics.map((chiller) => (
            <div
              key={chiller.name}
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{chiller.name}</h4>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                  Optimizing
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DashboardCard title="Temperature & capacity" subtitle="°C / %">
                  <LineChartMultiAxis
                    data={chiller.temperatures}
                    xKey="name"
                    axes={[
                      { id: 'capacity', orientation: 'left', label: 'Capacity %', domain: [40, 80] },
                      { id: 'temp', orientation: 'right', label: '°C', domain: [6, 14] },
                    ]}
                    series={[
                      { name: 'Capacity', dataKey: 'capacity', color: '#6366f1', yAxisId: 'capacity' },
                      { name: 'EWT', dataKey: 'ewt', color: '#0ea5e9', yAxisId: 'temp' },
                      { name: 'LWT', dataKey: 'lwt', color: '#22c55e', yAxisId: 'temp' },
                    ]}
                  />
                </DashboardCard>
                <DashboardCard title="Circuit pressures" subtitle="Suction & discharge">
                  <ChillerCircuitChart data={chiller.circuits} />
                </DashboardCard>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
