import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChillerUnit, listChillerUnits } from '../../api/chillerUnits';
import {
  DataSourcePayload,
  DataSourceType,
  HistoricalStorageConfig,
  createDataSource,
  getDataSource,
  updateDataSource,
} from '../../api/dataSources';
import ErrorMessage from '../../components/common/ErrorMessage';
import FormInput from '../../components/common/FormInput';
import SelectInput from '../../components/common/SelectInput';
import Loading from '../../components/common/Loading';

const defaultHistoricalStorage: HistoricalStorageConfig = {
  backend: 'POSTGRES',
  host: 'postgresdb',
  port: 5432,
  database: 'chiller_intel',
  username: '',
  password: '',
  ssl: false,
  preload_years: 2,
};

const DataSourceFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [chillerUnits, setChillerUnits] = useState<ChillerUnit[]>([]);
  const [form, setForm] = useState<Omit<DataSourcePayload, 'connection_params'>>({
    chiller_unit_id: 0,
    type: 'MQTT',
  });
  const [liveParams, setLiveParams] = useState('{\n  "generator": true\n}');
  const [historicalConfig, setHistoricalConfig] = useState<HistoricalStorageConfig>(
    defaultHistoricalStorage,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const load = async () => {
      try {
        const chillerData = await listChillerUnits();
        setChillerUnits(chillerData);
        setForm((prev) => ({
          ...prev,
          chiller_unit_id: prev.chiller_unit_id || chillerData[0]?.id || 0,
        }));
        if (id) {
          const data = await getDataSource(id);
          setForm({
            chiller_unit_id: data.chiller_unit_id,
            type: data.type as DataSourceType,
          });
          setLiveParams(JSON.stringify(data.connection_params?.live ?? {}, null, 2));
          setHistoricalConfig({
            ...defaultHistoricalStorage,
            ...(data.connection_params?.historical_storage ?? {}),
          });
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Unable to load data source.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    try {
      const parsed = liveParams ? JSON.parse(liveParams) : {};
      const payload: DataSourcePayload = {
        ...form,
        connection_params: {
          live: parsed,
          historical_storage: {
            ...defaultHistoricalStorage,
            ...historicalConfig,
            port: Number(historicalConfig.port),
            preload_years: historicalConfig.preload_years ?? 2,
          },
        },
      };
      if (isEdit && id) {
        await updateDataSource(id, payload);
      } else {
        await createDataSource(payload);
      }
      navigate('/data-sources');
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setError('Live connection params must be valid JSON.');
      } else {
        setError(err?.response?.data?.detail ?? 'Unable to save data source.');
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{isEdit ? 'Update' : 'Create'}</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{isEdit ? 'Edit Data Source' : 'Add Data Source'}</h1>
        </div>
        <button
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:text-slate-100"
          type="button"
          onClick={() => navigate('/data-sources')}
        >
          Back
        </button>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <SelectInput
          id="chiller_unit"
          label="Chiller Unit"
          value={form.chiller_unit_id}
          onChange={(e) => setForm({ ...form, chiller_unit_id: Number(e.target.value) })}
          options={chillerUnits.map((unit) => ({ label: unit.name, value: unit.id }))}
        />
        <SelectInput
          id="type"
          label="Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as DataSourceType })}
          options={[
            { label: 'MQTT', value: 'MQTT' },
            { label: 'HTTP', value: 'HTTP' },
            { label: 'File Upload', value: 'FILE_UPLOAD' },
            { label: 'External Database', value: 'EXTERNAL_DB' },
          ]}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Live ingest</p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Live data connection</h2>
            </div>
            <label htmlFor="connection_params" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Live connection params (JSON)
            </label>
            <textarea
              id="connection_params"
              rows={8}
              value={liveParams}
              onChange={(e) => setLiveParams(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:ring-brand-700/40"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Define how live data should be fetched or ingested (MQTT topics, HTTP endpoints, file metadata, etc.).
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Historical storage</p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">PostgreSQL archive</h2>
            </div>
            <FormInput id="historical-backend" label="Backend" value={historicalConfig.backend} readOnly />
            <FormInput
              id="historical-host"
              label="Host"
              value={historicalConfig.host}
              onChange={(e) => setHistoricalConfig((prev) => ({ ...prev, host: e.target.value }))}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormInput
                id="historical-port"
                label="Port"
                type="number"
                value={historicalConfig.port}
                onChange={(e) => setHistoricalConfig((prev) => ({ ...prev, port: Number(e.target.value) }))}
              />
              <FormInput
                id="historical-database"
                label="Database"
                value={historicalConfig.database}
                onChange={(e) => setHistoricalConfig((prev) => ({ ...prev, database: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormInput
                id="historical-username"
                label="Username"
                value={historicalConfig.username}
                onChange={(e) => setHistoricalConfig((prev) => ({ ...prev, username: e.target.value }))}
              />
              <FormInput
                id="historical-password"
                label="Password"
                type="password"
                value={historicalConfig.password}
                onChange={(e) => setHistoricalConfig((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormInput
                id="historical-preload"
                label="Preload years"
                type="number"
                min={1}
                value={historicalConfig.preload_years}
                onChange={(e) => setHistoricalConfig((prev) => ({ ...prev, preload_years: Number(e.target.value) }))}
                hint="How many years of historical data to keep preloaded"
              />
              <label className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={Boolean(historicalConfig.ssl)}
                  onChange={(e) => setHistoricalConfig((prev) => ({ ...prev, ssl: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Use SSL
              </label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historical readings are persisted to PostgreSQL so analytics widgets have two years of context by default.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:text-slate-100"
            type="button"
            onClick={() => navigate('/data-sources')}
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-brand-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataSourceFormPage;
