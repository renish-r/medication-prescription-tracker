import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import InventoryPage from './pages/pharmacist/Inventory';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';

const tiles = [
  { role: 'PATIENT', to: '/patient', title: 'Patient workspace', description: 'Track active prescriptions and refills.', icon: '💊' },
  { role: 'DOCTOR', to: '/doctor', title: 'Doctor workspace', description: 'Create, renew, and review prescriptions.', icon: '🩺' },
  { role: 'PHARMACIST', to: '/pharmacist', title: 'Pharmacist inventory', description: 'Manage stock, expiry, and dispensing.', icon: '📦' },
  { role: 'ADMIN', to: '/admin', title: 'Admin overview', description: 'Monitor usage and recent activity.', icon: '📊' },
];

function Topbar() {
  const { isAuthed, user, logout } = useAuth();
  const role = user?.role?.toUpperCase();
  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');
  const roleLinks = [
    { role: 'PATIENT', to: '/patient', label: 'Patient' },
    { role: 'DOCTOR', to: '/doctor', label: 'Doctor' },
    { role: 'PHARMACIST', to: '/pharmacist', label: 'Pharmacist' },
    { role: 'ADMIN', to: '/admin', label: 'Admin' },
  ].filter((r) => r.role === role);

  return (
    <header className="topbar">
      <Link to="/" className="logo">MediManager</Link>
      <div className="nav-right">
        {isAuthed ? (
          <>
            {roleLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
            <div className="chip">{role || 'User'}</div>
            <span className="muted small">{user?.email}</span>
            <button className="ghost" onClick={logout}>Logout</button>
          </>
        ) : (
          <div className="nav-actions">
            <NavLink to="/login" className={linkClass}>Login</NavLink>
            <NavLink to="/signup" className="nav-link filled">Sign up</NavLink>
          </div>
        )}
      </div>
    </header>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();
  const available = tiles.filter((t) => t.role === role);

  return (
    <div className="stack">
      <div className="card hero-card">
        <h1>Welcome back</h1>
        <p className="muted">Choose your workspace to continue.</p>
      </div>
      <div className="grid cards">
        {available.map((tile) => (
          <Link key={tile.to} to={tile.to} className="tile">
            <div className="tile-icon">{tile.icon}</div>
            <div className="title">{tile.title}</div>
            <p className="muted">{tile.description}</p>
          </Link>
        ))}
        {available.length === 0 && (
          <div className="card">
            <div className="title">No workspace for this role yet.</div>
            <p className="muted">Contact an admin to assign a role.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const { isAuthed } = useAuth();

  return (
    <div className="app">
      <Topbar />
      <main className="content">
        <Routes>
          <Route path="/login" element={isAuthed ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/signup" element={isAuthed ? <Navigate to="/" replace /> : <SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
          </Route>

          <Route element={<ProtectedRoute roles={['PATIENT']} />}>
            <Route path="/patient" element={<PatientPrescriptions />} />
          </Route>

          <Route element={<ProtectedRoute roles={['DOCTOR']} />}>
            <Route path="/doctor" element={<DoctorPrescriptions />} />
          </Route>

          <Route element={<ProtectedRoute roles={['PHARMACIST']} />}>
            <Route path="/pharmacist" element={<InventoryPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          <Route path="*" element={<Navigate to={isAuthed ? '/' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
