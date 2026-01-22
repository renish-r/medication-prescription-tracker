import { useState } from 'react';
import { apiFetch } from '../api/client';
import './ChangePassword.css';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      // Get token from AuthContext storage
      const authData = localStorage.getItem('medimanager_auth');
      if (!authData) {
        setMessage('No authentication token found. Please login again.');
        setIsLoading(false);
        return;
      }

      const { token } = JSON.parse(authData);
      
      const data = await apiFetch('/auth/change-password', {
        method: 'PUT',
        token,
        body: {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        },
      });

      if (data.success) {
        setMessage('Password changed successfully!');
        setIsSuccess(true);
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      } else {
        setMessage(data.message || 'Failed to change password');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <h2>Change Password</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              required
              placeholder="Enter your current password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="Enter your new password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your new password"
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Change Password'}
          </button>
        </form>

        {message && (
          <div className={`message ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
