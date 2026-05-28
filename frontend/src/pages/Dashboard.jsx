import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects,  setProjects]  = useState([]);
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('owned');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/profile');
      const userData = res.data.user;
      setProfile(userData);
      // Combine owned + joined projects
      const owned  = userData.projectsOwned  || [];
      const joined = userData.projectsJoined || [];
      setProjects({ owned, joined });
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: 'var(--primary)', fontFamily: 'Orbitron' }}>
      Loading dashboard...
    </div>
  );

  const ownedProjects  = projects.owned  || [];
  const joinedProjects = projects.joined || [];
  const displayName    = profile?.username || user?.username || 'Creator';
  const fieldLabel     = profile?.field?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Creator';

  return (
    <div style={{ display: 'flex', gap: 32, padding: '32px', maxWidth: 1200, margin: '0 auto', flexWrap: 'wrap' }}>

      {/* ── Left sidebar ── */}
      <div style={{ width: 260, flexShrink: 0 }}>

        {/* Profile card */}
        <div className="glass" style={{ padding: 28, marginBottom: 20, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Orbitron', fontWeight: 700, fontSize: '1.8rem',
            margin: '0 auto 12px',
          }}>
            {displayName[0]?.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
            {displayName}
          </div>
          <div style={{ color: 'var(--primary)', fontSize: '0.8rem', marginBottom: 16 }}>
            {fieldLabel}
          </div>
          {profile?.bio && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: 16 }}>
              {profile.bio}
            </p>
          )}
          {profile?.skills?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
              {profile.skills.slice(0, 5).map(s => (
                <span key={s} style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem' }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 16 }}>
            STATS
          </div>
          {[
            { label: 'Projects Owned', value: ownedProjects.length },
            { label: 'Total Collabs',  value: joinedProjects.length },
            { label: 'Reviews',        value: profile?.reviews?.length || 0 },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{stat.label}</span>
              <span style={{ fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--primary)' }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <button className="btn-primary" onClick={() => navigate('/create')}
          style={{ width: '100%', padding: 14, marginBottom: 10 }}>
          + New Project
        </button>
        <button className="btn-outline" onClick={() => navigate('/profile/edit')}
          style={{ width: '100%', padding: 14, marginBottom: 10 }}>
          Edit Profile
        </button>
        <button onClick={handleLogout}
          style={{ width: '100%', padding: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: '0.9rem' }}>
          Logout
        </button>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {[
            { key: 'owned',  label: `My Projects (${ownedProjects.length})` },
            { key: 'joined', label: `Collaborating (${joinedProjects.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: 'Orbitron', fontSize: '0.72rem', letterSpacing: 0.5,
                background: activeTab === tab.key ? 'var(--gradient)' : 'transparent',
                color: activeTab === tab.key ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Project list */}
        {(activeTab === 'owned' ? ownedProjects : joinedProjects).length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚀</div>
            <h3 style={{ fontFamily: 'Orbitron', color: 'var(--text-muted)', marginBottom: 16 }}>
              No projects yet
            </h3>
            {activeTab === 'owned' && (
              <button className="btn-primary" onClick={() => navigate('/create')}>
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {(activeTab === 'owned' ? ownedProjects : joinedProjects).map(p => (
              <div key={p._id} className="glass"
                style={{ padding: 24, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--primary)', padding: '2px 10px', borderRadius: 12, fontSize: '0.72rem', fontFamily: 'Orbitron' }}>
                      {p.category}
                    </span>
                    <span style={{ background: p.status === 'open' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: p.status === 'open' ? '#10b981' : '#f59e0b', padding: '2px 10px', borderRadius: 12, fontSize: '0.72rem' }}>
                      {p.status}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: 4, fontFamily: 'Orbitron', fontSize: '0.95rem' }}>
                    {p.title}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {p.collaborators?.length || 0} collaborators · {p.likes?.length || 0} likes
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-outline"
                    onClick={() => navigate(`/projects/${p._id}`)}
                    style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    View
                  </button>
                  {activeTab === 'owned' && (
                    <button
                      onClick={() => handleDeleteProject(p._id)}
                      style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', cursor: 'pointer' }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}