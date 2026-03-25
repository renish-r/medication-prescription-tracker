import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import AddMedicationModal from './AddMedicationModal';
import './MedicationTracker.css';

const MedicationTracker = () => {
  const { user } = useAuth();
  const isPatient = user?.role === 'PATIENT';
  
  console.log('MedicationTracker user:', { 
    email: user?.email, 
    role: user?.role, 
    isPatient,
    tokenPreview: user?.token?.substring(0, 50) + '...'
  });
  const [todaysMeds, setTodaysMeds] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [doseLogs, setDoseLogs] = useState([]);
  const [adherence, setAdherence] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('today'); // today, all, history
  const [loggingDoseId, setLoggingDoseId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [hideTaken, setHideTaken] = useState(false);

  // Fetch patient's medication schedules
  useEffect(() => {
    if (!user?.token) return;
    if (!isPatient) {
      setError('Please log in with a patient account to view medications.');
      setLoading(false);
      return;
    }
    refreshAll();
  }, [user?.token, isPatient]);

  const refreshAll = async () => {
    if (!isPatient) {
      setError('Please log in with a patient account to view medications.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchSchedules(), fetchDoseLogs(), calculateAdherence()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    const data = await apiFetch('/patient/schedules', { token: user?.token });
    const schedules = Array.isArray(data) ? data : [];
    setAllSchedules(schedules);
    filterTodaysMeds(schedules);
  };

  const filterTodaysMeds = (schedules) => {
    const today = new Date();
    const todayMeds = schedules.filter(schedule => {
      if (!schedule.active) return false;
      
      const startDate = new Date(schedule.startDate);
      const endDate = new Date(schedule.endDate);
      
      return startDate <= today && today <= endDate;
    });

    // Sort by time of day
    todayMeds.sort((a, b) => {
      const timeA = a.timeOfDay.split(':');
      const timeB = b.timeOfDay.split(':');
      return parseInt(timeA[0]) - parseInt(timeB[0]);
    });

    setTodaysMeds(todayMeds);
  };

  const fetchDoseLogs = async () => {
    const data = await apiFetch('/patient/dose-logs', { token: user?.token });
    setDoseLogs(Array.isArray(data) ? data : []);
  };

  const calculateAdherence = async () => {
    const data = await apiFetch('/patient/schedules/adherence/me', { token: user?.token });
    setAdherence(data.adherencePercentage || 0);
  };

  const logDose = async (scheduleId, status) => {
    try {
      setLoggingDoseId(scheduleId);
      
      await apiFetch(`/patient/schedules/${scheduleId}/log-dose`, {
        method: 'POST',
        token: user?.token,
        body: { status }
      });

      setSuccessMessage(`✓ Dose logged as ${status}`);
      setTimeout(() => setSuccessMessage(''), 3000);

      // Refresh data
      await Promise.all([fetchDoseLogs(), calculateAdherence()]);
      filterTodaysMeds(allSchedules);

      // Notify other views (e.g., analytics) to refresh
      try {
        window.dispatchEvent(
          new CustomEvent('doseLogged', {
            detail: { scheduleId, status, at: new Date().toISOString() },
          })
        );
        // Cross-tab/session fallback: update a storage key to trigger 'storage' listeners
        try {
          localStorage.setItem('doseLoggedStamp', String(Date.now()));
        } catch (_) {}
      } catch (_) {}
    } catch (err) {
      setError(`Failed to log dose: ${err.message}`);
      setTimeout(() => setError(null), 3000);
      console.error('Error logging dose:', err);
    } finally {
      setLoggingDoseId(null);
    }
  };

  const getMedicationStatus = (schedule) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = doseLogs.filter(log => {
      const logDate = new Date(log.takenAt);
      logDate.setHours(0, 0, 0, 0);
      return log.schedule?.id === schedule.id && logDate.getTime() === today.getTime();
    });

    if (todayLogs.length > 0) {
      const latestLog = todayLogs[todayLogs.length - 1];
      return latestLog.status;
    }
    return null;
  };

  const getTimeColor = (timeOfDay) => {
    const [hour] = timeOfDay.split(':');
    const h = parseInt(hour);
    
    if (h >= 6 && h < 12) return '#FF6B6B'; // Morning - red
    if (h >= 12 && h < 18) return '#4ECDC4'; // Afternoon - teal
    return '#45B7D1'; // Evening/Night - blue
  };

  const getTimeLabel = (timeOfDay) => {
    const [hour] = timeOfDay.split(':');
    const h = parseInt(hour);
    
    if (h >= 6 && h < 12) return 'Morning';
    if (h >= 12 && h < 18) return 'Afternoon';
    if (h >= 18 && h < 21) return 'Evening';
    return 'Night';
  };

  const handleAddSuccess = () => {
    setSuccessMessage('✓ Medication schedule added successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
    refreshAll();
  };

  if (!isPatient) {
    return (
      <div className="medication-tracker loading">
        Please log in with a patient account to view medications.
      </div>
    );
  }

  if (loading) {
    return <div className="medication-tracker loading">Loading medications...</div>;
  }

  return (
    <div className="medication-tracker">
      <div className="tracker-header">
        <h1>💊 Medication Tracker</h1>
        <div className="header-actions">
          <div className="adherence-badge">
            <span className="adherence-value">{adherence.toFixed(1)}%</span>
            <span className="adherence-label">Adherence</span>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a5d6a7' }}>
            <input
              type="checkbox"
              checked={hideTaken}
              onChange={(e) => setHideTaken(e.target.checked)}
            />
            Hide Taken
          </label>
          <button className="btn-add-medication" onClick={() => setShowAddModal(true)}>
            + Add Medication
          </button>
        </div>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="tracker-tabs">
        <button 
          className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          📅 Today's Meds
        </button>
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          📋 All Schedules
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📊 History
        </button>
      </div>

      {/* Today's Medications */}
      {activeTab === 'today' && (
        <div className="tab-content">
          {todaysMeds.length === 0 ? (
            <div className="empty-state">
              <p>No medications scheduled for today</p>
            </div>
          ) : (
            <div className="medications-list">
              {todaysMeds.filter(med => {
                const status = getMedicationStatus(med);
                return !(hideTaken && status === 'TAKEN');
              }).map(med => {
                const status = getMedicationStatus(med);
                const timeColor = getTimeColor(med.timeOfDay);
                const timeLabel = getTimeLabel(med.timeOfDay);

                return (
                  <div key={med.id} className="medication-card">
                    <div className="med-time-section" style={{ borderLeftColor: timeColor }}>
                      <div className="time-badge" style={{ backgroundColor: timeColor }}>
                        <span className="time">{med.timeOfDay}</span>
                        <span className="time-label">{timeLabel}</span>
                      </div>
                    </div>

                    <div className="med-info">
                      <h3 className="med-name">{med.medicineName}</h3>
                      <p className="med-frequency">
                        <span className="frequency-badge">{med.frequency}</span>
                      </p>
                      {med.dosage && <p className="med-dosage">Dosage: {med.dosage}</p>}
                    </div>

                    <div className="med-status">
                      {status ? (
                        <div className={`status-badge ${status.toLowerCase()}`}>
                          {status === 'TAKEN' && '✓ Taken'}
                          {status === 'MISSED' && '✗ Missed'}
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button 
                            className="btn-taken"
                            onClick={() => logDose(med.id, 'TAKEN')}
                            disabled={loggingDoseId === med.id}
                          >
                            {loggingDoseId === med.id ? '...' : 'Mark Taken'}
                          </button>
                          <button 
                            className="btn-missed"
                            onClick={() => logDose(med.id, 'MISSED')}
                            disabled={loggingDoseId === med.id}
                          >
                            {loggingDoseId === med.id ? '...' : 'Mark Missed'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* All Schedules */}
      {activeTab === 'all' && (
        <div className="tab-content">
          {allSchedules.length === 0 ? (
            <div className="empty-state">
              <p>No medication schedules found</p>
            </div>
          ) : (
            <div className="schedules-list">
              {allSchedules.map(schedule => (
                <div key={schedule.id} className="schedule-card">
                  <div className="schedule-header">
                    <h4>{schedule.medicineName}</h4>
                    <span className={`status-indicator ${schedule.active ? 'active' : 'inactive'}`}>
                      {schedule.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="schedule-details">
                    <p><strong>Time:</strong> {schedule.timeOfDay}</p>
                    <p><strong>Frequency:</strong> {schedule.frequency}</p>
                    <p><strong>Start:</strong> {new Date(schedule.startDate).toLocaleDateString()}</p>
                    <p><strong>End:</strong> {new Date(schedule.endDate).toLocaleDateString()}</p>
                  </div>

                  <div className="schedule-logs">
                    <strong>Recent Doses:</strong>
                    <div className="log-summary">
                      {doseLogs.filter(l => l.schedule?.id === schedule.id).slice(-3).map((log, idx) => (
                        <span key={idx} className={`log-dot ${log.status.toLowerCase()}`} title={new Date(log.takenAt).toLocaleString()}>
                          {log.status === 'TAKEN' ? '✓' : '✗'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dose History */}
      {activeTab === 'history' && (
        <div className="tab-content">
          {doseLogs.length === 0 ? (
            <div className="empty-state">
              <p>No dose history available</p>
            </div>
          ) : (
            <div className="history-list">
              {doseLogs.slice().reverse().map((log, idx) => (
                <div key={idx} className="history-item">
                  <div className="history-status">
                    <span className={`status-icon ${log.status.toLowerCase()}`}>
                      {log.status === 'TAKEN' ? '✓' : '✗'}
                    </span>
                  </div>
                  
                  <div className="history-info">
                    <p className="med-name">{log.schedule?.medicineName || 'Unknown'}</p>
                    <p className="timestamp">
                      {new Date(log.takenAt).toLocaleString()}
                    </p>
                    {log.notes && <p className="notes">{log.notes}</p>}
                  </div>

                  <div className="history-status-badge">
                    <span className={`badge ${log.status.toLowerCase()}`}>
                      {log.status === 'TAKEN' ? 'Taken' : 'Missed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="tracker-footer">
        <p className="footer-info">
          💡 Keep track of your medications for better health management
        </p>
      </div>

      <AddMedicationModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        user={user}
      />
    </div>
  );
};

export default MedicationTracker;
