import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import CreateProject from './pages/CreateProject.jsx';
import EditProject from './pages/EditProject.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Explore from './pages/Explore.jsx';
import EditProfile from './pages/EditProfile.jsx';

// ── Error boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('App error:', error, info); }
  render() {
    if (this.state.error) return (
      <div style={{ minHeight:'100vh', background:'#050714', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#e2e8f0', padding:40, textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:20 }}>⚠️</div>
        <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1.2rem', color:'#a855f7', marginBottom:12 }}>Something went wrong</h2>
        <p style={{ color:'#94a3b8', marginBottom:24 }}>{this.state.error.message}</p>
        <button onClick={() => { this.setState({ error:null }); window.location.href='/'; }}
          style={{ background:'linear-gradient(135deg,#a855f7,#ec4899)', border:'none', padding:'12px 28px', borderRadius:8, color:'white', cursor:'pointer' }}>
          Reload App
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ── Protected route ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', color:'#a855f7', fontFamily:'Orbitron,sans-serif', background:'#050714', flexDirection:'column', gap:16 }}>
      <div style={{ width:40, height:40, border:'3px solid #a855f7', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading...
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

// ── Public only route (redirect logged-in users to dashboard) ─────────────────
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// ── Auth logout event listener (from api.js interceptor) ─────────────────────
function AuthLogoutListener() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const handler = () => { logout(); navigate('/login', { replace: true }); };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [logout, navigate]);
  return null;
}

// ── All routes ────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <>
      <AuthLogoutListener />
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"             element={<Home />} />
        <Route path="/projects"     element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/explore"      element={<Explore />} />

        {/* Auth pages — redirect to dashboard if already logged in */}
        <Route path="/login"    element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        {/* Protected */}
        <Route path="/create"              element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/projects/:id/edit"   element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
        <Route path="/dashboard"           element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/edit-profile"        element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}