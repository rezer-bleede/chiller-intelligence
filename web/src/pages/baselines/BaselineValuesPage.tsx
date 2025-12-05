import { FormEvent, useEffect, useMemo, useState } from 'react';
import ErrorMessage from '../../components/common/ErrorMessage';
import FormInput from '../../components/common/FormInput';
import Loading from '../../components/common/Loading';
import {
  BaselineValue,
  BaselineValuePayload,
  createBaselineValue,
  deleteBaselineValue,
  importBaselineValues,
  listBaselineValues,
  updateBaselineValue,
} from '../../api/baselineValues';

const emptyForm: BaselineValuePayload = {
  name: '',
  metric_key: '',
  value: 0,
  unit: '',
  notes: '',
  building_id: undefined,
  chiller_unit_id: undefined,
};

const BaselineValuesPage = () => {
  const [baselines, setBaselines] = useState<BaselineValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [form, setForm] = useState<BaselineValuePayload>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const loadBaselines = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listBaselineValues();
      setBaselines(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to load baseline values');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaselines();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    try {
      if (isEditing && editingId !== null) {
        await updateBaselineValue(editingId, form);
      } else {
        await createBaselineValue(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadBaselines();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to save baseline value');
    }
  };

  const handleEdit = (baseline: BaselineValue) => {
    setForm({
      name: baseline.name,
      metric_key: baseline.metric_key,
      value: baseline.value,
      unit: baseline.unit ?? '',
      notes: baseline.notes ?? '',
      building_id: baseline.building_id ?? undefined,
      chiller_unit_id: baseline.chiller_unit_id ?? undefined,
    });
    setEditingId(baseline.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this baseline value?')) return;
    try {
      await deleteBaselineValue(id);
      loadBaselines();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to delete baseline value');
    }
  };

  const handleImport = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    setFileError(undefined);
    setUploading(true);
    try {
      await importBaselineValues(file);
      loadBaselines();
    } catch (err: any) {
      setFileError(err?.response?.data?.detail ?? 'Unable to import baseline values');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Configuration</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Baseline Values</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Capture target thresholds that inform analytics and alerting.
          </p>
        </div>
        <label className="cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          {uploading ? 'Uploading…' : 'Import CSV/XLSX'}
          <input
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={(e) => handleImport(e.target.files)}
          />
        </label>
      </div>

      <ErrorMessage message={error} />
      <ErrorMessage message={fileError} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {isEditing ? 'Edit baseline' : 'Add baseline'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            id="name"
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <FormInput
            id="metric_key"
            label="Metric Key"
            value={form.metric_key}
            onChange={(e) => setForm({ ...form, metric_key: e.target.value })}
            required
          />
          <FormInput
            id="value"
            label="Value"
            type="number"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            required
          />
          <FormInput
            id="unit"
            label="Unit"
            value={form.unit ?? ''}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            placeholder="e.g. kW, COP"
          />
          <FormInput
            id="building_id"
            label="Building ID (optional)"
            value={form.building_id ?? ''}
            onChange={(e) => setForm({ ...form, building_id: e.target.value ? Number(e.target.value) : undefined })}
          />
          <FormInput
            id="chiller_unit_id"
            label="Chiller Unit ID (optional)"
            value={form.chiller_unit_id ?? ''}
            onChange={(e) =>
              setForm({ ...form, chiller_unit_id: e.target.value ? Number(e.target.value) : undefined })
            }
          />
          <div className="md:col-span-2">
            <label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Notes
            </label>
            <textarea
              id="notes"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              rows={3}
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:text-slate-100"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              {isEditing ? 'Update' : 'Create'} baseline
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Metric</th>
                <th className="px-6 py-3">Value</th>
                <th className="px-6 py-3">Scope</th>
                <th className="px-6 py-3">Notes</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {baselines.map((baseline) => (
                <tr key={baseline.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="px-6 py-3 font-semibold text-slate-900 dark:text-white">{baseline.name}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{baseline.metric_key}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                    {baseline.value} {baseline.unit}
                  </td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                    {baseline.chiller_unit_id ? `Chiller ${baseline.chiller_unit_id}` : baseline.building_id ? `Building ${baseline.building_id}` : 'Organization'}
                  </td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{baseline.notes ?? '—'}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-3 text-sm font-semibold">
                      <button className="text-brand-600 hover:text-brand-500" onClick={() => handleEdit(baseline)} type="button">
                        Edit
                      </button>
                      <button className="text-rose-500 hover:text-rose-400" onClick={() => handleDelete(baseline.id)} type="button">
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

export default BaselineValuesPage;
