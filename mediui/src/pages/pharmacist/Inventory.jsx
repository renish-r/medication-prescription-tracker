import { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function InventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [low, setLow] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [form, setForm] = useState({
    drugName: '',
    batchNumber: '',
    expiryDate: '',
    stockQuantity: '',
    threshold: '',
    unitPrice: '',
    manufacturer: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await apiFetch('/pharmacist/inventory', { token: user?.token });
      setItems(Array.isArray(data) ? data : []);
      const lowData = await apiFetch('/pharmacist/inventory/low-stock', { token: user?.token });
      setLow(Array.isArray(lowData) ? lowData : []);
      const expData = await apiFetch('/pharmacist/inventory/expiring?daysAhead=60', { token: user?.token });
      setExpiring(Array.isArray(expData) ? expData : []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/pharmacist/inventory/add', {
        method: 'POST',
        token: user?.token,
        body: {
          ...form,
          stockQuantity: Number(form.stockQuantity),
          threshold: Number(form.threshold),
          unitPrice: Number(form.unitPrice),
        },
      });
      setForm({ drugName: '', batchNumber: '', expiryDate: '', stockQuantity: '', threshold: '', unitPrice: '', manufacturer: '' });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Add drug</h2>
            <p className="muted">Stock and expiry tracking</p>
          </div>
        </div>
        <form className="form" onSubmit={submit}>
          <input name="drugName" placeholder="Drug name" value={form.drugName} onChange={onChange} required />
          <input name="batchNumber" placeholder="Batch number" value={form.batchNumber} onChange={onChange} required />
          <input name="expiryDate" type="date" value={form.expiryDate} onChange={onChange} required />
          <input name="stockQuantity" type="number" placeholder="Stock quantity" value={form.stockQuantity} onChange={onChange} required />
          <input name="threshold" type="number" placeholder="Low-stock threshold" value={form.threshold} onChange={onChange} required />
          <input name="unitPrice" type="number" step="0.01" placeholder="Unit price" value={form.unitPrice} onChange={onChange} required />
          <input name="manufacturer" placeholder="Manufacturer" value={form.manufacturer} onChange={onChange} required />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Add to inventory'}</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Inventory</h2>
            <p className="muted">Current stock</p>
          </div>
        </div>
        <div className="list">
          {items.map((d) => (
            <div key={d.id} className="list-item">
              <div className="title">{d.drugName} ({d.batchNumber})</div>
              <div className="muted">Stock: {d.stockQuantity} · Threshold: {d.threshold}</div>
              <div className="muted">Expiry: {d.expiryDate}</div>
            </div>
          ))}
          {items.length === 0 && <div className="muted">No items yet.</div>}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Alerts</h2>
            <p className="muted">Low stock and expiring soon</p>
          </div>
        </div>
        <div className="list">
          {low.length === 0 && expiring.length === 0 && <div className="muted">No alerts.</div>}
          {low.map((d) => (
            <div key={`low-${d.id}`} className="list-item warn">
              <div className="title">Low stock: {d.drugName}</div>
              <div className="muted">Qty {d.stockQuantity} / Threshold {d.threshold}</div>
            </div>
          ))}
          {expiring.map((d) => (
            <div key={`exp-${d.id}`} className="list-item warn">
              <div className="title">Expiring soon: {d.drugName}</div>
              <div className="muted">Expiry {d.expiryDate}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
