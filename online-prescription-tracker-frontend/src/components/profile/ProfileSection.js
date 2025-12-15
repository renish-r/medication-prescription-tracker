// src/components/profile/ProfileSection.js
import React from "react";

function ProfileSection({ profile, onChange, onSave, loading }) {
  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>No profile loaded.</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <div className="section-card">
      <h2>My Profile</h2>
      <div className="form-group">
        <label>Full Name</label>
        <input
          name="fullName"
          value={profile.fullName || ""}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Username (read-only)</label>
        <input value={profile.username || ""} disabled />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          name="email"
          value={profile.email || ""}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Role</label>
        <input value={profile.role || ""} disabled />
      </div>

      {profile.role === "PATIENT" && (
        <div className="form-group">
          <label>Medical History</label>
          <textarea
            name="medicalHistory"
            value={profile.medicalHistory || ""}
            onChange={handleChange}
          />
        </div>
      )}

      {profile.role === "DOCTOR" && (
        <>
          <div className="form-group">
            <label>License Number</label>
            <input
              name="licenseNumber"
              value={profile.licenseNumber || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Specialization</label>
            <input
              name="specialization"
              value={profile.specialization || ""}
              onChange={handleChange}
            />
          </div>
        </>
      )}

      {profile.role === "PHARMACIST" && (
        <>
          <div className="form-group">
            <label>Shop Name</label>
            <input
              name="shopName"
              value={profile.shopName || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Shop Address</label>
            <textarea
              name="shopAddress"
              value={profile.shopAddress || ""}
              onChange={handleChange}
            />
          </div>
        </>
      )}

      <button className="login-button" type="button" onClick={onSave}>
        Save Profile
      </button>
    </div>
  );
}

export default ProfileSection;
