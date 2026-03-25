import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Sign in</h1>
      <form onSubmit={onSubmit} className="form">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          autoComplete="email"
          required
        />
        <div className="password-field">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
        <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '8px' }}>
          <Link to="/forgot-password" className="link-btn" style={{ fontSize: '14px' }}>
            Forgot Password?
          </Link>
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" style={{ marginTop: '0px' }} disabled={loading}>{loading ? 'Signing in…' : 'Login'}</button>
      </form>
      <p className="muted">No account? <Link to="/signup">Create one</Link></p>
    </div>
  );
}
