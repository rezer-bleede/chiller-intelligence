import { useEffect, useState } from 'react';
import { listBuildings } from '../../api/buildings';
import { listChillerUnits } from '../../api/chillerUnits';
import { listAlertRules } from '../../api/alertRules';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

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

  if (loading) return <Loading />;

  return (
    <div>
      <h1>Dashboard</h1>
      <ErrorMessage message={error} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
        <div className="placeholder">
          <strong>Total Buildings:</strong> {stats.buildings}
        </div>
        <div className="placeholder">
          <strong>Total Chiller Units:</strong> {stats.chillers}
        </div>
        <div className="placeholder">
          <strong>Active Alert Rules:</strong> {stats.alertRules}
        </div>
      </div>
      <div className="placeholder" style={{ marginTop: 20 }}>
        <strong>Energy Performance</strong>
        <p>Coming soon.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
