import { FormEvent, useEffect, useState } from 'react';
import { getOrganization, updateOrganization, Organization } from '../../api/organizations';
import ErrorMessage from '../../components/common/ErrorMessage';
import FormInput from '../../components/common/FormInput';
import SelectInput from '../../components/common/SelectInput';
import Loading from '../../components/common/Loading';

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
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Workspace</p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Organization Settings</h1>
      </div>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default OrganizationSettingsPage;
