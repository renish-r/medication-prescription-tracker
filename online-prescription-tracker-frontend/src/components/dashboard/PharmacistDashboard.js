// src/components/dashboard/PharmacistDashboard.js
import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import ProfileSection from "../profile/ProfileSection";
import { fetchProfileApi, updateProfileApi } from "../../api";

function PharmacistDashboard({ username, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("profile");

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
    { key: "profile", label: "My Profile" },
    { key: "stock", label: "Stock & Dispensing (Coming Soon)" },
  ];

  return (
    <DashboardLayout
      title="Pharmacist Dashboard"
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

      {activeMenu === "stock" && (
        <div className="section-card">
          <h2>Stock & Dispensing</h2>
          <p>
            Pharmacist stock management and prescription dispensing workflows
            will be implemented in the next milestone.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}

export default PharmacistDashboard;
