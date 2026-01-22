import { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function PendingUsers() {
  const { user } = useAuth();
  const token = user?.token;
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPendingUsers = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/admin/users/pending', { token });
      setPendingUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingUsers();
  }, [token]);

  const activateUser = async (userId) => {
    setError('');
    try {
      const res = await apiFetch(`/admin/users/${userId}/activate`, { method: 'PUT', token });
      if (res?.success) {
        // Remove from pending list
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this pending account?')) return;
    setError('');
    try {
      const res = await apiFetch(`/admin/users/${userId}`, { method: 'DELETE', token });
      if (res?.success) {
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
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
            <h2>Pending User Validations</h2>
            <p className="muted">
              New accounts awaiting approval. Activate to grant access or delete to reject.
            </p>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        
        {loading ? (
          <div className="muted">Loading…</div>
        ) : pendingUsers.length === 0 ? (
          <div className="muted">No pending user validations.</div>
        ) : (
          <div className="list">
            {pendingUsers.map((u) => (
              <div key={u.id} className="list-item">
                <div>
                  <div className="title">{u.email}</div>
                  <div className="muted">Role: {u.role}</div>
                  <div className="muted">Created by: {u.createdBy || 'SELF'}</div>
                  <div className="muted">Status: Inactive</div>
                </div>
                  // Deprecated: PendingUsers page was part of a removed workflow and is intentionally unused.
                  export default function PendingUsers() { return null; }
                  <button 
