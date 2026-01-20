import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleFields = {
  DOCTOR: ['specialization', 'licenseNumber'],
  PHARMACIST: ['pharmacyName', 'licenseNumber'],
  PATIENT: ['age', 'gender'],
};

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PATIENT',
    specialization: '',
    licenseNumber: '',
    pharmacyName: '',
    age: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup({ ...form, role: form.role.toUpperCase() });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = roleFields[form.role] || [];

  return (
    <div className="auth-card">
      <h1>Create account</h1>
      <form onSubmit={onSubmit} className="form">
        <input name="name" placeholder="Full name" value={form.name} onChange={onChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <select name="role" value={form.role} onChange={onChange}>
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
          <option value="PHARMACIST">Pharmacist</option>
        </select>

        {fields.includes('specialization') && (
          <input name="specialization" placeholder="Specialization" value={form.specialization} onChange={onChange} required />
        )}
        {fields.includes('licenseNumber') && (
          <input name="licenseNumber" placeholder="License number" value={form.licenseNumber} onChange={onChange} required />
        )}
        {fields.includes('pharmacyName') && (
          <input name="pharmacyName" placeholder="Pharmacy name" value={form.pharmacyName} onChange={onChange} required />
        )}
        {fields.includes('age') && (
          <input name="age" type="number" placeholder="Age" value={form.age} onChange={onChange} required />
        )}
        {fields.includes('gender') && (
          <select name="gender" value={form.gender} onChange={onChange} required>
            <option value="">Select gender</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        )}

        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Signing up…' : 'Sign up'}</button>
      </form>
      <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
