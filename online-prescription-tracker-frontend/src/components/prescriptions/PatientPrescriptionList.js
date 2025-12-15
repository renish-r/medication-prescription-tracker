// src/components/prescriptions/PatientPrescriptionList.js
import React, { useState } from "react";
import PrescriptionPdfButton from "./PrescriptionPdfButton";
import ReminderPanel from "./ReminderPanel";
import PrescriptionHistoryModal from "./PrescriptionHistoryModal";

function PatientPrescriptionList({ prescriptions, onRefresh }) {
  const [openReminderFor, setOpenReminderFor] = useState(null);
  const [historyOpenFor, setHistoryOpenFor] = useState(null);

  return (
    <div className="section-card">
      <h2>My Prescriptions</h2>
      <div style={{ marginBottom: 10 }}>
        <button className="link-button" onClick={onRefresh}>Refresh</button>
      </div>

      {prescriptions.length === 0 ? (
        <p>No prescriptions found.</p>
      ) : (
        <ul className="list">
          {prescriptions.map((p) => (
            <li key={p.id} className="list-item">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>{p.medicationName}</strong>
                  <div style={{ color: "#9ca3af" }}>{p.dosage} • {p.frequency} • {p.durationDays} days</div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13 }}>Doctor: {p.doctorUsername}</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>Status: {p.status}</div>
                </div>
              </div>

              {p.instructions && <p style={{ marginTop: 8 }}><em>Instructions: {p.instructions}</em></p>}

              <div className="button-row" style={{ marginTop: 8 }}>
                <PrescriptionPdfButton prescription={p} />

                <button className="link-button" onClick={() => setHistoryOpenFor(p.id)}>
                  History
                </button>

                {/* Inline Reminders toggle (inserted as you requested) */}
                {openReminderFor === p.id ? (
                  <div style={{ marginTop: 12, width: "100%" }}>
                    <ReminderPanel prescription={p} />
                    <div style={{ marginTop: 8 }}>
                      <button className="link-button" onClick={() => setOpenReminderFor(null)}>
                        Close reminders
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="link-button" onClick={() => setOpenReminderFor(p.id)}>
                    Show reminders
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* History modal */}
      {historyOpenFor && (
        <PrescriptionHistoryModal prescriptionId={historyOpenFor} onClose={() => setHistoryOpenFor(null)} />
      )}
    </div>
  );
}

export default PatientPrescriptionList;
