import { FormEvent, useEffect, useState } from 'react';
import { getOrganization, updateOrganization, Organization } from '../../api/organizations';
import SelectInput from '../../components/common/SelectInput';
import FormInput from '../../components/common/FormInput';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const OrganizationSettingsPage = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOrganization();
        setOrganization(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Unable to load organization.');
      }
    };
    load();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!organization) return;
    setSaving(true);
    setError(undefined);
    try {
      const updated = await updateOrganization({ name: organization.name, type: organization.type });
      setOrganization(updated);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to save organization.');
    } finally {
      setSaving(false);
    }
  };

  if (!organization) return <Loading />;

  return (
    <div>
      <h1>Organization Settings</h1>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <FormInput
          id="org_name"
          label="Organization Name"
          value={organization.name}
          onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
          required
        />
        <SelectInput
          id="org_type"
          label="Organization Type"
          value={organization.type}
          onChange={(e) => setOrganization({ ...organization, type: e.target.value })}
          options={[
            { label: 'Energy Management', value: 'ENERGY_MGMT' },
            { label: 'Facilities Management', value: 'FM' },
            { label: 'ESCO', value: 'ESCO' },
          ]}
        />
        <button type="submit" className="primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default OrganizationSettingsPage;
