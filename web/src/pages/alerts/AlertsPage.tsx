import { useEffect, useMemo, useState } from 'react';
import { fetchAlerts } from '../../api/alerts';
import { AlertSeverity } from '../../api/alertRules';
import { listChillerUnits } from '../../api/chillerUnits';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loading from '../../components/common/Loading';

const severityOrder: AlertSeverity[] = ['CRITICAL', 'WARNING', 'INFO'];

const SeverityPill = ({ severity }: { severity: AlertSeverity }) => {
  const colors: Record<AlertSeverity, string> = {
    CRITICAL: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-100',
    WARNING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100',
    INFO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100',
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[severity]}`}>{severity}</span>;
};

const AlertsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | ''>('');
  const [alerts, setAlerts] = useState<Awaited<ReturnType<typeof fetchAlerts>> | null>(null);
  const [chillers, setChillers] = useState<{ id: number; name: string }[]>([]);
  const [chillerFilter, setChillerFilter] = useState<number | undefined>();

  const loadAlerts = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const [alertsResponse, chillerData] = await Promise.all([
        fetchAlerts(severityFilter || undefined, chillerFilter),
        listChillerUnits(),
      ]);
      setAlerts(alertsResponse);
      setChillers(chillerData);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severityFilter, chillerFilter]);

  const summaryCards = useMemo(() => {
    const counts = alerts?.summary.by_severity ?? {};
    const total = alerts?.summary.total ?? 0;
    return [
      { label: 'Total alerts', value: total, color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100' },
      {
        label: 'Critical',
        value: counts.CRITICAL ?? 0,
        color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100',
      },
      {
        label: 'Warnings',
        value: counts.WARNING ?? 0,
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100',
      },
      {
        label: 'Info',
        value: counts.INFO ?? 0,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100',
      },
    ];
  }, [alerts]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Monitoring</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Alerts</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Review alert events and triage based on severity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={severityFilter}
            onChange={(e) => setSeverityFilter((e.target.value as AlertSeverity) || '')}
          >
            <option value="">All severities</option>
            {severityOrder.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={chillerFilter ?? ''}
            onChange={(e) =>
              setChillerFilter(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">All chillers</option>
            {chillers.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:text-slate-100"
            onClick={loadAlerts}
          >
            Refresh
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-2xl p-4 shadow-sm ${card.color}`}>
            <p className="text-xs uppercase tracking-wide">{card.label}</p>
            <p className="text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3">When</th>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Message</th>
                <th className="px-6 py-3">Metric</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {alerts?.alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                    {new Date(alert.triggered_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <SeverityPill severity={alert.severity} />
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{alert.message}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                    {alert.metric_key}: {alert.metric_value.toFixed(2)}
                  </td>
                </tr>
              ))}
              {!alerts?.alerts.length && (
                <tr>
                  <td className="px-6 py-4 text-center text-slate-500" colSpan={4}>
                    No alerts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
