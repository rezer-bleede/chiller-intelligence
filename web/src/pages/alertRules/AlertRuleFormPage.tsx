import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listChillerUnits, ChillerUnit } from '../../api/chillerUnits';
import {
  AlertRulePayload,
  Severity,
  Operator,
  createAlertRule,
  getAlertRule,
  updateAlertRule,
} from '../../api/alertRules';
import FormInput from '../../components/common/FormInput';
import SelectInput from '../../components/common/SelectInput';
import ErrorMessage from '../../components/common/ErrorMessage';
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
    severity: 'INFO' as Severity,
    is_active: true,
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
            severity: data.severity as Severity,
            is_active: data.is_active,
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
    <div style={{ maxWidth: 520 }}>
      <h1>{isEdit ? 'Edit Alert Rule' : 'Add Alert Rule'}</h1>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit}>
        <FormInput
          id="chiller_unit"
          label="Chiller Unit"
          value={form.chiller_unit_id}
          onChange={(e) => setForm({ ...form, chiller_unit_id: Number(e.target.value) })}
          list="chiller-units-list"
        />
        <datalist id="chiller-units-list">
          {chillerUnits.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </datalist>
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
          onChange={(e) => setForm({ ...form, severity: e.target.value as Severity })}
          options={[
            { label: 'Info', value: 'INFO' },
            { label: 'Warning', value: 'WARNING' },
            { label: 'Critical', value: 'CRITICAL' },
          ]}
        />
        <div className="form-group">
          <label htmlFor="is_active">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />{' '}
            Active
          </label>
        </div>
        <div className="form-actions">
          <button className="secondary" type="button" onClick={() => navigate('/alert-rules')}>
            Cancel
          </button>
          <button className="primary" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlertRuleFormPage;
