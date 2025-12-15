// src/components/dashboard/AdminDashboard.js
import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import ProfileSection from "../profile/ProfileSection";
import ManageUsers from "../admin/ManageUsers";
import { fetchProfileApi, updateProfileApi } from "../../api";

function AdminDashboard({ username, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("manageUsers");

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      const data = await fetchProfileApi();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileChange = (name, value) => {
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      const updated = await updateProfileApi(profile);
      setProfile(updated);
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update profile");
    }
  };

  const menuItems = [
    { key: "manageUsers", label: "Manage Users" },
    { key: "profile", label: "My Profile" },
    { key: "audit", label: "Audit Logs (Coming Soon)" },
    // add more admin panels here
  ];

  return (
    <DashboardLayout
      title="Admin Dashboard"
      username={username}
      menuItems={menuItems}
      activeKey={activeMenu}
      onMenuChange={setActiveMenu}
      onLogout={onLogout}
    >
      {activeMenu === "manageUsers" && <ManageUsers />}

      {activeMenu === "profile" && (
        <ProfileSection
          profile={profile}
          loading={profileLoading}
          onChange={handleProfileChange}
          onSave={handleSaveProfile}
        />
      )}

      {activeMenu === "audit" && (
        <div className="section-card">
          <h2>Audit Logs</h2>
          <p>Audit log viewer will be implemented here (filter by date/user/action).</p>
        </div>
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;

export async function createReminderApi(payload) {
  const res = await fetch(`${API_BASE}/api/reminders/create`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create reminder: " + (await res.text()));
  return res.json();
}

export async function listRemindersForPrescription(prescriptionId) {
  const res = await fetch(`${API_BASE}/api/reminders/prescription/${prescriptionId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch reminders");
  return res.json();
}

export async function deleteReminderApi(id) {
  const res = await fetch(`${API_BASE}/api/reminders/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Delete failed");
  return true;
}

export async function sendReminderNowApi(id) {
  const res = await fetch(`${API_BASE}/api/reminders/${id}/sendNow`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Send now failed");
  return res.json();
}
