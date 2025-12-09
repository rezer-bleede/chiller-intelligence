import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DataSource,
  HistoricalDBConfig,
  deleteDataSource,
  getHistoricalDBConfig,
  listDataSources,
  updateHistoricalDBConfig,
} from '../../api/dataSources';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loading from '../../components/common/Loading';

const DataSourcesListPage = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [historicalConfig, setHistoricalConfig] = useState<HistoricalDBConfig | null>(null);
  const [configForm, setConfigForm] = useState({
    driver: 'postgresql+psycopg',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState<string | undefined>();
  const navigate = useNavigate();

  const loadDataSources = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listDataSources();
      setDataSources(data);
      const config = await getHistoricalDBConfig();
      setHistoricalConfig(config);
      setConfigForm({ ...config.connection_params, password: '' });
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to load data sources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataSources();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this data source?')) return;
    try {
      await deleteDataSource(String(id));
      loadDataSources();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to delete data source.');
    }
  };

  const handleSaveHistoricalConfig = async () => {
    setSavingConfig(true);
    setConfigMessage(undefined);
    setError(undefined);
    try {
      const response = await updateHistoricalDBConfig(configForm);
      setHistoricalConfig(response);
      setConfigMessage('Historical database connection saved successfully.');
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to save historical database settings.');
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Integrations</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Data Sources</h1>
        </div>
        <button
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
          onClick={() => navigate('/data-sources/new')}
        >
          Add Data Source
        </button>
      </div>

      <ErrorMessage message={error} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Historical database</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Telemetry storage connection</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Configure the dedicated database used for time-series chiller telemetry. Defaults are loaded from the
              environment but can be overridden here.
            </p>
            {historicalConfig && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Active source: {historicalConfig.source} ({historicalConfig.connection_url})
              </p>
            )}
            {configMessage && <p className="mt-2 text-sm text-emerald-600">{configMessage}</p>}
          </div>
          <div className="grid w-full max-w-2xl grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Driver</label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={configForm.driver}
                onChange={(e) => setConfigForm({ ...configForm, driver: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Host</label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={configForm.host}
                onChange={(e) => setConfigForm({ ...configForm, host: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Port</label>
              <input
                type="number"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={configForm.port}
                onChange={(e) => setConfigForm({ ...configForm, port: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Database</label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={configForm.database}
                onChange={(e) => setConfigForm({ ...configForm, database: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Username</label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={configForm.username}
                onChange={(e) => setConfigForm({ ...configForm, username: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
              <input
                type="password"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={configForm.password}
                onChange={(e) => setConfigForm({ ...configForm, password: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveHistoricalConfig}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
                disabled={savingConfig}
              >
                {savingConfig ? 'Saving…' : 'Save connection'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3">Chiller Unit</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Connection Params</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dataSources.map((source) => (
                <tr key={source.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{source.chiller_unit?.name ?? source.chiller_unit_id}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{source.type}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                    <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {JSON.stringify(source.connection_params, null, 2)}
                    </pre>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-3 text-sm font-semibold">
                      <Link className="text-brand-600 hover:text-brand-500" to={`/data-sources/${source.id}/edit`}>
                        Edit
                      </Link>
                      <button
                        className="text-rose-500 hover:text-rose-400"
                        onClick={() => handleDelete(source.id)}
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

export default DataSourcesListPage;
