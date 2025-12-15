// src/components/auth/LoginForm.js
import React, { useState } from "react";

function LoginForm({ onLogin, error, loading }) {
  const [form, setForm] = useState({
    usernameOrEmail: "",
    password: "",
    role: "PATIENT",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(form);
  };

  return (
    <>
      <h1 className="app-title">Online Prescription Tracker</h1>
      <h2 className="login-title">Login</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Username / Email</label>
          <input
            name="usernameOrEmail"
            value={form.usernameOrEmail}
            onChange={handleChange}
            placeholder="Enter username or email"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
        </div>
        <div className="form-group">
          <label>Login as</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="PATIENT">Patient</option>
            <option value="DOCTOR">Doctor</option>
            <option value="PHARMACIST">Pharmacist</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </>
  );
}

export default LoginForm;
