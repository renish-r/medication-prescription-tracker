import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const roleOptions = ['ADMIN', 'DOCTOR', 'PATIENT', 'PHARMACIST'];
const filterOptions = ['ALL', ...roleOptions];

const roleFields = {
  DOCTOR: ['name', 'specialization', 'licenseNumber'],
  PHARMACIST: ['name', 'pharmacyName', 'licenseNumber'],
  PATIENT: ['name', 'age', 'gender'],
};

export default function AdminUsers() {
  const { user } = useAuth();
  const token = user?.token;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'ADMIN',
    name: '',
    specialization: '',
    licenseNumber: '',
    pharmacyName: '',
    age: '',
    gender: '',
  });
  const [filterRole, setFilterRole] = useState('ALL');

  const activeCount = useMemo(() => users.filter((u) => u.active).length, [users]);
  const filteredUsers = useMemo(
    () => (filterRole === 'ALL' ? users : users.filter((u) => u.role === filterRole)),
    [users, filterRole]
  );
  const fields = roleFields[form.role] || [];

  useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const data = await apiFetch('/admin/users', { token });
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const payload = { ...form, role: form.role || 'ADMIN' };
      const res = await apiFetch('/admin/users', { method: 'POST', body: payload, token });
      if (res?.user) {
        setUsers((prev) => [res.user, ...prev]);
        setForm({
          email: '',
          password: '',
          role: 'ADMIN',
          name: '',
          specialization: '',
          licenseNumber: '',
          pharmacyName: '',
          age: '',
          gender: '',
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (userId) => {
    setError('');
    try {
      const res = await apiFetch(`/admin/users/${userId}/toggle-status`, { method: 'PUT', token });
      if (res?.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active: res.active } : u)));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user?')) return;
    setError('');
    try {
      const res = await apiFetch(`/admin/users/${userId}`, { method: 'DELETE', token });
      if (res?.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Manage users</h2>
            <p className="muted">Create users with any role. Deactivate or delete as needed. Total: {users.length} | Active: {activeCount}</p>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleCreate}>
          <div className="section">
            <div className="title">Create user</div>
            <select name="role" value={form.role} onChange={handleChange}>
              {roleOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {form.role !== 'ADMIN' && (
              <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
            )}
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            
            {fields.includes('specialization') && (
              <input name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} required />
            )}
            {fields.includes('licenseNumber') && (
              <input name="licenseNumber" placeholder="License number" value={form.licenseNumber} onChange={handleChange} required />
            )}
            {fields.includes('pharmacyName') && (
              <input name="pharmacyName" placeholder="Pharmacy name" value={form.pharmacyName} onChange={handleChange} required />
            )}
            {fields.includes('age') && (
              <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} required />
            )}
            {fields.includes('gender') && (
              <select name="gender" value={form.gender} onChange={handleChange} required>
                <option value="">Select gender</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            )}
            
            <button type="submit" disabled={creating}>Create user</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2>All users</h2>
            <p className="muted">Deactivate to suspend access. Delete to remove permanently.</p>
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ width: '120px', fontSize: '14px' }}>
            {filterOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="muted">Loading…</div>
        ) : filteredUsers.length === 0 ? (
          <div className="muted">No users yet.</div>
        ) : (
          <div className="list">
            {filteredUsers.map((u) => (
              <div key={u.id} className="list-item">
                <div>
                  <div className="title">{u.email}</div>
                  <div className="muted">Role: {u.role}</div>
                  <div className="muted">Created by: {u.createdBy || '—'}</div>
                  <div className="muted">Status: {u.active ? 'Active' : 'Inactive'}</div>
                </div>
                <div className="pill-group">
                  <span className="pill">ID {u.id}</span>
                  <button type="button" className="secondary" onClick={() => toggleStatus(u.id)}>
                    {u.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" className="secondary" style={{color: '#991b1b'}} onClick={() => deleteUser(u.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
