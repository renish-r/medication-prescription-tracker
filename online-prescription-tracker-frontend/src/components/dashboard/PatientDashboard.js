// src/components/dashboard/PatientDashboard.js
import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import ProfileSection from "../profile/ProfileSection";
import PatientPrescriptionList from "../prescriptions/PatientPrescriptionList";

import {
  fetchProfileApi,
  updateProfileApi,
  fetchPatientPrescriptionsApi,
} from "../../api";

function PatientDashboard({ username, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("profile");

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    loadProfile();
    loadPrescriptions();
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

  const loadPrescriptions = async () => {
    try {
      const data = await fetchPatientPrescriptionsApi();
      setPrescriptions(data);
    } catch (err) {
      console.error(err);
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
    { key: "profile", label: "My Profile" },
    { key: "prescriptions", label: "Issued Prescriptions" },
  ];

  return (
    <DashboardLayout
      title="Patient Dashboard"
      username={username}
      menuItems={menuItems}
      activeKey={activeMenu}
      onMenuChange={setActiveMenu}
      onLogout={onLogout}
    >
      {activeMenu === "profile" && (
        <ProfileSection
          profile={profile}
          loading={profileLoading}
          onChange={handleProfileChange}
          onSave={handleSaveProfile}
        />
      )}

      {activeMenu === "prescriptions" && (
        <PatientPrescriptionList
          prescriptions={prescriptions}
          onRefresh={loadPrescriptions}
        />
      )}
    </DashboardLayout>
  );
}

export default PatientDashboard;
