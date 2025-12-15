import React, { useEffect, useState } from "react";
import { fetchPrescriptionHistory, fetchPrescriptionVersion } from "../../api";
import PrescriptionPdfButton from "./PrescriptionPdfButton";

function PrescriptionHistoryModal({ prescriptionId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!prescriptionId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchPrescriptionHistory(prescriptionId);
        setHistory(data);
        if (data.length) setSelected(data[0]);
      } catch (err) {
        console.error(err);
        alert("Failed to load history: " + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [prescriptionId]);

  const viewVersion = async (historyId) => {
    try {
      const v = await fetchPrescriptionVersion(historyId);
      setSelected(v);
    } catch (err) {
      console.error(err);
      alert("Failed to load version");
    }
  };

  if (!prescriptionId) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Prescription History</h3>
          <button onClick={onClose}>Close</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="modal-body">
            <aside className="history-list">
              {history.length === 0 ? (
                <p>No history available.</p>
              ) : (
                history.map((h) => (
                  <div
                    key={h.id}
                    className={"history-item" + (selected && selected.id === h.id ? " active" : "")}
                    onClick={() => viewVersion(h.id)}
                  >
                    <div><strong>v{h.versionNumber}</strong></div>
                    <div style={{ fontSize: 12 }}>{new Date(h.modifiedAt).toLocaleString()}</div>
                    <div style={{ fontSize: 12 }}>By: {h.modifiedBy}</div>
                  </div>
                ))
              )}
            </aside>

            <section className="history-detail">
              {selected ? (
                <>
                  <h4>Version v{selected.versionNumber} — {new Date(selected.modifiedAt).toLocaleString()}</h4>
                  <p><strong>Medication:</strong> {selected.medicationName}</p>
                  <p><strong>Dosage:</strong> {selected.dosage}</p>
                  <p><strong>Frequency:</strong> {selected.frequency}</p>
                  <p><strong>Duration (days):</strong> {selected.durationDays}</p>
                  {selected.instructions && <p><strong>Instructions:</strong> {selected.instructions}</p>}
                  <p><strong>Reason:</strong> {selected.changeReason || "-"}</p>
                  <p><strong>Status:</strong> {selected.status}</p>

                  <div style={{ marginTop: 10 }}>
                    <PrescriptionPdfButton prescription={selected} />
                  </div>
                </>
              ) : (
                <p>Select a version to view details</p>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Minimal modal styles (you can move to CSS) */}
      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; display:flex; align-items:center; justify-content:center;
          background: rgba(0,0,0,0.5); z-index: 9999;
        }
        .modal { background: #0b1220; padding: 16px; border-radius: 10px; width: 90%; max-width: 900px; color: #e5e7eb; }
        .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
        .modal-body { display:flex; gap:16px; }
        .history-list { width: 220px; max-height:480px; overflow:auto; border-right:1px solid #233; padding-right:8px; }
        .history-item { padding:8px; border-radius:8px; cursor:pointer; margin-bottom:8px; background:#020617; }
        .history-item.active { background: linear-gradient(90deg,#2563eb,#22c55e); color:white; }
        .history-detail { flex:1; padding:8px; }
      `}</style>
    </div>
  );
}

export default PrescriptionHistoryModal;
