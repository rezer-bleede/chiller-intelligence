import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BuildingPayload,
  createBuilding,
  getBuilding,
  updateBuilding,
} from '../../api/buildings';
import FormInput from '../../components/common/FormInput';
import ErrorMessage from '../../components/common/ErrorMessage';
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
    <div style={{ maxWidth: 480 }}>
      <h1>{isEdit ? 'Edit Building' : 'Add Building'}</h1>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit}>
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
        <div className="form-actions">
          <button className="secondary" type="button" onClick={() => navigate('/buildings')}>
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

export default BuildingFormPage;
