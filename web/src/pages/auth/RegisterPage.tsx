import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import FormInput from '../../components/common/FormInput';
import SelectInput from '../../components/common/SelectInput';
import { useAuth } from '../../store/authStore';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    organization_name: '',
    organization_type: 'ENERGY_MGMT',
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-area" style={{ maxWidth: 520, margin: '40px auto', background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
      <h2>Create Organization</h2>
      <form onSubmit={handleSubmit}>
        <FormInput
          id="organization_name"
          label="Organization Name"
          value={form.organization_name}
          onChange={(e) => handleChange('organization_name', e.target.value)}
          required
        />
        <SelectInput
          id="organization_type"
          label="Organization Type"
          value={form.organization_type}
          onChange={(e) => handleChange('organization_type', e.target.value)}
          options={[
            { label: 'Energy Management', value: 'ENERGY_MGMT' },
            { label: 'Facilities Management', value: 'FM' },
            { label: 'ESCO', value: 'ESCO' },
          ]}
        />
        <FormInput
          id="admin_name"
          label="Admin Name"
          value={form.admin_name}
          onChange={(e) => handleChange('admin_name', e.target.value)}
          required
        />
        <FormInput
          id="admin_email"
          label="Admin Email"
          type="email"
          value={form.admin_email}
          onChange={(e) => handleChange('admin_email', e.target.value)}
          required
        />
        <FormInput
          id="admin_password"
          label="Password"
          type="password"
          value={form.admin_password}
          onChange={(e) => handleChange('admin_password', e.target.value)}
          required
        />
        <ErrorMessage message={error} />
        <div className="form-actions" style={{ marginTop: 12 }}>
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <Link to="/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
