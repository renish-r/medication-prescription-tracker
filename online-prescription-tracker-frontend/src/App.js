// src/App.js
import React, { useEffect, useState } from "react";
import "./App.css";

import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";

import DoctorDashboard from "./components/dashboard/DoctorDashboard";
import PatientDashboard from "./components/dashboard/PatientDashboard";
import PharmacistDashboard from "./components/dashboard/PharmacistDashboard";
import AdminDashboard from "./components/dashboard/AdminDashboard";

import {
  loginApi,
  registerApi,
  setAuthData,
  clearAuthData,
  getToken,
  getRole,
  getUsername,
} from "./api";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);

  // Restore session from localStorage
  useEffect(() => {
    const token = getToken();
    const storedRole = getRole();
    const storedUsername = getUsername();
    if (token && storedRole && storedUsername) {
      setLoggedIn(true);
      setRole(storedRole);
      setUsername(storedUsername);
    }
  }, []);

  // ----- AUTH HANDLERS -----
  const handleLogin = async (form) => {
    setAuthError("");

    if (!form.usernameOrEmail || !form.password) {
      setAuthError("Please enter username/email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginApi(form); // { token, username, role }
      setAuthData({
        token: data.token,
        role: data.role,
        username: data.username,
      });
      setLoggedIn(true);
      setRole(data.role);
      setUsername(data.username);
      alert(`Login successful as ${data.role}`);
    } catch (err) {
      console.error(err);
      setAuthError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (form) => {
    setAuthError("");

    if (
      !form.fullName ||
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setAuthError("Please fill in all required fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setAuthError("Password and Confirm Password do not match.");
      return;
    }

    const payload = {
      fullName: form.fullName,
      username: form.username,
      email: form.email,
      password: form.password,
      role: form.role,
      medicalHistory: form.medicalHistory,
      licenseNumber: form.licenseNumber,
      specialization: form.specialization,
      shopName: form.shopName,
      shopAddress: form.shopAddress,
    };

    setLoading(true);
    try {
      await registerApi(payload);
      alert("Registration successful! You can now login.");
      setIsLogin(true);
      setAuthError("");
    } catch (err) {
      console.error(err);
      setAuthError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    setLoggedIn(false);
    setRole(null);
    setUsername(null);
    setIsLogin(true);
    setAuthError("");
  };

  // ----- RENDER -----
  if (!loggedIn) {
    // AUTH LAYOUT (centered card)
    return (
      <div className="auth-root">
        <div className="auth-card">
          {isLogin ? (
            <>
              <LoginForm
                onLogin={handleLogin}
                error={authError}
                loading={loading}
              />
              <div className="extra-links">
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setIsLogin(false);
                    setAuthError("");
                  }}
                >
                  New user? Register
                </button>
                <button
                  type="button"
                  className="link-button"
                  onClick={() =>
                    alert("Forgot password flow will be added later.")
                  }
                >
                  Forgot Password?
                </button>
              </div>
            </>
          ) : (
            <>
              <RegisterForm
                onRegister={handleRegister}
                error={authError}
                loading={loading}
              />
              <div className="extra-links">
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setIsLogin(true);
                    setAuthError("");
                  }}
                >
                  Already have an account? Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // DASHBOARD LAYOUT (full screen, sidebar + content)
  return (
    <div className="dashboard-root">
      {role === "DOCTOR" ? (
        <DoctorDashboard username={username} onLogout={handleLogout} />
      ) : role === "PATIENT" ? (
        <PatientDashboard username={username} onLogout={handleLogout} />
      ) : role === "PHARMACIST" ? (
        <PharmacistDashboard username={username} onLogout={handleLogout} />
      ) : (
        <AdminDashboard username={username} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
