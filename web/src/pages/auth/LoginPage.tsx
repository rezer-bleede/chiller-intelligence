import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import FormInput from '../../components/common/FormInput';
import { useAuth } from '../../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-area" style={{ maxWidth: 420, margin: '60px auto', background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <FormInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <ErrorMessage message={error} />
        <div className="form-actions" style={{ marginTop: 12 }}>
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
          <Link to="/register">Create an account</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
