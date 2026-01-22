import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';
import './PatientAdherence.css';

const PatientAdherence = () => {
  const { user } = useAuth();
  const [lowAdherencePatients, setLowAdherencePatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSchedules, setPatientSchedules] = useState([]);
  const [patientDoseLogs, setPatientDoseLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('alerts'); // alerts, all, details
  const [adherenceThreshold, setAdherenceThreshold] = useState(70);

  useEffect(() => {
    fetchLowAdherencePatients();
    fetchAllPatientsWithPrescriptions();
  }, [adherenceThreshold]);

  const fetchLowAdherencePatients = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/patient/schedules/adherence/alerts?threshold=${adherenceThreshold}`, { 
        token: user?.token 
      });
      
      // Group schedules by patient
      const patientMap = {};
      (Array.isArray(data) ? data : []).forEach(schedule => {
        const patientId = schedule.patient?.id;
        if (patientId) {
          if (!patientMap[patientId]) {
            patientMap[patientId] = {
              patient: schedule.patient,
              schedules: [],
              adherence: 0
            };
          }
          patientMap[patientId].schedules.push(schedule);
        }
      });

      // Calculate adherence for each patient
      const patients = await Promise.all(
        Object.values(patientMap).map(async (item) => {
          try {
            const adherenceData = await apiFetch(
              `/patient/schedules/adherence/patient/${item.patient.id}`, 
              { token: user?.token }
            );
            return {
              ...item,
              adherence: adherenceData.adherence || 0
            };
          } catch (err) {
            return { ...item, adherence: 0 };
          }
        })
      );

      setLowAdherencePatients(patients.sort((a, b) => a.adherence - b.adherence));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching low adherence patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPatientsWithPrescriptions = async () => {
    try {
      const prescriptions = await apiFetch('/doctor/prescriptions', { token: user?.token });
      
      // Extract unique patients
      const patientMap = {};
      (Array.isArray(prescriptions) ? prescriptions : []).forEach(prescription => {
        const patient = prescription.patient;
        if (patient && !patientMap[patient.id]) {
          patientMap[patient.id] = {
            id: patient.id,
            name: patient.name || patient.email,
            email: patient.email,
            adherence: null,
            prescriptionCount: 0,
            scheduleCount: 0
          };
        }
        if (patient) {
          patientMap[patient.id].prescriptionCount++;
        }
      });

      const patients = await Promise.all(
        Object.values(patientMap).map(async (patient) => {
          try {
            const adherenceData = await apiFetch(
              `/patient/schedules/adherence/patient/${patient.id}`, 
              { token: user?.token }
            );
            return {
              ...patient,
              adherence: adherenceData.adherence || 0,
              scheduleCount: adherenceData.scheduleCount || 0
            };
          } catch (err) {
            return patient;
          }
        })
      );

      setAllPatients(patients.sort((a, b) => (a.adherence || 0) - (b.adherence || 0)));
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const viewPatientDetails = async (patient) => {
    try {
      setSelectedPatient(patient);
      setActiveView('details');
      
      // Fetch patient's medication schedules
      const schedules = await apiFetch(`/doctor/patients/${patient.id}/schedules`, { 
        token: user?.token 
      });
      setPatientSchedules(Array.isArray(schedules) ? schedules : []);

      // Fetch patient's dose logs
      const logs = await apiFetch(`/doctor/patients/${patient.id}/dose-logs`, { 
        token: user?.token 
      });
      setPatientDoseLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError('Failed to load patient details. Using patient schedules endpoint instead.');
      setPatientSchedules([]);
      setPatientDoseLogs([]);
    }
  };

  const getAdherenceColor = (adherence) => {
    if (adherence >= 80) return '#4caf50';
    if (adherence >= 60) return '#ff9800';
    return '#f44336';
  };

  const getAdherenceBadge = (adherence) => {
    if (adherence >= 80) return { text: 'Excellent', color: '#4caf50' };
    if (adherence >= 60) return { text: 'Good', color: '#ff9800' };
    if (adherence >= 40) return { text: 'Fair', color: '#ff5722' };
    return { text: 'Poor', color: '#f44336' };
  };

  if (loading && activeView === 'alerts') {
    return <div className="adherence-dashboard loading">Loading adherence data...</div>;
  }

  return (
    <div className="adherence-dashboard">
      {activeView !== 'details' && (
        <>
          <div className="dashboard-header">
            <div>
              <h1>📊 Patient Adherence Dashboard</h1>
              <p className="subtitle">Monitor patient medication compliance</p>
            </div>
            <div className="threshold-control">
              <label>Alert Threshold:</label>
              <select 
                value={adherenceThreshold} 
                onChange={(e) => setAdherenceThreshold(Number(e.target.value))}
                className="threshold-select"
              >
                <option value={90}>90%</option>
                <option value={80}>80%</option>
                <option value={70}>70%</option>
                <option value={60}>60%</option>
                <option value={50}>50%</option>
              </select>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="dashboard-tabs">
            <button 
              className={`tab-btn ${activeView === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveView('alerts')}
            >
              🚨 Low Adherence Alerts ({lowAdherencePatients.length})
            </button>
            <button 
              className={`tab-btn ${activeView === 'all' ? 'active' : ''}`}
              onClick={() => setActiveView('all')}
            >
              👥 All Patients ({allPatients.length})
            </button>
          </div>
        </>
      )}

      {/* Low Adherence Alerts View */}
      {activeView === 'alerts' && (
        <div className="tab-content">
          {lowAdherencePatients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>No Adherence Alerts</h3>
              <p>All patients are maintaining good medication adherence (≥{adherenceThreshold}%)</p>
            </div>
          ) : (
            <div className="patients-grid">
              {lowAdherencePatients.map((item, idx) => {
                const badge = getAdherenceBadge(item.adherence);
                return (
                  <div key={idx} className="patient-alert-card" onClick={() => viewPatientDetails(item.patient)}>
                    <div className="alert-header">
                      <div className="patient-info">
                        <div className="patient-avatar" style={{ backgroundColor: getAdherenceColor(item.adherence) }}>
                          {item.patient.name ? item.patient.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <h3>{item.patient.name || 'Unknown'}</h3>
                          <p className="patient-email">{item.patient.email}</p>
                        </div>
                      </div>
                      <div className="adherence-circle" style={{ borderColor: badge.color }}>
                        <span className="percentage">{item.adherence.toFixed(0)}%</span>
                        <span className="label" style={{ color: badge.color }}>{badge.text}</span>
                      </div>
                    </div>
                    
                    <div className="alert-details">
                      <div className="detail-item">
                        <span className="detail-label">Medications:</span>
                        <span className="detail-value">{item.schedules.length}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className="status-badge warning">Needs Attention</span>
                      </div>
                    </div>

                    <div className="medications-preview">
                      <strong>Active Medications:</strong>
                      <ul>
                        {item.schedules.slice(0, 3).map((schedule, i) => (
                          <li key={i}>{schedule.medicineName} - {schedule.frequency}</li>
                        ))}
                        {item.schedules.length > 3 && (
                          <li className="more">+{item.schedules.length - 3} more</li>
                        )}
                      </ul>
                    </div>

                    <button className="view-details-btn">View Details →</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* All Patients View */}
      {activeView === 'all' && (
        <div className="tab-content">
          {allPatients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No Patients Found</h3>
              <p>You haven't prescribed to any patients yet</p>
            </div>
          ) : (
            <div className="patients-table">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Email</th>
                    <th>Prescriptions</th>
                    <th>Med Schedules</th>
                    <th>Adherence</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allPatients.map((patient) => {
                    const badge = getAdherenceBadge(patient.adherence || 0);
                    return (
                      <tr key={patient.id}>
                        <td>
                          <div className="table-patient-info">
                            <div className="patient-avatar-small">
                              {patient.name ? patient.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span>{patient.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td>{patient.email}</td>
                        <td className="centered">{patient.prescriptionCount}</td>
                        <td className="centered">{patient.scheduleCount || 0}</td>
                        <td className="centered">
                          <div className="adherence-bar-container">
                            <div 
                              className="adherence-bar" 
                              style={{ 
                                width: `${patient.adherence || 0}%`,
                                backgroundColor: getAdherenceColor(patient.adherence || 0)
                              }}
                            />
                            <span className="adherence-text">{(patient.adherence || 0).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="centered">
                          <span 
                            className="status-pill" 
                            style={{ backgroundColor: badge.color }}
                          >
                            {badge.text}
                          </span>
                        </td>
                        <td className="centered">
                          <button 
                            className="action-btn"
                            onClick={() => viewPatientDetails(patient)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Patient Details View */}
      {activeView === 'details' && selectedPatient && (
        <div className="patient-details-view">
          <div className="details-header">
            <button className="back-btn" onClick={() => setActiveView('alerts')}>
              ← Back to Dashboard
            </button>
            <div className="patient-details-info">
              <div className="patient-avatar-large">
                {selectedPatient.name ? selectedPatient.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h2>{selectedPatient.name || 'Unknown Patient'}</h2>
                <p>{selectedPatient.email}</p>
              </div>
            </div>
            <div className="adherence-summary">
              <div className="adherence-circle-large" style={{ borderColor: getAdherenceColor(selectedPatient.adherence || 0) }}>
                <span className="percentage">{(selectedPatient.adherence || 0).toFixed(0)}%</span>
                <span className="label">Adherence</span>
              </div>
            </div>
          </div>

          <div className="details-content">
            <div className="details-section">
              <h3>📋 Medication Schedules</h3>
              {patientSchedules.length === 0 ? (
                <p className="empty-message">No medication schedules found</p>
              ) : (
                <div className="schedules-list">
                  {patientSchedules.map((schedule) => (
                    <div key={schedule.id} className="schedule-item">
                      <div className="schedule-info">
                        <h4>{schedule.medicineName}</h4>
                        <p>Time: {schedule.timeOfDay} | Frequency: {schedule.frequency}</p>
                        <p className="schedule-dates">
                          {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`schedule-status ${schedule.active ? 'active' : 'inactive'}`}>
                        {schedule.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="details-section">
              <h3>📊 Dose History</h3>
              {patientDoseLogs.length === 0 ? (
                <p className="empty-message">No dose logs recorded</p>
              ) : (
                <div className="dose-logs-list">
                  {patientDoseLogs.slice(0, 10).map((log, idx) => (
                    <div key={idx} className="dose-log-item">
                      <div className={`log-status ${log.status.toLowerCase()}`}>
                        {log.status === 'TAKEN' ? '✓' : '✗'}
                      </div>
                      <div className="log-info">
                        <strong>{log.schedule?.medicineName || 'Unknown'}</strong>
                        <p>{new Date(log.takenAt).toLocaleString()}</p>
                      </div>
                      <div className={`log-badge ${log.status.toLowerCase()}`}>
                        {log.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAdherence;
