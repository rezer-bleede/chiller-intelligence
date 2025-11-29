import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertRule, deleteAlertRule, listAlertRules, updateAlertRule } from '../../api/alertRules';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loading from '../../components/common/Loading';

const AlertRulesListPage = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const navigate = useNavigate();

  const loadAlertRules = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listAlertRules();
      setAlertRules(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to load alert rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertRules();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this alert rule?')) return;
    try {
      await deleteAlertRule(String(id));
      loadAlertRules();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to delete alert rule.');
    }
  };

  const toggleActive = async (rule: AlertRule) => {
    try {
      await updateAlertRule(String(rule.id), { is_active: !rule.is_active });
      loadAlertRules();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to update alert rule.');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Automation</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Alert Rules</h1>
        </div>
        <button
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
          onClick={() => navigate('/alert-rules/new')}
        >
          Add Alert Rule
        </button>
      </div>

      <ErrorMessage message={error} />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Chiller Unit</th>
                <th className="px-6 py-3">Metric</th>
                <th className="px-6 py-3">Condition</th>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {alertRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{rule.name}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{rule.chiller_unit?.name ?? rule.chiller_unit_id}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{rule.metric_key}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                    {rule.condition_operator} {rule.threshold_value}
                  </td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{rule.severity}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${rule.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                    >
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-3 text-sm font-semibold">
                      <button
                        className="text-amber-600 hover:text-amber-500"
                        onClick={() => toggleActive(rule)}
                        type="button"
                      >
                        Toggle
                      </button>
                      <Link className="text-brand-600 hover:text-brand-500" to={`/alert-rules/${rule.id}/edit`}>
                        Edit
                      </Link>
                      <button
                        className="text-rose-500 hover:text-rose-400"
                        onClick={() => handleDelete(rule.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlertRulesListPage;
