import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building, listBuildings } from '../../api/buildings';
import {
  ChillerUnitPayload,
  createChillerUnit,
  getChillerUnit,
  updateChillerUnit,
} from '../../api/chillerUnits';
import FormInput from '../../components/common/FormInput';
import SelectInput from '../../components/common/SelectInput';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loading from '../../components/common/Loading';

const ChillerUnitFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [form, setForm] = useState<ChillerUnitPayload>({
    building_id: 0,
    name: '',
    manufacturer: '',
    model: '',
    capacity_tons: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const load = async () => {
      try {
        const buildingOptions = await listBuildings();
        setBuildings(buildingOptions);
        if (buildingOptions.length && !form.building_id) {
          setForm((prev) => ({ ...prev, building_id: buildingOptions[0].id }));
        }
        if (id) {
          const data = await getChillerUnit(id);
          setForm({
            building_id: data.building_id,
            name: data.name,
            manufacturer: data.manufacturer,
            model: data.model,
            capacity_tons: data.capacity_tons,
          });
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Unable to load chiller unit.');
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
        await updateChillerUnit(id, form);
      } else {
        await createChillerUnit(form);
      }
      navigate('/chiller-units');
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to save chiller unit.');
    }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: 520 }}>
      <h1>{isEdit ? 'Edit Chiller Unit' : 'Add Chiller Unit'}</h1>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit}>
        <SelectInput
          id="building"
          label="Building"
          value={form.building_id}
          onChange={(e) => setForm({ ...form, building_id: Number(e.target.value) })}
          options={buildings.map((b) => ({ label: b.name, value: b.id }))}
        />
        <FormInput
          id="name"
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <FormInput
          id="manufacturer"
          label="Manufacturer"
          value={form.manufacturer}
          onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
          required
        />
        <FormInput
          id="model"
          label="Model"
          value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
          required
        />
        <FormInput
          id="capacity_tons"
          label="Capacity (tons)"
          type="number"
          value={form.capacity_tons}
          onChange={(e) => setForm({ ...form, capacity_tons: Number(e.target.value) })}
          required
        />
        <div className="form-actions">
          <button className="secondary" type="button" onClick={() => navigate('/chiller-units')}>
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

export default ChillerUnitFormPage;
