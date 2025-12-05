import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertRulePayload,
  AlertSeverity,
  Operator,
  createAlertRule,
  getAlertRule,
  updateAlertRule,
} from '../../api/alertRules';
import { ChillerUnit, listChillerUnits } from '../../api/chillerUnits';
import ErrorMessage from '../../components/common/ErrorMessage';
import FormInput from '../../components/common/FormInput';
import SelectInput from '../../components/common/SelectInput';
import Loading from '../../components/common/Loading';

const AlertRuleFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [chillerUnits, setChillerUnits] = useState<ChillerUnit[]>([]);
  const [form, setForm] = useState<AlertRulePayload>({
    chiller_unit_id: 0,
    name: '',
    metric_key: 'kw_per_ton',
    condition_operator: '>' as Operator,
    threshold_value: 0,
    severity: 'INFO' as AlertSeverity,
    is_active: true,
    recipient_emails: [],
  });
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
          const data = await getAlertRule(id);
          setForm({
            chiller_unit_id: data.chiller_unit_id,
            name: data.name,
            metric_key: data.metric_key,
            condition_operator: data.condition_operator as Operator,
            threshold_value: data.threshold_value,
            severity: data.severity as AlertSeverity,
            is_active: data.is_active,
            recipient_emails: data.recipient_emails,
          });
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Unable to load alert rule.');
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
      if (isEdit && id) {
        await updateAlertRule(id, form);
      } else {
        await createAlertRule(form);
      }
      navigate('/alert-rules');
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to save alert rule.');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{isEdit ? 'Update' : 'Create'}</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{isEdit ? 'Edit Alert Rule' : 'Add Alert Rule'}</h1>
        </div>
        <button
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:text-slate-100"
          type="button"
          onClick={() => navigate('/alert-rules')}
        >
          Back
        </button>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SelectInput
          id="chiller_unit"
          label="Chiller Unit"
          value={form.chiller_unit_id}
          onChange={(e) => setForm({ ...form, chiller_unit_id: Number(e.target.value) })}
          options={chillerUnits.map((unit) => ({ label: unit.name, value: unit.id }))}
        />
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
        <SelectInput
          id="condition_operator"
          label="Condition Operator"
          value={form.condition_operator}
          onChange={(e) => setForm({ ...form, condition_operator: e.target.value as Operator })}
          options={[
            { label: '>', value: '>' },
            { label: '<', value: '<' },
            { label: '>=', value: '>=' },
            { label: '<=', value: '<=' },
          ]}
        />
        <FormInput
          id="threshold_value"
          label="Threshold Value"
          type="number"
          value={form.threshold_value}
          onChange={(e) => setForm({ ...form, threshold_value: Number(e.target.value) })}
          required
        />
        <SelectInput
          id="severity"
          label="Severity"
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: e.target.value as AlertSeverity })}
          options={[
            { label: 'Info', value: 'INFO' },
            { label: 'Warning', value: 'WARNING' },
            { label: 'Critical', value: 'CRITICAL' },
          ]}
        />
        <div className="md:col-span-2">
          <label htmlFor="recipient_emails" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Recipient Emails
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">Comma-separated list of addresses to notify when the rule triggers.</p>
          <textarea
            id="recipient_emails"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            rows={2}
            value={form.recipient_emails.join(', ')}
            onChange={(e) =>
              setForm({
                ...form,
                recipient_emails: e.target.value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <input
            id="is_active"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          <label htmlFor="is_active" className="cursor-pointer select-none">Active</label>
        </div>
        <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:text-slate-100"
            type="button"
            onClick={() => navigate('/alert-rules')}
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

export default AlertRuleFormPage;
