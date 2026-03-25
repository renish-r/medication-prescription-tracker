import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';

const baseStats = { users: 0, prescriptions: 0, doctors: 0, patients: 0 };

function Stat({ label, value, onClick }) {
  const clickable = typeof onClick === 'function';
  return (
    <button className={`metric${clickable ? ' clickable' : ''}`} onClick={onClick} type="button">
      <div className="muted">{label}</div>
      <div className="stat-value">{value ?? 0}</div>
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(baseStats);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const [summary, prescriptions] = await Promise.all([
          apiClient.get('/admin/summary'),
          apiClient.get('/admin/prescriptions'),
        ]);
        setStats({ ...baseStats, ...summary });
        setRecent(Array.isArray(prescriptions) ? prescriptions.slice(0, 8) : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="stack">
      <div className="card">
        <div className="card-header">
          <div>
            <h2>System health</h2>
            <p className="muted">Usage snapshot and activity</p>
          </div>
        </div>
        {loading ? (
          <div className="muted">Loading…</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="grid metrics">
            <Stat label="Total users" value={stats.users} onClick={() => navigate('/admin/users')} />
            <Stat label="Prescriptions" value={stats.prescriptions} />
            <Stat label="Doctors" value={stats.doctors} />
            <Stat label="Patients" value={stats.patients} />
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Recent prescriptions</h2>
            <p className="muted">Latest updates across the system</p>
          </div>
        </div>
        <div className="list">
          {recent.map((p) => (
            <div key={p.id} className="list-item">
              <div>
                <div className="title">{p.diagnosis || 'Prescription'}</div>
                <div className="muted">Patient: {p.patientEmail || p.patientId || '—'}</div>
                <div className="muted">Doctor: {p.doctorEmail || p.doctorId || '—'}</div>
                <div className="muted">Status: {p.status || '—'}</div>
              </div>
              <div className="muted">Issued: {p.issuedDate || p.createdAt || '—'}</div>
            </div>
          ))}
          {recent.length === 0 && !loading && !error && <div className="muted">No prescriptions yet.</div>}
        </div>
      </div>
    </div>
  );
}
