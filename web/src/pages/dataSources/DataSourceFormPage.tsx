import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listChillerUnits, ChillerUnit } from '../../api/chillerUnits';
import {
  DataSourcePayload,
  DataSourceType,
  createDataSource,
  getDataSource,
  updateDataSource,
} from '../../api/dataSources';
import SelectInput from '../../components/common/SelectInput';
import FormInput from '../../components/common/FormInput';
import ErrorMessage from '../../components/common/ErrorMessage';
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
    <div style={{ maxWidth: 520 }}>
      <h1>{isEdit ? 'Edit Data Source' : 'Add Data Source'}</h1>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit}>
        <FormInput
          id="chiller_unit"
          label="Chiller Unit"
          value={form.chiller_unit_id}
          onChange={(e) => setForm({ ...form, chiller_unit_id: Number(e.target.value) })}
          list="chiller-units-options"
        />
        <datalist id="chiller-units-options">
          {chillerUnits.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </datalist>
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
        <div className="form-group">
          <label htmlFor="connection_params">Connection Params (JSON)</label>
          <textarea
            id="connection_params"
            rows={6}
            value={rawParams}
            onChange={(e) => setRawParams(e.target.value)}
          />
        </div>
        <div className="form-actions">
          <button className="secondary" type="button" onClick={() => navigate('/data-sources')}>
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

export default DataSourceFormPage;
