import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertRule, deleteAlertRule, listAlertRules, updateAlertRule } from '../../api/alertRules';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

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
    <div>
      <div className="page-header">
        <h1>Alert Rules</h1>
        <button className="primary" onClick={() => navigate('/alert-rules/new')}>
          Add Alert Rule
        </button>
      </div>
      <ErrorMessage message={error} />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Chiller Unit</th>
            <th>Metric</th>
            <th>Condition</th>
            <th>Severity</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {alertRules.map((rule) => (
            <tr key={rule.id}>
              <td>{rule.name}</td>
              <td>{rule.chiller_unit?.name ?? rule.chiller_unit_id}</td>
              <td>{rule.metric_key}</td>
              <td>
                {rule.condition_operator} {rule.threshold_value}
              </td>
              <td>{rule.severity}</td>
              <td>
                <span className={`badge ${rule.is_active ? 'success' : 'muted'}`}>
                  {rule.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="table-actions">
                <button className="secondary" onClick={() => toggleActive(rule)}>
                  Toggle
                </button>
                <Link to={`/alert-rules/${rule.id}/edit`}>Edit</Link>
                <button className="secondary" onClick={() => handleDelete(rule.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlertRulesListPage;
