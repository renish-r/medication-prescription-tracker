import React, { useState } from 'react';
import './AddMedicationModal.css';

const AddMedicationModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [formData, setFormData] = useState({
    medicineName: '',
    timeOfDay: '',
    frequency: 'DAILY',
    durationDays: 30
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/patient/schedules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create schedule');
      }

      // Reset form
      setFormData({
        medicineName: '',
        timeOfDay: '',
        frequency: 'DAILY',
        durationDays: 30
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💊 Add Medication Schedule</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="medication-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="medicineName">
              Medicine Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="medicineName"
              name="medicineName"
              value={formData.medicineName}
              onChange={handleChange}
              placeholder="e.g., Aspirin, Metformin"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeOfDay">
              Time of Day <span className="required">*</span>
            </label>
            <input
              type="time"
              id="timeOfDay"
              name="timeOfDay"
              value={formData.timeOfDay}
              onChange={handleChange}
              required
            />
            <small className="form-hint">When should you take this medication?</small>
          </div>

          <div className="form-group">
            <label htmlFor="frequency">
              Frequency <span className="required">*</span>
            </label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              required
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="AS_NEEDED">As Needed</option>
            </select>
            <small className="form-hint">How often should you take this?</small>
          </div>

          <div className="form-group">
            <label htmlFor="durationDays">
              Duration (days) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="durationDays"
              name="durationDays"
              value={formData.durationDays}
              onChange={handleChange}
              min="1"
              max="365"
              required
            />
            <small className="form-hint">For how many days? (1-365)</small>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Medication'}
            </button>
          </div>
        </form>

        <div className="modal-footer">
          <p className="footer-note">
            💡 You can track and manage this medication from your dashboard after adding it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddMedicationModal;
