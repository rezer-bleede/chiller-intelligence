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
import DashboardLayoutManager, {
  WidgetDefinition,
  WidgetLayoutConfig,
} from '../../components/dashboard/DashboardLayoutManager';

export type DashboardPageKey = 'dashboard_overview' | 'dashboard_equipment' | 'dashboard_telemetry';
export interface DashboardStats {
  buildings: number;
  chillers: number;
  alertRules: number;
}

const buildSummaryCards = (stats?: DashboardStats) => [
  { title: 'Plant cooling load', value: '1,250 RTh', description: 'Peak midday load across the campus', icon: '❄️', accent: 'from-brand-500 to-cyan-500', id: 'kpi-cooling-load' },
  { title: 'Plant power consumption', value: '3,820 kWh', description: 'Rolling 24h energy', icon: '⚡', accent: 'from-amber-400 to-orange-500', id: 'kpi-power' },
  { title: 'Efficiency gain (%)', value: '+8.4%', description: 'vs. baseline model', icon: '📈', accent: 'from-emerald-500 to-green-600', id: 'kpi-efficiency-gain' },
  { title: 'Monthly savings (AED)', value: '42,300', description: 'Projected end-of-month', icon: '💰', accent: 'from-fuchsia-500 to-purple-500', id: 'kpi-monthly-savings' },
  { title: 'CO₂ saved', value: '7,120 kg', description: 'Reduction from optimization', icon: '🌱', accent: 'from-emerald-500 to-sky-500', id: 'kpi-co2' },
  {
    title: 'Assets monitored',
    value: stats ? `${stats.chillers} chillers / ${stats.buildings} buildings` : 'Chillers & buildings',
    description: `${stats?.alertRules ?? 0} alert rules`,
    icon: '🛰️',
    accent: 'from-slate-500 to-slate-800',
    id: 'kpi-assets',
  },
];

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

export const buildWidgetRegistry = (stats?: DashboardStats): Record<string, WidgetDefinition> => {
  const summaryCards = buildSummaryCards(stats);

  return {
  'kpi-cooling-load': {
    id: 'kpi-cooling-load',
    title: 'Plant cooling load',
    render: () => <DataSummaryCard {...summaryCards[0]} />,
    frameless: true,
    hideHeader: true,
  },
  'kpi-power': {
    id: 'kpi-power',
    title: 'Plant power consumption',
    render: () => <DataSummaryCard {...summaryCards[1]} />,
    frameless: true,
    hideHeader: true,
  },
  'kpi-efficiency-gain': {
    id: 'kpi-efficiency-gain',
    title: 'Efficiency gain (%)',
    render: () => <DataSummaryCard {...summaryCards[2]} />,
    frameless: true,
    hideHeader: true,
  },
  'kpi-monthly-savings': {
    id: 'kpi-monthly-savings',
    title: 'Monthly savings',
    render: () => <DataSummaryCard {...summaryCards[3]} />,
    frameless: true,
    hideHeader: true,
  },
  'kpi-co2': {
    id: 'kpi-co2',
    title: 'CO₂ saved',
    render: () => <DataSummaryCard {...summaryCards[4]} />,
    frameless: true,
    hideHeader: true,
  },
  'kpi-assets': {
    id: 'kpi-assets',
    title: 'Assets monitored',
    render: () => <DataSummaryCard {...summaryCards[5]} />,
    frameless: true,
    hideHeader: true,
  },
  'plant-efficiency': {
    id: 'plant-efficiency',
    title: 'Plant efficiency vs benchmark',
    render: () => <EnergyEfficiencyChart data={efficiencyTrend} />,
  },
  'cooling-consumption': {
    id: 'cooling-consumption',
    title: 'Cooling consumption (first vs second year)',
    render: () => <BarChartGrouped data={groupedCooling} firstLabel="First 12 months" secondLabel="Second 12 months" />,
  },
  'equipment-efficiency': {
    id: 'equipment-efficiency',
    title: 'Equipment efficiency (pumps vs chillers)',
    render: () => <HorizontalBarChart data={equipmentEfficiency} />,
  },
  'power-vs-cooling': {
    id: 'power-vs-cooling',
    title: 'Power consumed (%) and cooling provided (%)',
    render: () => <PieChartSimple data={pieData} />,
  },
  'chiller-health': {
    id: 'chiller-health',
    title: 'Per-chiller health',
    render: () => (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
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
    ),
    frameless: true,
    hideHeader: false,
  },
  'cooling-production': {
    id: 'cooling-production',
    title: 'Cooling production (load vs target)',
    render: () => (
      <DashboardCard title="Load vs target" subtitle="Dynamic load">
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
    ),
    hideHeader: true,
  },
  'equipment-ratio': {
    id: 'equipment-ratio',
    title: 'Power consumed / Cooling provided',
    render: () => (
      <DashboardCard title="Power vs cooling" subtitle="Ratio">
        <PieChartSimple data={pieData} />
      </DashboardCard>
    ),
    hideHeader: true,
  },
  'trend-ewt': {
    id: 'trend-ewt',
    title: 'Entering water temperature',
    render: () => (
      <TrendCard title="EWT" value="12.1°C" delta="-0.3°C today" icon="🌡️">
        <LineChartMultiAxis
          data={kpiSparklines.ewt}
          series={[{ name: 'EWT', dataKey: 'value', color: '#0ea5e9', yAxisId: 'left' }]}
          axes={[{ id: 'left', orientation: 'left', label: '°C' }]}
        />
      </TrendCard>
    ),
    hideHeader: true,
  },
  'trend-lwt': {
    id: 'trend-lwt',
    title: 'Leaving water temperature',
    render: () => (
      <TrendCard title="LWT" value="7.6°C" delta="-0.2°C today" icon="💧">
        <LineChartMultiAxis
          data={kpiSparklines.lwt}
          series={[{ name: 'LWT', dataKey: 'value', color: '#22c55e', yAxisId: 'left' }]}
          axes={[{ id: 'left', orientation: 'left', label: '°C' }]}
        />
      </TrendCard>
    ),
    hideHeader: true,
  },
  'trend-power': {
    id: 'trend-power',
    title: 'Power draw',
    render: () => (
      <TrendCard title="Power" value="450 kW" delta="+3.1% vs 15m" icon="⚡">
        <LineChartMultiAxis
          data={kpiSparklines.power}
          series={[{ name: 'Power', dataKey: 'value', color: '#f97316', yAxisId: 'left' }]}
          axes={[{ id: 'left', orientation: 'left', label: 'kW' }]}
        />
      </TrendCard>
    ),
    hideHeader: true,
  },
  'circuit-telemetry': {
    id: 'circuit-telemetry',
    title: 'Time series & circuit telemetry',
    render: () => (
      <div className="space-y-4">
        {chillerAnalytics.map((chiller) => (
          <div
            key={chiller.name}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900"
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
    ),
    hideHeader: true,
  },
  };
};

export const pageDefinitions: { key: DashboardPageKey; title: string; description: string; widgetIds: string[] }[] = [
  {
    key: 'dashboard_overview',
    title: 'Overview',
    description: 'High-level KPIs and plant benchmarks.',
    widgetIds: [
      'kpi-cooling-load',
      'kpi-power',
      'kpi-efficiency-gain',
      'kpi-monthly-savings',
      'kpi-co2',
      'kpi-assets',
      'plant-efficiency',
      'cooling-consumption',
    ],
  },
  {
    key: 'dashboard_equipment',
    title: 'Equipment & Health',
    description: 'Equipment efficiency, ratios, and asset health.',
    widgetIds: [
      'equipment-efficiency',
      'power-vs-cooling',
      'chiller-health',
      'cooling-production',
      'equipment-ratio',
    ],
  },
  {
    key: 'dashboard_telemetry',
    title: 'Telemetry & Trends',
    description: 'Time-series telemetry for temperatures, pressures, and power draw.',
    widgetIds: ['trend-ewt', 'trend-lwt', 'trend-power', 'circuit-telemetry'],
  },
];

export const defaultLayouts: Record<DashboardPageKey, WidgetLayoutConfig[]> = {
  dashboard_overview: [
    { widgetId: 'kpi-cooling-load', x: 0, y: 0, w: 3, h: 3 },
    { widgetId: 'kpi-power', x: 3, y: 0, w: 3, h: 3 },
    { widgetId: 'kpi-efficiency-gain', x: 6, y: 0, w: 3, h: 3 },
    { widgetId: 'kpi-monthly-savings', x: 9, y: 0, w: 3, h: 3 },
    { widgetId: 'kpi-co2', x: 0, y: 3, w: 3, h: 3 },
    { widgetId: 'kpi-assets', x: 3, y: 3, w: 3, h: 3 },
    { widgetId: 'plant-efficiency', x: 6, y: 3, w: 6, h: 5 },
    { widgetId: 'cooling-consumption', x: 0, y: 8, w: 12, h: 5 },
  ],
  dashboard_equipment: [
    { widgetId: 'equipment-efficiency', x: 0, y: 0, w: 6, h: 5 },
    { widgetId: 'power-vs-cooling', x: 6, y: 0, w: 6, h: 5 },
    { widgetId: 'chiller-health', x: 0, y: 5, w: 12, h: 8 },
    { widgetId: 'cooling-production', x: 0, y: 13, w: 7, h: 5 },
    { widgetId: 'equipment-ratio', x: 7, y: 13, w: 5, h: 5 },
  ],
  dashboard_telemetry: [
    { widgetId: 'trend-ewt', x: 0, y: 0, w: 4, h: 4 },
    { widgetId: 'trend-lwt', x: 4, y: 0, w: 4, h: 4 },
    { widgetId: 'trend-power', x: 8, y: 0, w: 4, h: 4 },
    { widgetId: 'circuit-telemetry', x: 0, y: 4, w: 12, h: 10 },
  ],
};

export const filterWidgetsForSection = (
  widgetIds: string[],
  registry: Record<string, WidgetDefinition>,
): WidgetDefinition[] =>
  widgetIds
    .map((id) => registry[id])
    .filter((widget): widget is WidgetDefinition => Boolean(widget));

export const mergeLayoutWithDefaults = (
  pageKey: DashboardPageKey,
  widgets: WidgetDefinition[],
  layout?: WidgetLayoutConfig[],
): WidgetLayoutConfig[] => {
  const fallback = defaultLayouts[pageKey] ?? [];
  if (!layout || layout.length === 0) return fallback;

  const allowedIds = new Set(widgets.map((widget) => widget.id));
  const sanitized = layout.filter((item) => allowedIds.has(item.widgetId));
  const missing = fallback.filter((item) => !sanitized.find((existing) => existing.widgetId === item.widgetId));
  return [...sanitized, ...missing];
};

export { DashboardLayoutManager };
