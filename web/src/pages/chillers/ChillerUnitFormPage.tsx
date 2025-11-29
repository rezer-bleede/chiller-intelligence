import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building, listBuildings } from '../../api/buildings';
import { ChillerUnitPayload, createChillerUnit, getChillerUnit, updateChillerUnit } from '../../api/chillerUnits';
import ErrorMessage from '../../components/common/ErrorMessage';
import FormInput from '../../components/common/FormInput';
import SelectInput from '../../components/common/SelectInput';
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
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{isEdit ? 'Update' : 'Create'}</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{isEdit ? 'Edit Chiller Unit' : 'Add Chiller Unit'}</h1>
        </div>
        <button
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:text-slate-100"
          type="button"
          onClick={() => navigate('/chiller-units')}
        >
          Back
        </button>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:text-slate-100"
            type="button"
            onClick={() => navigate('/chiller-units')}
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

export default ChillerUnitFormPage;
