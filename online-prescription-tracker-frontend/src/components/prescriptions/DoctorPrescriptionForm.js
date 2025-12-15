// src/components/prescriptions/DoctorPrescriptionForm.js
import React from "react";

function DoctorPrescriptionForm({
  patients,
  form,
  onChange,
  onSubmit,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="section-card">
      <h2>Issue Prescription</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
  <label>Patient</label>
  {patients.length === 0 ? (
    <p style={{ fontSize: "0.9rem" }}>
      No patients found. Please register at least one user with role{" "}
      <strong>PATIENT</strong>.
    </p>
  ) : (
    <select
      name="patientUsername"
      value={form.patientUsername}
      onChange={handleChange}
    >
      <option value="">Select patient</option>
      {patients.map((p) => (
        <option key={p.username} value={p.username}>
          {p.fullName} ({p.username})
        </option>
      ))}
    </select>
  )}
</div>

        <div className="form-group">
          <label>Medication Name</label>
          <input
            name="medicationName"
            value={form.medicationName}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Dosage</label>
          <input
            name="dosage"
            value={form.dosage}
            onChange={handleChange}
            placeholder="e.g., 500 mg"
          />
        </div>
        <div className="form-group">
          <label>Frequency</label>
          <input
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            placeholder="e.g., Twice a day"
          />
        </div>
        <div className="form-group">
          <label>Duration (days)</label>
          <input
            name="durationDays"
            type="number"
            value={form.durationDays}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Instructions</label>
          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
          />
        </div>

        <button className="login-button" type="submit">
          Issue Prescription
        </button>
      </form>
    </div>
  );
}

export default DoctorPrescriptionForm;
