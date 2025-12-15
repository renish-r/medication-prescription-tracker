import React, { useEffect, useState } from "react";
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../../api";

const ROLE_OPTIONS = [
  { value: "PATIENT", label: "Patient" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "PHARMACIST", label: "Pharmacist" },
  { value: "ADMIN", label: "Admin" },
];

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // user object or null
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({
      fullName: "",
      username: "",
      email: "",
      password: "",
      role: "PATIENT",
    });
  };

  const openEdit = (u) => {
    setEditing(u);
    setCreating(false);
    setForm({
      fullName: u.fullName || "",
      username: u.username || "",
      email: u.email || "",
      password: "", // blank unless changing
      role: u.role || "PATIENT",
      medicalHistory: u.medicalHistory || "",
      licenseNumber: u.licenseNumber || "",
      specialization: u.specialization || "",
      shopName: u.shopName || "",
      shopAddress: u.shopAddress || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAdminUser(form);
      alert("User created");
      setCreating(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Create failed: " + err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateAdminUser(editing.id, form);
      alert("User updated");
      setEditing(null);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Update failed: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete user? This cannot be undone.")) return;
    try {
      await deleteAdminUser(id);
      alert("Deleted");
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="section-card">
      <h2>Manage Users</h2>
      <div style={{ marginBottom: 12 }}>
        <button className="link-button" onClick={openCreate}>
          + Create user
        </button>
        <button className="link-button" onClick={loadUsers} style={{ marginLeft: 8 }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#9ca3af" }}>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="list-item">
                <td>{u.fullName}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button className="link-button" onClick={() => openEdit(u)}>Edit</button>
                  <button className="link-button" onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create / Edit form modal-like */}
      {(creating || editing) && (
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>{creating ? "Create new user" : `Edit ${editing.username}`}</strong>
          </div>

          <form onSubmit={creating ? handleCreate : handleUpdate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input name="fullName" placeholder="Full name" value={form.fullName || ""} onChange={handleChange} />
              <input name="username" placeholder="Username" value={form.username || ""} onChange={handleChange} />
              <input name="email" placeholder="Email" type="email" value={form.email || ""} onChange={handleChange} />
              <select name="role" value={form.role || "PATIENT"} onChange={handleChange}>
                {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>

              <input name="password" placeholder={creating ? "Password" : "New password (leave blank to keep)"} type="password" value={form.password || ""} onChange={handleChange} />

              {/* optional role-specific fields */}
              <input name="medicalHistory" placeholder="Medical history (patients)" value={form.medicalHistory || ""} onChange={handleChange} />
              <input name="licenseNumber" placeholder="License no (doctors)" value={form.licenseNumber || ""} onChange={handleChange} />
              <input name="specialization" placeholder="Specialization (doctors)" value={form.specialization || ""} onChange={handleChange} />
              <input name="shopName" placeholder="Shop name (pharmacists)" value={form.shopName || ""} onChange={handleChange} />
              <input name="shopAddress" placeholder="Shop address (pharmacists)" value={form.shopAddress || ""} onChange={handleChange} />
            </div>

            <div style={{ marginTop: 10 }}>
              <button className="login-button" type="submit">{creating ? "Create" : "Save"}</button>
              <button className="link-button" type="button" onClick={() => { setCreating(false); setEditing(null); }} style={{ marginLeft: 8 }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
