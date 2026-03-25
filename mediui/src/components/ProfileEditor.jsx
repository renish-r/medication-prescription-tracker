import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import './ProfileEditor.css';

export default function ProfileEditor() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [originalData, setOriginalData] = useState({});
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiClient.get('/profile');
      
      // Handle the API response structure
      if (data && data.userId) {
        // API returned profile data
        setProfile(data);
        setFormData(data);
        setOriginalData(data);
      } else if (data && (data.email || data.role)) {
        // Fallback structure
        setProfile(data);
        setFormData(data);
        setOriginalData(data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Profile loading error:', error);
      setMessage('Error loading profile: ' + error.message);
      setProfile({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      // Get token from AuthContext storage
      const authData = localStorage.getItem('medimanager_auth');
      if (!authData) {
        setMessage('No authentication token found. Please login again.');
        setIsSaving(false);
        return;
      }

      const { token } = JSON.parse(authData);
      const role = profile?.role?.toLowerCase();

      const data = await apiFetch(`/profile/${role}`, {
        method: 'PUT',
        token,
        body: formData,
      });

      if (data.success) {
        setMessage('Profile updated successfully!');
        setIsSuccess(true);
        setOriginalData(formData);
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };



  if (isLoading) {
    return <div className="profile-editor-container"><div className="profile-card"><p>Loading profile...</p></div></div>;
  }

  if (!profile || !profile.email) {
    return (
      <div className="profile-editor-container">
        <div className="profile-card">
          <p style={{ color: '#d32f2f' }}>{message || 'Error loading profile'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-editor-container">
      <div className="profile-card">
        <h2>Edit Profile</h2>

        <div className="profile-header">
          <p>
            <strong>Email:</strong> {profile.email || 'N/A'}
          </p>
          <p>
            <strong>Role:</strong> {profile.role || 'N/A'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Common fields for all roles */}
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>

          {/* Patient specific fields */}
          {profile.role === 'PATIENT' && (
            <>
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  placeholder="Enter your age"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bloodGroup">Blood Group</label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Blood Group</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="medicalHistory">Medical History</label>
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  value={formData.medicalHistory || ''}
                  onChange={handleChange}
                  placeholder="Enter your medical history"
                  rows="3"
                />
              </div>
            </>
          )}

          {/* Doctor specific fields */}
          {profile.role === 'DOCTOR' && (
            <>
              <div className="form-group">
                <label htmlFor="specialization">Specialization</label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization || ''}
                  onChange={handleChange}
                  placeholder="e.g., Cardiology"
                />
              </div>

              <div className="form-group">
                <label htmlFor="licenseNumber">License Number</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={handleChange}
                  placeholder="Enter your license number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="clinicAddress">Clinic Address</label>
                <textarea
                  id="clinicAddress"
                  name="clinicAddress"
                  value={formData.clinicAddress || ''}
                  onChange={handleChange}
                  placeholder="Enter your clinic address"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="experienceYears">Years of Experience</label>
                <input
                  type="number"
                  id="experienceYears"
                  name="experienceYears"
                  value={formData.experienceYears || ''}
                  onChange={handleChange}
                  placeholder="Enter years of experience"
                />
              </div>
            </>
          )}

          {/* Pharmacist specific fields */}
          {profile.role === 'PHARMACIST' && (
            <>
              <div className="form-group">
                <label htmlFor="pharmacyName">Pharmacy Name</label>
                <input
                  type="text"
                  id="pharmacyName"
                  name="pharmacyName"
                  value={formData.pharmacyName || ''}
                  onChange={handleChange}
                  placeholder="Enter pharmacy name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="licenseNumber">License Number</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={handleChange}
                  placeholder="Enter your license number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  placeholder="Enter pharmacy address"
                  rows="3"
                />
              </div>
            </>
          )}

          <button type="submit" disabled={isSaving || JSON.stringify(formData) === JSON.stringify(originalData)}>
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {message && (
          <div className={`message ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Change Password Button */}
        <button 
          type="button" 
          className="change-password-btn"
          onClick={() => navigate('/change-password')}
        >
          Change Password
        </button>
      </div>
    </div>
  );
}