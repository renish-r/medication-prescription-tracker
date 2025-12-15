// src/components/prescriptions/DoctorPrescriptionList.js
import React, { useState } from "react";
import PrescriptionHistoryModal from "./PrescriptionHistoryModal";

function DoctorPrescriptionList({ prescriptions, onRefresh, onAction }) {
  const [historyOpenFor, setHistoryOpenFor] = useState(null);

  const handleCloseHistory = () => {
    setHistoryOpenFor(null);
  };

  return (
    <div className="section-card">
      <h2>My Prescriptions</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <button className="link-button" type="button" onClick={onRefresh}>
          Refresh
        </button>
        <div style={{ color: "#9ca3af", fontSize: 13 }}>
          {prescriptions.length === 0 ? "No prescriptions created yet." : `${prescriptions.length} prescription(s)`}
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <p>No prescriptions created yet.</p>
      ) : (
        <ul className="list">
          {prescriptions.map((p) => (
            <li key={p.id} className="list-item">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <strong style={{ fontSize: 15 }}>{p.medicationName}</strong>
                  <div style={{ color: "#9ca3af", marginTop: 6 }}>
                    {p.dosage}, {p.frequency} — {p.durationDays ? `${p.durationDays} days` : "Duration N/A"}
                  </div>
                </div>

                <div style={{ textAlign: "right", minWidth: 160 }}>
                  <div style={{ fontSize: 13, color: "#9ca3af" }}>
                    Patient: <span style={{ color: "#e5e7eb" }}>{p.patientUsername}</span>
                  </div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    Status: <strong>{p.status}</strong>
                  </div>
                </div>
              </div>

              {p.instructions && (
                <p style={{ marginTop: 10 }}>
                  <em>Instructions: {p.instructions}</em>
                </p>
              )}

              <div className="button-row" style={{ marginTop: 10 }}>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => onAction(p.id, "approve")}
                >
                  Approve
                </button>

                <button
                  type="button"
                  className="link-button"
                  onClick={() => onAction(p.id, "reject")}
                >
                  Reject
                </button>

                <button
                  type="button"
                  className="link-button"
                  onClick={() => onAction(p.id, "renew")}
                >
                  Renew
                </button>

                <button
                  type="button"
                  className="link-button"
                  onClick={() => setHistoryOpenFor(p.id)}
                >
                  History
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {historyOpenFor && (
        <PrescriptionHistoryModal
          prescriptionId={historyOpenFor}
          onClose={handleCloseHistory}
        />
      )}
    </div>
  );
}

export default DoctorPrescriptionList;
