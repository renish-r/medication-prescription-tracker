import { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/patient/prescriptions', { token: user?.token });
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <div className="card">Loading prescriptions…</div>;
  if (error) return <div className="card error">{error}</div>;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2>My Prescriptions</h2>
          <p className="muted">Active and renewed prescriptions</p>
        </div>
      </div>
      <div className="list">
        {items.map((p) => (
          <div key={p.id} className="list-item">
            <div>
              <div className="title">{p.diagnosis || 'Prescription'}</div>
              <div className="muted">Doctor: {p.doctorName || p.doctorEmail}</div>
              <div className="muted">Status: {p.status}</div>
            </div>
            <div>
              <div className="muted">Issued: {p.issuedDate}</div>
              <div className="muted">Expires: {p.expiryDate}</div>
            </div>
            <div className="pill-group">
              {(p.medicines || []).map((m) => (
                <span key={m.id} className="pill">{m.medicineName} · {m.dosage}</span>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="muted">No prescriptions yet.</div>}
      </div>
    </div>
  );
}
