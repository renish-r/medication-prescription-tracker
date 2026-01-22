import { useEffect, useState } from 'react';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import MedicationTracker from '../../components/MedicationTracker';

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showTracker, setShowTracker] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/patient/prescriptions', { token: user?.token });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const openDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setTimeout(() => setSelectedPrescription(null), 300);
  };

  const downloadPDF = async (prescriptionId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/prescriptions/${prescriptionId}/download-pdf`,
        {
          headers: { 
            'Authorization': `Bearer ${user.token}` 
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription_${prescriptionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download PDF: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '#4caf50';
      case 'EXPIRED':
        return '#f44336';
      case 'RENEWED':
        return '#2196f3';
      case 'CANCELLED':
        return '#757575';
      default:
        return '#999';
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      ACTIVE: '#e8f5e9',
      EXPIRED: '#ffebee',
      RENEWED: '#e3f2fd',
      CANCELLED: '#f5f5f5',
    };
    const textColors = {
      ACTIVE: '#2e7d32',
      EXPIRED: '#c62828',
      RENEWED: '#1565c0',
      CANCELLED: '#424242',
    };
    return {
      backgroundColor: colors[status],
      color: textColors[status],
    };
  };

  if (loading) return <div className="card"><p>Loading prescriptions…</p></div>;

  return (
    <>
      {/* Full-Screen Medication Tracker Modal */}
      {showTracker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#f5f5f5',
          zIndex: 1999,
          overflowY: 'auto',
          paddingBottom: '20px',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            {/* Close Button - Scrolls with content */}
            <div style={{ marginBottom: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setShowTracker(false)}
                style={{
                  background: 'white',
                  color: '#2196f3',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                ✕ Close
              </button>
            </div>

            <MedicationTracker />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="stack">
        {/* Medication Tracker Reminder Button */}
        <div className="card" style={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>💊</span>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Medication Reminders</h3>
                <p className="muted" style={{ margin: '0', fontSize: '13px' }}>Track your daily medication schedule</p>
              </div>
            </div>
            <button 
              className="primary" 
              onClick={() => setShowTracker(true)}
              style={{ whiteSpace: 'nowrap' }}
            >
              🔔 Open Tracker
            </button>
          </div>
        </div>
      
        {error && <div className="card error">{error}</div>}
      
      <div className="card">
        <div className="card-header">
          <div>
            <h2>My Prescriptions</h2>
            <p className="muted">View and manage your prescriptions</p>
          </div>
          <button className="secondary" onClick={load}>Refresh</button>
        </div>
        
        <div className="list">
          {items.map((p) => (
            <div key={p.id} className="list-item" onClick={() => openDetails(p)} style={{ cursor: 'pointer' }}>
              <div style={{ flex: 1 }}>
                <div className="title">{p.diagnosis || 'Prescription #' + p.id}</div>
                <div className="muted">
                  👨‍⚕️ Dr. {p.doctorName || p.doctorEmail}
                </div>
                <div className="muted">
                  📋 {p.medicines?.length || 0} medicine(s)
                </div>
              </div>
              
              <div style={{ textAlign: 'right', minWidth: '120px' }}>
                <div 
                  className="pill" 
                  style={{
                    ...getStatusBadge(p.status),
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  {p.status}
                </div>
                <div className="muted" style={{ fontSize: '12px' }}>
                  Expires: {new Date(p.expiryDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p className="muted" style={{ fontSize: '14px' }}>
                📭 No prescriptions yet
              </p>
              <p className="muted" style={{ fontSize: '12px' }}>
                Your doctor will send prescriptions here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Details Modal */}
      {showDetails && selectedPrescription && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={closeDetails}
        >
          <div 
            className="card"
            style={{
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <div>
                <h2>Prescription Details</h2>
                <p className="muted">#{selectedPrescription.id}</p>
              </div>
              <button 
                className="link-btn"
                onClick={closeDetails}
                style={{ fontSize: '20px', padding: '0' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px' }}>
              {/* Header Info */}
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0' }}>{selectedPrescription.diagnosis || 'Prescription'}</h3>
                    <p className="muted">Issued: {new Date(selectedPrescription.issuedDate).toLocaleDateString()}</p>
                  </div>
                  <div 
                    className="pill"
                    style={{
                      ...getStatusBadge(selectedPrescription.status),
                      padding: '6px 14px',
                      borderRadius: '14px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                    }}
                  >
                    {selectedPrescription.status}
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', color: '#666' }}>
                  Prescribed By
                </p>
                <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
                    Dr. {selectedPrescription.doctorName || 'Doctor'}
                  </p>
                  <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
                    {selectedPrescription.doctorEmail}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', color: '#666' }}>
                  Validity
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                    <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Issued</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>
                      {new Date(selectedPrescription.issuedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                    <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Expires</p>
                    <p style={{ 
                      margin: '4px 0 0 0', 
                      fontWeight: '600',
                      color: new Date(selectedPrescription.expiryDate) < new Date() ? '#c62828' : '#2e7d32'
                    }}>
                      {new Date(selectedPrescription.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medicines */}
              <div>
                <p style={{ margin: '0 0 12px 0', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', color: '#666' }}>
                  Medicines ({selectedPrescription.medicines?.length || 0})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(selectedPrescription.medicines || []).map((m) => (
                    <div 
                      key={m.id}
                      style={{
                        backgroundColor: '#f9f9f9',
                        padding: '12px',
                        borderRadius: '6px',
                        borderLeft: '3px solid #2196f3',
                      }}
                    >
                      <p style={{ margin: '0 0 6px 0', fontWeight: '600' }}>
                        {m.medicineName}
                      </p>
                      <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
                        <p style={{ margin: '0' }}>
                          <strong>Dosage:</strong> {m.dosage}
                        </p>
                        <p style={{ margin: '0' }}>
                          <strong>Frequency:</strong> {m.frequency}
                        </p>
                        <p style={{ margin: '0' }}>
                          <strong>Duration:</strong> {m.durationDays} days
                        </p>
                        {m.instructions && (
                          <p style={{ margin: '4px 0 0 0', color: '#666', fontStyle: 'italic' }}>
                            {m.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
              <button 
                className="primary" 
                onClick={() => downloadPDF(selectedPrescription.id)}
                style={{ flex: 1 }}
              >
                📄 Download PDF
              </button>
              <button className="secondary" onClick={closeDetails} style={{ flex: 1 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
