// src/api.js
const API_BASE = "http://localhost:8080";

export const getToken = () => localStorage.getItem("token");
export const getRole = () => localStorage.getItem("role");
export const getUsername = () => localStorage.getItem("username");

export const setAuthData = ({ token, role, username }) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("username", username);
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

// -------- AUTH --------
export async function loginApi(loginData) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  });

  if (!res.ok) {
    throw new Error((await res.text()) || "Login failed");
  }

  return res.json(); // { token, username, role }
}

export async function registerApi(payload) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error((await res.text()) || "Registration failed");
  }

  return res.text();
}

// -------- PROFILE --------
export async function fetchProfileApi() {
  const res = await fetch(`${API_BASE}/api/profile/me`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }

  return res.json();
}

export async function updateProfileApi(profile) {
  const payload = {
    fullName: profile.fullName,
    email: profile.email,
    medicalHistory: profile.medicalHistory,
    licenseNumber: profile.licenseNumber,
    specialization: profile.specialization,
    shopName: profile.shopName,
    shopAddress: profile.shopAddress,
  };

  const res = await fetch(`${API_BASE}/api/profile/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to update profile");
  }

  return res.json();
}

// -------- PRESCRIPTIONS --------
export async function fetchPatientPrescriptionsApi() {
  const res = await fetch(`${API_BASE}/api/patient/prescriptions`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch patient prescriptions");
  return res.json();
}

export async function fetchDoctorPrescriptionsApi() {
  const res = await fetch(`${API_BASE}/api/doctor/prescriptions`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch doctor prescriptions");
  return res.json();
}

export async function createPrescriptionApi(payload) {
  const res = await fetch(`${API_BASE}/api/doctor/prescriptions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.text()) || "Failed to create prescription");
  return res.json();
}

export async function updatePrescriptionStatusApi(id, action) {
  let endpoint = "";
  let method = "PUT";
  if (action === "approve") {
    endpoint = `${API_BASE}/api/doctor/prescriptions/${id}/approve`;
  } else if (action === "reject") {
    endpoint = `${API_BASE}/api/doctor/prescriptions/${id}/reject`;
  } else if (action === "renew") {
    endpoint = `${API_BASE}/api/doctor/prescriptions/${id}/renew`;
    method = "POST";
  }

  const res = await fetch(endpoint, { method, headers: authHeaders() });
  if (!res.ok) throw new Error((await res.text()) || "Failed to update prescription");
  return res.json();
}

// -------- DOCTOR PATIENT LIST --------
export async function fetchDoctorPatientsApi() {
  const res = await fetch(`${API_BASE}/api/doctor/patients`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json(); // [{ username, fullName, email }]
}
// -------- HISTORY / VERSIONING --------
export async function fetchPrescriptionHistory(prescriptionId) {
  const res = await fetch(`${API_BASE}/api/prescriptions/${prescriptionId}/history`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to fetch history (${res.status}): ${txt}`);
  }
  return res.json();
}

export async function fetchPrescriptionVersion(historyId) {
  const res = await fetch(`${API_BASE}/api/prescriptions/history/${historyId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch version");
  }
  return res.json();
}

export async function renewPrescriptionApi(prescriptionId, reason, durationDays) {
  const url = new URL(`${API_BASE}/api/prescriptions/${prescriptionId}/renew`);
  if (reason) url.searchParams.append("reason", reason);
  if (durationDays) url.searchParams.append("durationDays", durationDays);
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Renew failed (${res.status}): ${t}`);
  }
  return res.json();
}

export async function revertPrescriptionApi(prescriptionId, historyId, reason) {
  const url = new URL(`${API_BASE}/api/prescriptions/${prescriptionId}/revert`);
  url.searchParams.append("historyId", historyId);
  if (reason) url.searchParams.append("reason", reason);
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Revert failed");
  }
  return res.json();
}
// Admin - Manage Users
export async function fetchAdminUsers() {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed fetching users");
  return res.json();
}

export async function fetchAdminUser(id) {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed fetching user");
  return res.json();
}

export async function createAdminUser(payload) {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Create user failed");
  }
  return res.json();
}

export async function updateAdminUser(id, payload) {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Update user failed");
  }
  return res.json();
}

export async function deleteAdminUser(id) {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Delete failed");
  return true;
}
// ---------------- Reminders (Patient) ----------------
export async function createReminderApi(payload) {
  const res = await fetch(`${API_BASE}/api/reminders/create`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Create reminder failed (${res.status})`);
  }
  return res.json();
}

export async function listRemindersForPrescription(prescriptionId) {
  const res = await fetch(`${API_BASE}/api/reminders/prescription/${prescriptionId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch reminders (${res.status})`);
  }
  return res.json();
}

export async function deleteReminderApi(id) {
  const res = await fetch(`${API_BASE}/api/reminders/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Delete reminder failed (${res.status})`);
  }
  return true;
}

export async function sendReminderNowApi(id) {
  const res = await fetch(`${API_BASE}/api/reminders/${id}/sendNow`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Send now failed (${res.status})`);
  }
  return res.json();
}
