import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [ownedProjects,  setOwnedProjects]  = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [profile,        setProfile]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState('owned');
  const [debugInfo,      setDebugInfo]      = useState('');

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      // Get current user id from auth context first
      const meRes = await api.get('/auth/me');
      const currentUser = meRes.data.user;
      const userId = String(currentUser._id);

      setProfile(currentUser);
      setDebugInfo(`UserID: ${userId}`);

      // Fetch ALL projects
      const projectsRes = await api.get('/projects', { params: { limit: 100 } });
      const allProjects = projectsRes.data.projects || [];

      setDebugInfo(`UserID: ${userId} | Total projects: ${allProjects.length}`);

      // Filter owned — compare all possible ID formats
      const owned = allProjects.filter(p => {
        const ownerId = String(p.owner?._id || p.owner || '');
        return ownerId === userId;
      });

      // Filter joined — collaborators array
      const joined = allProjects.filter(p => {
        if (!Array.isArray(p.collaborators)) return false;
        return p.collaborators.some(c => {
          const cId = String(c?._id || c || '');
          return cId === userId;
        });
      });

      setOwnedProjects(owned);
      setJoinedProjects(joined);

    } catch (err) {
      console.error('Dashboard fetch failed:', err);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchDashboard();
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div style={{ textAlign:'center', paddingTop:120, color:'var(--primary)', fontFamily:'Orbitron' }}>
      Loading dashboard...
    </div>
  );

  const displayName = profile?.username || user?.username || 'Creator';
  const rawField    = profile?.field || user?.field || '';
  const fieldLabel  = rawField
    ? rawField.replace('-',' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Creator';

  const ownedCount  = ownedProjects.length;
  const joinedCount = joinedProjects.length;
  const totalCount  = ownedCount + joinedCount;

  return (
    <div style={{ paddingTop:90, paddingBottom:40, paddingLeft:32, paddingRight:32, maxWidth:1200, margin:'0 auto' }}>
      <div style={{ display:'flex', gap:28, flexWrap:'wrap', alignItems:'flex-start' }}>

        {/* ── Left sidebar ── */}
        <div style={{ width:240, flexShrink:0 }}>

          {/* Profile card */}
          <div className="glass" style={{ padding:24, marginBottom:16, textAlign:'center' }}>
            <div style={{
              width:64, height:64, borderRadius:'50%', background:'var(--gradient)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'Orbitron', fontWeight:700, fontSize:'1.5rem',
              margin:'0 auto 10px', color:'#fff',
            }}>
              {displayName[0]?.toUpperCase()}
            </div>
            <div style={{ fontFamily:'Orbitron', fontWeight:700, fontSize:'0.95rem', marginBottom:4 }}>
              {displayName}
            </div>
            <div style={{ color:'var(--primary)', fontSize:'0.78rem', marginBottom:12 }}>
              {fieldLabel}
            </div>
            {profile?.bio && (
              <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', lineHeight:1.5, marginBottom:12 }}>
                {profile.bio}
              </p>
            )}
            {profile?.skills?.length > 0 && (
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'center' }}>
                {profile.skills.slice(0,4).map(s => (
                  <span key={s} style={{ background:'rgba(99,102,241,0.15)', color:'var(--primary)', padding:'2px 8px', borderRadius:10, fontSize:'0.68rem' }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats — hardcoded display, no icon reliance */}
          <div className="glass" style={{ padding:20, marginBottom:16 }}>
            <div style={{ fontFamily:'Orbitron', fontSize:'0.68rem', color:'var(--text-muted)', letterSpacing:1, marginBottom:14 }}>
              STATS
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>Projects Owned</span>
              <span style={{ fontFamily:'Orbitron', fontWeight:700, color:'var(--primary)', fontSize:'1rem' }}>{ownedCount}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>Total Collabs</span>
              <span style={{ fontFamily:'Orbitron', fontWeight:700, color:'var(--primary)', fontSize:'1rem' }}>{joinedCount}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>Total Projects</span>
              <span style={{ fontFamily:'Orbitron', fontWeight:700, color:'var(--primary)', fontSize:'1rem' }}>{totalCount}</span>
            </div>
          </div>

          {/* Buttons */}
          <button className="btn-primary" onClick={() => navigate('/create')}
            style={{ width:'100%', padding:12, marginBottom:8, fontSize:'0.85rem' }}>
            + New Project
          </button>
          <button className="btn-outline" onClick={() => navigate('/edit-profile')}
            style={{ width:'100%', padding:12, marginBottom:8, fontSize:'0.85rem' }}>
            Edit Profile
          </button>
          <button onClick={() => { logout(); navigate('/'); }}
            style={{ width:'100%', padding:12, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, color:'#f87171', cursor:'pointer', fontSize:'0.85rem' }}>
            Logout
          </button>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* Tabs */}
          <div style={{ display:'flex', gap:4, marginBottom:20, background:'rgba(255,255,255,0.03)', borderRadius:10, padding:4, width:'fit-content' }}>
            {[
              { key:'owned',  label:`My Projects (${ownedCount})` },
              { key:'joined', label:`Collaborating (${joinedCount})` },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{
                  padding:'8px 18px', borderRadius:8, border:'none', cursor:'pointer',
                  fontFamily:'Orbitron', fontSize:'0.7rem', letterSpacing:0.5,
                  background: activeTab === tab.key ? 'var(--gradient)' : 'transparent',
                  color: activeTab === tab.key ? '#fff' : 'var(--text-muted)',
                  transition:'all 0.2s',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Project list */}
          {(activeTab === 'owned' ? ownedProjects : joinedProjects).length === 0 ? (
            <div style={{ textAlign:'center', padding:60 }}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>🚀</div>
              <h3 style={{ fontFamily:'Orbitron', color:'var(--text-muted)', marginBottom:16 }}>
                {activeTab === 'owned' ? 'No projects yet' : 'Not collaborating yet'}
              </h3>
              {activeTab === 'owned' && (
                <button className="btn-primary" onClick={() => navigate('/create')}>
                  Create Your First Project
                </button>
              )}
              {activeTab === 'joined' && (
                <button className="btn-outline" onClick={() => navigate('/projects')}>
                  Browse Projects to Join
                </button>
              )}
            </div>
          ) : (
            <div style={{ display:'grid', gap:14 }}>
              {(activeTab === 'owned' ? ownedProjects : joinedProjects).map(p => (
                <div key={p._id} className="glass"
                  style={{ padding:20, borderRadius:12, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                      <span style={{ background:'rgba(99,102,241,0.2)', color:'var(--primary)', padding:'2px 10px', borderRadius:12, fontSize:'0.7rem', fontFamily:'Orbitron' }}>
                        {p.category}
                      </span>
                      <span style={{ background: p.status === 'open' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: p.status === 'open' ? '#10b981' : '#f59e0b', padding:'2px 10px', borderRadius:12, fontSize:'0.7rem' }}>
                        {p.status}
                      </span>
                    </div>
                    <div style={{ fontWeight:700, marginBottom:4, fontFamily:'Orbitron', fontSize:'0.9rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {p.title}
                    </div>
                    <div style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>
                      👥 {p.collaborators?.length || 0} collaborators &nbsp;·&nbsp; ❤️ {p.likes?.length || 0} likes
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button className="btn-outline"
                      onClick={() => navigate(`/projects/${p._id}`)}
                      style={{ padding:'8px 14px', fontSize:'0.78rem' }}>
                      View
                    </button>
                    {activeTab === 'owned' && (
                      <button onClick={() => handleDeleteProject(p._id)}
                        style={{ padding:'8px 14px', fontSize:'0.78rem', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, color:'#f87171', cursor:'pointer' }}>
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
    </div>
  );
}