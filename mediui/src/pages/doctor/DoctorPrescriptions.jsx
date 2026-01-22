import { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const emptyMed = { name: '', dosage: '', timing: '', duration: '', notes: '' };

const COMMON_MEDICINES = [
  'Paracetamol 500mg',
  'Paracetamol 650mg',
  'Ibuprofen 400mg',
  'Amoxicillin 500mg',
  'Azithromycin 500mg',
  'Ciprofloxacin 500mg',
  'Metformin 500mg',
  'Atorvastatin 10mg',
  'Amlodipine 5mg',
  'Losartan 50mg',
  'Omeprazole 20mg',
  'Pantoprazole 40mg',
  'Cetirizine 10mg',
  'Montelukast 10mg',
  'Salbutamol Inhaler',
  'Aspirin 75mg',
  'Clopidogrel 75mg',
  'Levothyroxine 50mcg',
  'Insulin Glargine',
  'Metoprolol 50mg',
  'Furosemide 40mg',
  'Spironolactone 25mg',
  'Prednisolone 5mg',
  'Diclofenac 50mg',
  'Ranitidine 150mg',
  'Domperidone 10mg',
  'Loperamide 2mg',
  'Vitamin D3 1000IU',
  'Calcium + Vitamin D',
  'Multivitamin Tablet',
  'Iron + Folic Acid',
  'Zinc Sulphate 20mg',
  'Doxycycline 100mg',
  'Cefixime 200mg',
  'Fluconazole 150mg',
];

const DOSAGE_OPTIONS = {
  tablet: ['1 tablet', '1/2 tablet', '1.5 tablets', '2 tablets', 'As directed'],
  capsule: ['1 capsule', '2 capsules', 'As directed'],
  liquid: ['2.5ml (1/2 tsp)', '5ml (1 tsp)', '10ml (2 tsp)', '15ml (1 tbsp)', '20ml', 'As directed'],
  inhaler: ['1 puff', '2 puffs', '1 nebulization', 'As directed'],
  injection: ['0.5 ml', '1 ml', '2 ml', '1 vial', 'As directed'],
  other: ['Standard dose', 'As directed'],
};

const detectFormFromName = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('inhaler') || n.includes('puff') || n.includes('mdi')) return 'inhaler';
  if (/\b(inj|injection|vial)\b/.test(n) || n.includes('insulin')) return 'injection';
  if (/\b(cap|capsule|cap.)\b/.test(n)) return 'capsule';
  if (/\b(tab|tablet|tbl)\b/.test(n)) return 'tablet';
  if (/\d+\s?ml\b/.test(n) || /(syrup|suspension|solution|drops?)/.test(n)) return 'liquid';
  return 'tablet';
};

const getDosageOptions = (medicineName) => {
  const form = detectFormFromName(medicineName);
  const options = DOSAGE_OPTIONS[form] || DOSAGE_OPTIONS.tablet;
  return { formLabel: form, options };
};

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

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
          <input name="diagnosis" placeholder="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} required />
          <input name="expiryDate" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} min={getMinDate()} required />

          <div className="section">
            <div className="section-header">
              <h3>Medicines</h3>
              <button type="button" onClick={addMed} className="secondary">Add medicine</button>
            </div>
            {form.medications.map((m, idx) => {
              const { formLabel, options } = getDosageOptions(m.name);
              const listId = `common-medicines-${idx}`; // unique datalist per row so the arrow always shows options
              const hasName = m.name.trim().length > 0;
              return (
                <div key={idx} className="med-row">
                  <input 
                    list={listId}
                    placeholder="Name (type or select)" 
                    value={m.name} 
                    onChange={(e) => updateMed(idx, 'name', e.target.value)} 
                    required 
                  />
                  <datalist id={listId}>
                    {COMMON_MEDICINES.map((med, i) => (
                      <option key={i} value={med} />
                    ))}
                  </datalist>
                  
                  <select 
                    value={m.dosage} 
                    onChange={(e) => updateMed(idx, 'dosage', e.target.value)}
                    disabled={!hasName}
                    required
                  >
                    <option value="">Select dosage ({formLabel})</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    {m.dosage && !options.includes(m.dosage) && (
                      <option value={m.dosage}>{m.dosage} (custom)</option>
                    )}
                  </select>
                  
                <select 
                  value={m.timing} 
                  onChange={(e) => updateMed(idx, 'timing', e.target.value)}
                  disabled={!hasName}
                  required
                >
                  <option value="">Select Timing</option>
                  <option value="Once daily - Morning">Once daily - Morning</option>
                  <option value="Once daily - Evening">Once daily - Evening</option>
                  <option value="Once daily - Bedtime">Once daily - Bedtime</option>
                  <option value="Twice daily - Morning & Evening">Twice daily - Morning & Evening</option>
                  <option value="Twice daily - After meals">Twice daily - After meals</option>
                  <option value="Three times daily - After meals">Three times daily - After meals</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="Before breakfast">Before breakfast</option>
                  <option value="After breakfast">After breakfast</option>
                  <option value="Before lunch">Before lunch</option>
                  <option value="After lunch">After lunch</option>
                  <option value="Before dinner">Before dinner</option>
                  <option value="After dinner">After dinner</option>
                  <option value="Every 4-6 hours as needed">Every 4-6 hours as needed</option>
                  <option value="Weekly">Weekly</option>
                  <option value="As needed">As needed (SOS)</option>
                </select>
                
                <select 
                  value={m.duration} 
                  onChange={(e) => updateMed(idx, 'duration', e.target.value)}
                  disabled={!hasName}
                  required
                >
                  <option value="">Select Duration</option>
                  <option value="3 days">3 days</option>
                  <option value="5 days">5 days</option>
                  <option value="7 days">7 days (1 week)</option>
                  <option value="10 days">10 days</option>
                  <option value="14 days">14 days (2 weeks)</option>
                  <option value="21 days">21 days (3 weeks)</option>
                  <option value="30 days">30 days (1 month)</option>
                  <option value="60 days">60 days (2 months)</option>
                  <option value="90 days">90 days (3 months)</option>
                  <option value="180 days">180 days (6 months)</option>
                  <option value="Continuous">Continuous</option>
                  <option value="As needed">As needed</option>
                </select>
                
                <input placeholder="Additional instructions (optional)" value={m.notes} onChange={(e) => updateMed(idx, 'notes', e.target.value)} />
                {form.medications.length > 1 && <button type="button" onClick={() => removeMed(idx)} className="link-btn">Remove</button>}
                </div>
              );
            })}
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
