import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email' or 'reset'
  const [resetData, setResetData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message);
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setStep('reset');
          setIsSuccess(false);
        }, 1500);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (resetData.newPassword !== resetData.confirmPassword) {
      setMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (resetData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newPassword: resetData.newPassword,
          confirmPassword: resetData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Password reset successfully! Redirecting to login...');
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Reset Password</h2>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
              />
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit}>
            <p className="reset-info">Email: {email}</p>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={resetData.newPassword}
                onChange={(e) =>
                  setResetData({ ...resetData, newPassword: e.target.value })
                }
                required
                placeholder="Enter your new password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={resetData.confirmPassword}
                onChange={(e) =>
                  setResetData({ ...resetData, confirmPassword: e.target.value })
                }
                required
                placeholder="Confirm your new password"
              />
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {message && (
          <div className={`message ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="footer-links">
          <Link to="/login">Back to Login</Link>
          <span>|</span>
          <Link to="/signup">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
