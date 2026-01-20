import { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const emptyMed = { name: '', dosage: '', timing: '', duration: '', notes: '' };

export default function DoctorPrescriptions() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patientId: '', diagnosis: '', expiryDate: '', medications: [emptyMed] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patientForm, setPatientForm] = useState({ name: '', email: '', password: '', age: '', gender: '' });
  const [patientError, setPatientError] = useState('');
  const [patientResult, setPatientResult] = useState('');

  const load = async () => {
    try {
      const data = await apiFetch('/doctor/prescriptions', { token: user?.token });
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await apiFetch('/doctor/patients', { token: user?.token });
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    }
  };

  useEffect(() => { 
    load(); 
    loadPatients();
  }, []);

  const updateMed = (idx, field, value) => {
    const meds = form.medications.map((m, i) => (i === idx ? { ...m, [field]: value } : m));
    setForm({ ...form, medications: meds });
  };

  const addMed = () => setForm({ ...form, medications: [...form.medications, emptyMed] });
  const removeMed = (idx) => setForm({ ...form, medications: form.medications.filter((_, i) => i !== idx) });

  const create = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiFetch('/doctor/prescriptions/create', {
        method: 'POST',
        token: user?.token,
        body: {
          patientId: Number(form.patientId),
          diagnosis: form.diagnosis,
          expiryDate: form.expiryDate || null,
          medications: form.medications,
        },
      });
      setForm({ patientId: '', diagnosis: '', expiryDate: '', medications: [emptyMed] });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (e) => {
    e.preventDefault();
    setPatientError('');
    setPatientResult('');
    try {
      const res = await apiFetch('/doctor/patients', {
        method: 'POST',
        token: user?.token,
        body: {
          ...patientForm,
          age: patientForm.age ? Number(patientForm.age) : null,
        },
      });
      if (res.patientId) {
        setPatientResult(`Patient created (ID ${res.patientId})`);
      } else {
        setPatientResult('Patient created');
      }
      setPatientForm({ name: '', email: '', password: '', age: '', gender: '' });
      loadPatients(); // Reload patient list
    } catch (err) {
      setPatientError(err.message);
    }
  };

  const renew = async (id) => {
    setError('');
    try {
      await apiFetch(`/doctor/prescriptions/${id}/renew`, { method: 'POST', token: user?.token });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Add patient</h2>
            <p className="muted">Create a patient account to prescribe to</p>
          </div>
        </div>
        <form className="form" onSubmit={createPatient}>
          <input name="name" placeholder="Full name" value={patientForm.name} onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })} required />
          <input name="email" type="email" placeholder="Email" value={patientForm.email} onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })} required />
          <input name="password" type="password" placeholder="Temporary password" value={patientForm.password} onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })} required />
          <input name="age" type="number" placeholder="Age" value={patientForm.age} onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })} required />
          <select name="gender" value={patientForm.gender} onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })} required>
            <option value="">Select gender</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
          {patientError && <div className="error">{patientError}</div>}
          {patientResult && <div className="muted">{patientResult}</div>}
          <button type="submit">Create patient</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Create prescription</h2>
            <p className="muted">Attach meds and patient ID</p>
          </div>
        </div>
        <form className="form" onSubmit={create}>
          <select name="patientId" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
          <input name="diagnosis" placeholder="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
          <input name="expiryDate" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />

          <div className="section">
            <div className="section-header">
              <h3>Medicines</h3>
              <button type="button" onClick={addMed} className="secondary">Add medicine</button>
            </div>
            {form.medications.map((m, idx) => (
              <div key={idx} className="med-row">
                <input placeholder="Name" value={m.name} onChange={(e) => updateMed(idx, 'name', e.target.value)} required />
                <input placeholder="Dosage" value={m.dosage} onChange={(e) => updateMed(idx, 'dosage', e.target.value)} />
                <input placeholder="Timing" value={m.timing} onChange={(e) => updateMed(idx, 'timing', e.target.value)} />
                <input placeholder="Duration" value={m.duration} onChange={(e) => updateMed(idx, 'duration', e.target.value)} />
                <input placeholder="Notes" value={m.notes} onChange={(e) => updateMed(idx, 'notes', e.target.value)} />
                {form.medications.length > 1 && <button type="button" onClick={() => removeMed(idx)} className="link-btn">Remove</button>}
              </div>
            ))}
          </div>

          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Create prescription'}</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2>My prescriptions</h2>
            <p className="muted">Click renew to clone an active one</p>
          </div>
        </div>
        <div className="list">
          {list.map((p) => (
            <div key={p.id} className="list-item">
              <div>
                <div className="title">{p.diagnosis || 'Prescription'}</div>
                <div className="muted">Patient: {p.patient?.email}</div>
                <div className="muted">Status: {p.status}</div>
              </div>
              <div className="muted">Issued: {p.issuedDate}</div>
              <button className="secondary" onClick={() => renew(p.id)}>Renew</button>
            </div>
          ))}
          {list.length === 0 && <div className="muted">No prescriptions yet.</div>}
        </div>
      </div>
    </div>
  );
}
