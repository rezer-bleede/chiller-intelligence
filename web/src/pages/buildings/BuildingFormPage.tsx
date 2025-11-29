import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BuildingPayload, createBuilding, getBuilding, updateBuilding } from '../../api/buildings';
import ErrorMessage from '../../components/common/ErrorMessage';
import FormInput from '../../components/common/FormInput';
import Loading from '../../components/common/Loading';

const BuildingFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<BuildingPayload>({ name: '', location: '' });
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await getBuilding(id);
        setForm({
          name: data.name,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
        });
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Unable to load building.');
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
        await updateBuilding(id, form);
      } else {
        await createBuilding(form);
      }
      navigate('/buildings');
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to save building.');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{isEdit ? 'Update' : 'Create'}</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{isEdit ? 'Edit Building' : 'Add Building'}</h1>
        </div>
        <button
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:text-slate-100"
          type="button"
          onClick={() => navigate('/buildings')}
        >
          Back
        </button>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput
          id="name"
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <FormInput
          id="location"
          label="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />
        <FormInput
          id="latitude"
          label="Latitude"
          type="number"
          value={form.latitude ?? ''}
          onChange={(e) => setForm({ ...form, latitude: e.target.value === '' ? undefined : Number(e.target.value) })}
        />
        <FormInput
          id="longitude"
          label="Longitude"
          type="number"
          value={form.longitude ?? ''}
          onChange={(e) => setForm({ ...form, longitude: e.target.value === '' ? undefined : Number(e.target.value) })}
        />
        <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:text-slate-100"
            type="button"
            onClick={() => navigate('/buildings')}
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

export default BuildingFormPage;
