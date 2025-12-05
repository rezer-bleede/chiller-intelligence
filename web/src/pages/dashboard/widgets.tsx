import dayjs from 'dayjs';
import {
  BarChartGrouped,
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
import {
  ChillerTrendSeries,
  ConsumptionEfficiencyPoint,
  EquipmentMetric,
  PlantOverviewResponse,
} from '../../api/analytics';

export type DashboardPageKey = 'dashboard_overview' | 'dashboard_equipment' | 'dashboard_telemetry';
export interface DashboardStats {
  buildings: number;
  chillers: number;
  alertRules: number;
}

export interface DashboardData {
  overview?: PlantOverviewResponse;
  consumptionSeries: ConsumptionEfficiencyPoint[];
  equipmentMetrics: EquipmentMetric[];
  chillerTrends: ChillerTrendSeries[];
}

const palette = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#14b8a6', '#f472b6'];

const formatNumber = (value?: number, maximumFractionDigits = 1) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value ?? 0);

const formatTimestamp = (timestamp: string) => dayjs(timestamp).format('MMM D HH:mm');

const aggregateChillerTelemetry = (trends: ChillerTrendSeries[]) => {
  const bucket = new Map<
    string,
    { count: number; ewt: number; lwt: number; power_kw: number; cooling_rth: number; capacity_pct: number }
  >();

  trends.forEach((trend) => {
    trend.points.forEach((point) => {
      const current = bucket.get(point.timestamp) ?? { count: 0, ewt: 0, lwt: 0, power_kw: 0, cooling_rth: 0, capacity_pct: 0 };
      current.count += 1;
      current.ewt += point.ewt;
      current.lwt += point.lwt;
      current.power_kw += point.power_kw;
      current.cooling_rth += point.cooling_rth;
      current.capacity_pct += point.capacity_pct;
      bucket.set(point.timestamp, current);
    });
  });

  return Array.from(bucket.entries())
    .sort(([a], [b]) => (dayjs(a).isBefore(dayjs(b)) ? -1 : 1))
    .map(([timestamp, totals]) => ({
      timestamp,
      ewt: totals.ewt / totals.count,
      lwt: totals.lwt / totals.count,
      power_kw: totals.power_kw,
      cooling_rth: totals.cooling_rth,
      capacity_pct: totals.capacity_pct / totals.count,
    }));
};

const buildSummaryCards = (stats?: DashboardStats, overview?: PlantOverviewResponse) => [
  {
    title: 'Plant cooling load',
    value: overview ? `${formatNumber(overview.cooling_load_rth, 2)} RTh` : '—',
    description: 'Total refrigeration tons delivered',
    icon: '❄️',
    accent: 'from-brand-500 to-cyan-500',
    id: 'kpi-cooling-load',
  },
  {
    title: 'Plant power consumption',
    value: overview ? `${formatNumber(overview.power_consumption_kw, 2)} kWh` : '—',
    description: 'Energy consumed over the window',
    icon: '⚡',
    accent: 'from-amber-400 to-orange-500',
    id: 'kpi-power',
  },
  {
    title: 'Average COP',
    value: overview ? formatNumber(overview.avg_cop, 2) : '—',
    description: overview ? `${formatNumber(overview.efficiency_gain_percent, 1)}% vs. baseline` : '—',
    icon: '📈',
    accent: 'from-emerald-500 to-green-600',
    id: 'kpi-efficiency-gain',
  },
  {
    title: 'Monthly savings (AED)',
    value: overview ? formatNumber(overview.monthly_savings, 0) : '—',
    description: 'Projected savings from telemetry',
    icon: '💰',
    accent: 'from-fuchsia-500 to-purple-500',
    id: 'kpi-monthly-savings',
  },
  {
    title: 'CO₂ saved',
    value: overview ? `${formatNumber(overview.co2_saved, 0)} kg` : '—',
    description: 'Avoided emissions from optimization',
    icon: '🌱',
    accent: 'from-emerald-500 to-sky-500',
    id: 'kpi-co2',
  },
  {
    title: 'Assets monitored',
    value: stats ? `${stats.chillers} chillers / ${stats.buildings} buildings` : 'Chillers & buildings',
    description: `${stats?.alertRules ?? 0} alert rules`,
    icon: '🛰️',
    accent: 'from-slate-500 to-slate-800',
    id: 'kpi-assets',
  },
];

export const buildWidgetRegistry = (
  stats?: DashboardStats,
  data: DashboardData = { consumptionSeries: [], equipmentMetrics: [], chillerTrends: [] },
): Record<string, WidgetDefinition> => {
  const summaryCards = buildSummaryCards(stats, data.overview);
  const aggregatedTelemetry = aggregateChillerTelemetry(data.chillerTrends);

  const efficiencySeries = data.consumptionSeries.map((point) => ({
    name: formatTimestamp(point.timestamp),
    efficiency: point.efficiency_kwh_per_tr ?? 0,
    cop: point.avg_cop ?? 0,
  }));

  const coolingVsPower = data.consumptionSeries.map((point) => ({
    name: formatTimestamp(point.timestamp),
    cooling: point.cooling_rth,
    power: point.power_kw,
  }));

  const equipmentEfficiency = data.equipmentMetrics.map((unit, index) => ({
    name: unit.name,
    value: unit.avg_cop,
    color: palette[index % palette.length],
  }));

  const equipmentCoolingShare = data.equipmentMetrics.map((unit, index) => ({
    name: unit.name,
    value: unit.cooling_share,
    color: palette[index % palette.length],
  }));

  const powerCoolingRatio = data.overview
    ? [
        { name: 'Power consumed', value: data.overview.power_consumption_kw, color: palette[0] },
        { name: 'Cooling provided', value: data.overview.cooling_load_rth, color: palette[2] },
      ]
    : [];

  const plantStatus = data.chillerTrends.map((chiller, index) => {
    const spark = chiller.points
      .slice(-8)
      .map((point) => ({ name: dayjs(point.timestamp).format('HH:mm'), value: point.cooling_rth ?? 0 }));
    const latest = chiller.points[chiller.points.length - 1];
    return {
      label: chiller.unit_name,
      value: latest ? formatNumber(latest.capacity_pct, 1) : '—',
      unit: '% load',
      change: latest ? `${formatNumber(latest.power_kw, 2)} kW` : 'Awaiting telemetry',
      icon: '🟢',
      spark,
      color: palette[index % palette.length],
    };
  });

  const sparklineFromAggregated = (field: 'ewt' | 'lwt' | 'power_kw') => {
    const series = aggregatedTelemetry
      .map((point) => ({ name: dayjs(point.timestamp).format('HH:mm'), value: (point as any)[field] ?? 0 }))
      .slice(-12);
    const latestValue = series[series.length - 1]?.value;
    const previousValue = series[series.length - 2]?.value;
    const delta =
      latestValue !== undefined && previousValue !== undefined
        ? `${latestValue >= previousValue ? '+' : ''}${formatNumber(latestValue - previousValue, 2)}`
        : undefined;
    return { series, latestValue, delta };
  };

  const sparkEwt = sparklineFromAggregated('ewt');
  const sparkLwt = sparklineFromAggregated('lwt');
  const powerSpark = data.consumptionSeries
    .map((point) => ({ name: dayjs(point.timestamp).format('HH:mm'), value: point.power_kw }))
    .slice(-12);
  const powerLatest = powerSpark[powerSpark.length - 1]?.value;
  const powerPrevious = powerSpark[powerSpark.length - 2]?.value;
  const powerDelta =
    powerLatest !== undefined && powerPrevious !== undefined
      ? `${powerLatest >= powerPrevious ? '+' : ''}${formatNumber(powerLatest - powerPrevious, 2)} kW vs prev`
      : undefined;

  const chillerTelemetryCards = data.chillerTrends.map((chiller, index) => ({
    id: chiller.unit_id,
    name: chiller.unit_name,
    temperatures: chiller.points.map((point) => ({
      name: dayjs(point.timestamp).format('HH:mm'),
      capacity: point.capacity_pct,
      ewt: point.ewt,
      lwt: point.lwt,
    })),
    powerCooling: chiller.points.map((point) => ({
      name: dayjs(point.timestamp).format('HH:mm'),
      power_kw: point.power_kw,
      cooling_rth: point.cooling_rth,
    })),
    color: palette[index % palette.length],
  }));

  const renderIfData = (hasData: boolean, content: () => JSX.Element) =>
    hasData ? content() : <p className="text-sm text-slate-500">No telemetry available.</p>;

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
      title: 'Average COP',
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
      title: 'Efficiency & COP (kWh/TR)',
      render: () =>
        renderIfData(
          efficiencySeries.length > 0,
          () => (
            <EnergyEfficiencyChart
              data={efficiencySeries}
              axes={[
                { id: 'eff', orientation: 'left', label: 'kWh/TR' },
                { id: 'cop', orientation: 'right', label: 'COP' },
              ]}
              series={[
                { key: 'efficiency', name: 'kWh/TR', color: '#6366f1', yAxisId: 'eff' },
                { key: 'cop', name: 'Average COP', color: '#22c55e', yAxisId: 'cop' },
              ]}
            />
          ),
        ),
      minH: 9,
    },
    'cooling-consumption': {
      id: 'cooling-consumption',
      title: 'Cooling delivered vs. power consumed',
      render: () =>
        renderIfData(
          coolingVsPower.length > 0,
          () => (
            <CoolingConsumptionChart
              data={coolingVsPower}
              xKey="name"
              yLabel="Load"
              series={[
                { key: 'cooling', name: 'Cooling (RTh)', color: '#22c55e' },
                { key: 'power', name: 'Power (kW)', color: '#6366f1' },
              ]}
            />
          ),
        ),
      minH: 10,
    },
    'equipment-efficiency': {
      id: 'equipment-efficiency',
      title: 'Equipment efficiency (avg COP)',
      render: () => renderIfData(equipmentEfficiency.length > 0, () => <HorizontalBarChart data={equipmentEfficiency} />),
      minH: 8,
    },
    'power-vs-cooling': {
      id: 'power-vs-cooling',
      title: 'Power consumed vs cooling provided',
      render: () => renderIfData(powerCoolingRatio.length > 0, () => <PieChartSimple data={powerCoolingRatio} />),
      minH: 8,
    },
    'chiller-health': {
      id: 'chiller-health',
      title: 'Per-chiller health',
      render: () =>
        renderIfData(
          plantStatus.length > 0,
          () => (
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
        ),
      frameless: true,
      hideHeader: false,
      minH: 8,
    },
    'cooling-production': {
      id: 'cooling-production',
      title: 'Cooling vs power (bar comparison)',
      render: () =>
        renderIfData(
          coolingVsPower.length > 0,
          () => (
            <DashboardCard title="Cooling vs power" subtitle="kW and RTh comparison">
              <BarChartGrouped
                data={coolingVsPower.map((item) => ({ name: item.name, first: item.cooling, second: item.power }))}
                firstLabel="Cooling (RTh)"
                secondLabel="Power (kW)"
                colors={['#22c55e', '#6366f1']}
              />
            </DashboardCard>
          ),
        ),
      hideHeader: true,
      minH: 9,
    },
    'equipment-ratio': {
      id: 'equipment-ratio',
      title: 'Cooling share by equipment',
      render: () =>
        renderIfData(
          equipmentCoolingShare.length > 0,
          () => (
            <DashboardCard title="Cooling share" subtitle="% of total load">
              <PieChartSimple data={equipmentCoolingShare} />
            </DashboardCard>
          ),
        ),
      hideHeader: true,
      minH: 8,
    },
    'trend-ewt': {
      id: 'trend-ewt',
      title: 'Entering water temperature',
      render: () => (
        <TrendCard
          title="EWT"
          value={sparkEwt.latestValue !== undefined ? `${formatNumber(sparkEwt.latestValue, 2)}°C` : '—'}
          delta={sparkEwt.delta ? `${sparkEwt.delta}°C vs prev` : undefined}
          icon="🌡️"
        >
          <LineChartMultiAxis
            data={sparkEwt.series}
            series={[{ name: 'EWT', dataKey: 'value', color: '#0ea5e9', yAxisId: 'left' }]}
            axes={[{ id: 'left', orientation: 'left', label: '°C' }]}
          />
        </TrendCard>
      ),
      hideHeader: true,
      minH: 5,
    },
    'trend-lwt': {
      id: 'trend-lwt',
      title: 'Leaving water temperature',
      render: () => (
        <TrendCard
          title="LWT"
          value={sparkLwt.latestValue !== undefined ? `${formatNumber(sparkLwt.latestValue, 2)}°C` : '—'}
          delta={sparkLwt.delta ? `${sparkLwt.delta}°C vs prev` : undefined}
          icon="💧"
        >
          <LineChartMultiAxis
            data={sparkLwt.series}
            series={[{ name: 'LWT', dataKey: 'value', color: '#22c55e', yAxisId: 'left' }]}
            axes={[{ id: 'left', orientation: 'left', label: '°C' }]}
          />
        </TrendCard>
      ),
      hideHeader: true,
      minH: 5,
    },
    'trend-power': {
      id: 'trend-power',
      title: 'Power draw',
      render: () => (
        <TrendCard
          title="Power"
          value={powerLatest !== undefined ? `${formatNumber(powerLatest, 2)} kW` : '—'}
          delta={powerDelta}
          icon="⚡"
        >
          <LineChartMultiAxis
            data={powerSpark}
            series={[{ name: 'Power', dataKey: 'value', color: '#f97316', yAxisId: 'left' }]}
            axes={[{ id: 'left', orientation: 'left', label: 'kW' }]}
          />
        </TrendCard>
      ),
      hideHeader: true,
      minH: 5,
    },
    'circuit-telemetry': {
      id: 'circuit-telemetry',
      title: 'Time series telemetry',
      render: () =>
        renderIfData(
          chillerTelemetryCards.length > 0,
          () => (
            <div className="space-y-4">
              {chillerTelemetryCards.map((chiller) => (
                <div
                  key={chiller.id}
                  className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{chiller.name}</h4>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                      Live telemetry
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DashboardCard title="Temperature & capacity" subtitle="°C / %">
                      <LineChartMultiAxis
                        data={chiller.temperatures}
                        xKey="name"
                        axes={[
                          { id: 'capacity', orientation: 'left', label: 'Capacity %', domain: [0, 110] },
                          { id: 'temp', orientation: 'right', label: '°C', domain: [0, 20] },
                        ]}
                        series={[
                          { name: 'Capacity', dataKey: 'capacity', color: '#6366f1', yAxisId: 'capacity' },
                          { name: 'EWT', dataKey: 'ewt', color: '#0ea5e9', yAxisId: 'temp' },
                          { name: 'LWT', dataKey: 'lwt', color: '#22c55e', yAxisId: 'temp' },
                        ]}
                      />
                    </DashboardCard>
                    <DashboardCard title="Power & cooling" subtitle="kW / RTh">
                      <LineChartMultiAxis
                        data={chiller.powerCooling}
                        xKey="name"
                        axes={[
                          { id: 'power', orientation: 'left', label: 'kW' },
                          { id: 'cooling', orientation: 'right', label: 'RTh' },
                        ]}
                        series={[
                          { name: 'Power', dataKey: 'power_kw', color: '#f97316', yAxisId: 'power' },
                          { name: 'Cooling', dataKey: 'cooling_rth', color: '#22c55e', yAxisId: 'cooling' },
                        ]}
                      />
                    </DashboardCard>
                  </div>
                </div>
              ))}
            </div>
          ),
        ),
      hideHeader: true,
      minH: 14,
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
    { widgetId: 'plant-efficiency', x: 6, y: 3, w: 6, h: 9 },
    { widgetId: 'cooling-consumption', x: 0, y: 12, w: 12, h: 10 },
  ],
  dashboard_equipment: [
    { widgetId: 'equipment-efficiency', x: 0, y: 0, w: 6, h: 8 },
    { widgetId: 'power-vs-cooling', x: 6, y: 0, w: 6, h: 8 },
    { widgetId: 'chiller-health', x: 0, y: 8, w: 12, h: 8 },
    { widgetId: 'cooling-production', x: 0, y: 16, w: 7, h: 9 },
    { widgetId: 'equipment-ratio', x: 7, y: 16, w: 5, h: 8 },
  ],
  dashboard_telemetry: [
    { widgetId: 'trend-ewt', x: 0, y: 0, w: 4, h: 5 },
    { widgetId: 'trend-lwt', x: 4, y: 0, w: 4, h: 5 },
    { widgetId: 'trend-power', x: 8, y: 0, w: 4, h: 5 },
    { widgetId: 'circuit-telemetry', x: 0, y: 5, w: 12, h: 14 },
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
