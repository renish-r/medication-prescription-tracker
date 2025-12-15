// src/components/dashboard/DoctorDashboard.js
import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import ProfileSection from "../profile/ProfileSection";
import DoctorPrescriptionForm from "../prescriptions/DoctorPrescriptionForm";
import DoctorPrescriptionList from "../prescriptions/DoctorPrescriptionList";

import {
  fetchProfileApi,
  updateProfileApi,
  fetchDoctorPatientsApi,
  fetchDoctorPrescriptionsApi,
  createPrescriptionApi,
  updatePrescriptionStatusApi,
} from "../../api";

function DoctorDashboard({ username, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [patients, setPatients] = useState([]);
  const [doctorPrescriptions, setDoctorPrescriptions] = useState([]);

  const [newPrescription, setNewPrescription] = useState({
    patientUsername: "",
    medicationName: "",
    dosage: "",
    frequency: "",
    durationDays: "",
    instructions: "",
  });

  // Load initial data
  useEffect(() => {
    loadProfile();
    loadPatients();
    loadDoctorPrescriptions();
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

  const loadPatients = async () => {
    try {
      const data = await fetchDoctorPatientsApi();
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDoctorPrescriptions = async () => {
    try {
      const data = await fetchDoctorPrescriptionsApi();
      setDoctorPrescriptions(data);
    } catch (err) {
      console.error(err);
    }
  };

  // PROFILE HANDLERS
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

  // PRESCRIPTION HANDLERS
  const handlePrescriptionFormChange = (name, value) => {
    setNewPrescription((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();

    if (
      !newPrescription.patientUsername ||
      !newPrescription.medicationName ||
      !newPrescription.dosage ||
      !newPrescription.frequency
    ) {
      alert("Please fill patient, medication, dosage and frequency.");
      return;
    }

    try {
      const payload = {
        patientUsername: newPrescription.patientUsername,
        medicationName: newPrescription.medicationName,
        dosage: newPrescription.dosage,
        frequency: newPrescription.frequency,
        durationDays: newPrescription.durationDays
          ? parseInt(newPrescription.durationDays, 10)
          : null,
        instructions: newPrescription.instructions,
      };

      await createPrescriptionApi(payload);
      alert("Prescription created (PENDING).");
      setNewPrescription({
        patientUsername: "",
        medicationName: "",
        dosage: "",
        frequency: "",
        durationDays: "",
        instructions: "",
      });
      loadDoctorPrescriptions();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create prescription");
    }
  };

  const handlePrescriptionAction = async (id, action) => {
    try {
      await updatePrescriptionStatusApi(id, action);
      alert(`Prescription ${action} successful.`);
      loadDoctorPrescriptions();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update prescription");
    }
  };

  const menuItems = [
    { key: "profile", label: "My Profile" },
    { key: "issue", label: "Issue Prescription" },
    { key: "list", label: "My Prescriptions" },
  ];

  return (
    <DashboardLayout
      title="Doctor Dashboard"
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

      {activeMenu === "issue" && (
        <DoctorPrescriptionForm
          patients={patients}
          form={newPrescription}
          onChange={handlePrescriptionFormChange}
          onSubmit={handleCreatePrescription}
        />
      )}

      {activeMenu === "list" && (
        <DoctorPrescriptionList
          prescriptions={doctorPrescriptions}
          onRefresh={loadDoctorPrescriptions}
          onAction={handlePrescriptionAction}
        />
      )}
    </DashboardLayout>
  );
}

export default DoctorDashboard;
