// src/components/auth/RegisterForm.js
import React, { useState } from "react";

function RegisterForm({ onRegister, error, loading }) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "PATIENT",
    medicalHistory: "",
    licenseNumber: "",
    specialization: "",
    shopName: "",
    shopAddress: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(form);
  };

  return (
    <>
      <h1 className="app-title">Online Prescription Tracker</h1>
      <h2 className="login-title">Register</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
          />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Choose username"
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create password"
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
          />
        </div>

        <div className="form-group">
          <label>Register as</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="PATIENT">Patient</option>
            <option value="DOCTOR">Doctor</option>
            <option value="PHARMACIST">Pharmacist</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Role-specific fields */}
        {form.role === "PATIENT" && (
          <div className="form-group">
            <label>Medical History</label>
            <textarea
              name="medicalHistory"
              value={form.medicalHistory}
              onChange={handleChange}
              placeholder="Eg: Diabetes, Hypertension..."
            />
          </div>
        )}

        {form.role === "DOCTOR" && (
          <>
            <div className="form-group">
              <label>License Number</label>
              <input
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleChange}
                placeholder="Enter license number"
              />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Eg: Cardiologist"
              />
            </div>
          </>
        )}

        {form.role === "PHARMACIST" && (
          <>
            <div className="form-group">
              <label>Shop Name</label>
              <input
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                placeholder="Enter pharmacy name"
              />
            </div>
            <div className="form-group">
              <label>Shop Address</label>
              <textarea
                name="shopAddress"
                value={form.shopAddress}
                onChange={handleChange}
                placeholder="Enter full shop address"
              />
            </div>
          </>
        )}

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </>
  );
}

export default RegisterForm;
