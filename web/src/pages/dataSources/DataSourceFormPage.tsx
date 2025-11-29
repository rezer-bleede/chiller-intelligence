import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChillerUnit, listChillerUnits } from '../../api/chillerUnits';
import { DataSourcePayload, DataSourceType, createDataSource, getDataSource, updateDataSource } from '../../api/dataSources';
import ErrorMessage from '../../components/common/ErrorMessage';
import FormInput from '../../components/common/FormInput';
import SelectInput from '../../components/common/SelectInput';
import Loading from '../../components/common/Loading';

const DataSourceFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [chillerUnits, setChillerUnits] = useState<ChillerUnit[]>([]);
  const [form, setForm] = useState<DataSourcePayload>({
    chiller_unit_id: 0,
    type: 'MQTT',
    connection_params: {},
  });
  const [rawParams, setRawParams] = useState('{}');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const load = async () => {
      try {
        const chillerData = await listChillerUnits();
        setChillerUnits(chillerData);
        if (chillerData.length && !form.chiller_unit_id) {
          setForm((prev) => ({ ...prev, chiller_unit_id: chillerData[0].id }));
        }
        if (id) {
          const data = await getDataSource(id);
          setForm({
            chiller_unit_id: data.chiller_unit_id,
            type: data.type as DataSourceType,
            connection_params: data.connection_params,
          });
          setRawParams(JSON.stringify(data.connection_params, null, 2));
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
      const parsed = rawParams ? JSON.parse(rawParams) : {};
      const payload = { ...form, connection_params: parsed };
      if (isEdit && id) {
        await updateDataSource(id, payload);
      } else {
        await createDataSource(payload);
      }
      navigate('/data-sources');
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setError('Connection params must be valid JSON.');
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
          ]}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor="connection_params" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Connection Params (JSON)
          </label>
          <textarea
            id="connection_params"
            rows={6}
            value={rawParams}
            onChange={(e) => setRawParams(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:ring-brand-700/40"
          />
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
