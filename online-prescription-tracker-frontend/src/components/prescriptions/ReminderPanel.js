import React, { useEffect, useState } from "react";
import {
  createReminderApi,
  listRemindersForPrescription,
  deleteReminderApi,
  sendReminderNowApi,
} from "../../api";

function ReminderPanel({ prescription }) {
  const [reminders, setReminders] = useState([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [recurrence, setRecurrence] = useState(0);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!prescription) return;
    load();
    // eslint-disable-next-line
  }, [prescription]);

  const load = async () => {
    try {
      const data = await listRemindersForPrescription(prescription.id);
      setReminders(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load reminders");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!scheduledAt || !email) {
      alert("Set date/time and email");
      return;
    }
    setLoading(true);
    try {
      // scheduledAt: local datetime string "2025-12-12T14:30"
      const payload = {
        prescriptionId: prescription.id,
        patientUsername: prescription.patientUsername,
        patientEmail: email,
        scheduledAt: scheduledAt,
        recurrenceMinutes: Number(recurrence) || 0,
        active: true,
      };
      await createReminderApi(payload);
      alert("Reminder created");
      setScheduledAt("");
      setRecurrence(0);
      load();
    } catch (err) {
      console.error(err);
      alert("Create failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete reminder?")) return;
    try {
      await deleteReminderApi(id);
      alert("Deleted");
      load();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleSendNow = async (id) => {
    try {
      await sendReminderNowApi(id);
      alert("Triggered send");
    } catch (err) {
      console.error(err);
      alert("Send failed");
    }
  };

  return (
    <div className="section-card">
      <h3>Reminders</h3>

      <form onSubmit={handleCreate} style={{ display: "grid", gap: 8 }}>
        <label>
          Email to notify:
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>

        <label>
          Date & time:
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </label>

        <label>
          Recurrence (minutes, 0 = one-time):
          <input type="number" value={recurrence} onChange={(e) => setRecurrence(e.target.value)} />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="login-button" type="submit" disabled={loading}>{loading ? "Saving..." : "Save Reminder"}</button>
        </div>
      </form>

      <hr />

      <div>
        <h4>Existing reminders</h4>
        {reminders.length === 0 ? <p>No reminders</p> : (
          <ul className="list">
            {reminders.map(r => (
              <li key={r.id} className="list-item">
                <div>Send at: {r.scheduledAt}</div>
                <div>Email: {r.patientEmail}</div>
                <div>Recurrence: {r.recurrenceMinutes || 0} mins</div>
                <div>Active: {r.active ? "Yes" : "No"}</div>
                <div className="button-row">
                  <button className="link-button" onClick={() => handleSendNow(r.id)}>Send Now</button>
                  <button className="link-button" onClick={() => handleDelete(r.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ReminderPanel;
