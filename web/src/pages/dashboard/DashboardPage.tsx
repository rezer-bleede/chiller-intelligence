import { useEffect, useMemo, useState } from 'react';
import { listAlertRules } from '../../api/alertRules';
import { listBuildings } from '../../api/buildings';
import { listChillerUnits } from '../../api/chillerUnits';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { fetchDashboardLayout, saveDashboardLayout } from '../../api/dashboardLayouts';
import {
  fetchChillerTrends,
  fetchConsumptionEfficiency,
  fetchEquipmentMetrics,
  fetchPlantOverview,
} from '../../api/analytics';
import DashboardLayoutManager, { WidgetDefinition, WidgetLayoutConfig } from '../../components/dashboard/DashboardLayoutManager';
import {
  DashboardPageKey,
  DashboardStats,
  DashboardData,
  buildWidgetRegistry,
  defaultLayouts,
  filterWidgetsForSection,
  mergeLayoutWithDefaults,
  pageDefinitions,
} from './widgets';

const DashboardSectionView = ({
  sectionKey,
  registry,
}: {
  sectionKey: DashboardPageKey;
  registry: Record<string, WidgetDefinition>;
}) => {
  const section = pageDefinitions.find((item) => item.key === sectionKey);
  const widgets = useMemo(
    () => (section ? filterWidgetsForSection(section.widgetIds, registry) : []),
    [section, registry],
  );
  const [layout, setLayout] = useState<WidgetLayoutConfig[]>(defaultLayouts[sectionKey]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [saveError, setSaveError] = useState<string | undefined>();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadLayout = async () => {
      if (!section) return;
      setLoading(true);
      setError(undefined);
      setSaveError(undefined);
      setEditMode(false);
      try {
        const response = await fetchDashboardLayout(section.key);
        const merged = mergeLayoutWithDefaults(section.key, widgets, response.layout);
        setLayout(merged);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Unable to load layout');
        setLayout(defaultLayouts[section.key]);
      } finally {
        setLoading(false);
      }
    };
    loadLayout();
  }, [section, widgets]);

  const handleSave = async () => {
    if (!section) return;
    setSaving(true);
    try {
      await saveDashboardLayout(section.key, layout);
      setSaveError(undefined);
      setEditMode(false);
    } catch (err: any) {
      setSaveError(err?.response?.data?.detail ?? 'Unable to save layout');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!section) return;
    setLayout(defaultLayouts[section.key]);
    setEditMode(true);
  };

  if (!section) return null;

  return (
    <div className="space-y-4 rounded-3xl bg-white/80 p-4 shadow-card ring-1 ring-slate-100 dark:bg-slate-900/70 dark:ring-slate-800">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Dashboard → {section.title}</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{section.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {editMode && (
            <>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-400 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                onClick={handleReset}
              >
                Reset to default
              </button>
              <button
                type="button"
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save layout'}
              </button>
            </>
          )}
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-400 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            onClick={() => setEditMode((value) => !value)}
          >
            {editMode ? 'Done' : 'Edit layout'}
          </button>
        </div>
      </div>
      <ErrorMessage message={error ?? saveError} />
      {loading ? (
        <Loading />
      ) : (
        <DashboardLayoutManager
          widgets={widgets}
          layoutConfig={layout}
          editMode={editMode}
          onLayoutChange={setLayout}
        />
      )}
    </div>
  );
};

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState<DashboardPageKey>('dashboard_overview');
  const [stats, setStats] = useState<DashboardStats>({ buildings: 0, chillers: 0, alertRules: 0 });
  const [statsError, setStatsError] = useState<string | undefined>();
  const [telemetryError, setTelemetryError] = useState<string | undefined>();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    consumptionSeries: [],
    equipmentMetrics: [],
    chillerTrends: [],
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [buildings, chillers, alerts] = await Promise.all([
          listBuildings(),
          listChillerUnits(),
          listAlertRules(),
        ]);
        setStats({ buildings: buildings.length, chillers: chillers.length, alertRules: alerts.length });
      } catch (err: any) {
        setStatsError(err?.response?.data?.detail ?? 'Unable to load dashboard data.');
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    const loadTelemetry = async () => {
      try {
        const [overview, consumption, equipment, chillerTrends] = await Promise.all([
          fetchPlantOverview(),
          fetchConsumptionEfficiency(),
          fetchEquipmentMetrics(),
          fetchChillerTrends(),
        ]);

        setDashboardData({
          overview,
          consumptionSeries: consumption.series ?? [],
          equipmentMetrics: equipment.units ?? [],
          chillerTrends: chillerTrends.chillers ?? [],
        });
      } catch (err: any) {
        setTelemetryError(err?.response?.data?.detail ?? 'Unable to load dashboard telemetry.');
      }
    };

    loadTelemetry();
  }, []);

  const registry = useMemo(() => buildWidgetRegistry(stats, dashboardData), [dashboardData, stats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Dashboard</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Chiller performance cockpit</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {pageDefinitions.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveSection(section.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-200 ${
                activeSection === section.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>
      <ErrorMessage message={statsError ?? telemetryError} />
      <DashboardSectionView sectionKey={activeSection} registry={registry} />
    </div>
  );
};

export default DashboardPage;
