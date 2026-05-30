import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [ownedProjects,  setOwnedProjects]  = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [profile,        setProfile]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState('owned');

  useEffect(() => {
    if (user?._id) fetchDashboard();
  }, [location.key, user?._id]); // eslint-disable-line

  async function fetchDashboard() {
    setLoading(true);
    try {
      const userId = user._id.toString();

      // Run both fetches in parallel
      const [profileRes, projectsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/projects', { params: { limit: 100 } }),
      ]);

      setProfile(profileRes.data.user);

      const all = projectsRes.data.projects || [];

      // owned: project.owner._id === userId
      const owned = all.filter(p =>
        (p.owner?._id || p.owner || '').toString() === userId
      );

      // joined: userId in collaborators array
      const joined = all.filter(p =>
        Array.isArray(p.collaborators) &&
        p.collaborators.some(c => (c?._id || c || '').toString() === userId)
      );

      setOwnedProjects(owned);
      setJoinedProjects(joined);

    } catch (err) {
      console.error('Dashboard error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (pid) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${pid}`);
      fetchDashboard();
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div style={{ textAlign:'center', paddingTop:120, color:'#a855f7', fontFamily:'Orbitron,sans-serif' }}>
      Loading dashboard...
    </div>
  );

  const displayName = profile?.username || user?.username || 'Creator';
  const fieldLabel  = (profile?.field || user?.field || '')
    .replace('-',' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Creator';
  const ownedCount  = ownedProjects.length;
  const joinedCount = joinedProjects.length;
  const activeList  = activeTab === 'owned' ? ownedProjects : joinedProjects;

  return (
    <div style={{ paddingTop:90, paddingBottom:40, paddingLeft:32, paddingRight:32, maxWidth:1200, margin:'0 auto' }}>
      <div style={{ display:'flex', gap:28, flexWrap:'wrap', alignItems:'flex-start' }}>

        {/* ── Sidebar ── */}
        <div style={{ width:240, flexShrink:0 }}>

          {/* Profile card */}
          <div className="glass" style={{ padding:24, marginBottom:16, textAlign:'center' }}>
            <div style={{
              width:64, height:64, borderRadius:'50%',
              background:'linear-gradient(135deg,#a855f7,#ec4899)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'Orbitron', fontWeight:700, fontSize:'1.5rem',
              margin:'0 auto 12px', color:'#fff',
            }}>
              {displayName[0]?.toUpperCase()}
            </div>
            <div style={{ fontFamily:'Orbitron', fontWeight:700, fontSize:'0.95rem', marginBottom:4, color:'#e2e8f0' }}>
              {displayName}
            </div>
            <div style={{ color:'#a855f7', fontSize:'0.78rem', marginBottom: profile?.bio ? 10 : 0 }}>
              {fieldLabel}
            </div>
            {profile?.bio && (
              <p style={{ color:'#94a3b8', fontSize:'0.78rem', lineHeight:1.6, margin:'10px 0 0', textAlign:'left' }}>
                {profile.bio}
              </p>
            )}
            {profile?.skills?.length > 0 && (
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'center', marginTop:10 }}>
                {profile.skills.slice(0, 5).map(s => (
                  <span key={s} style={{ background:'rgba(168,85,247,0.15)', color:'#a855f7', padding:'2px 8px', borderRadius:10, fontSize:'0.68rem' }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
            {profile?.github && (
              <a href={profile.github} target="_blank" rel="noreferrer"
                style={{ display:'block', marginTop:10, color:'#a855f7', fontSize:'0.75rem', textDecoration:'none' }}>
                🔗 GitHub
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="glass" style={{ padding:20, marginBottom:16 }}>
            <div style={{ fontFamily:'Orbitron', fontSize:'0.68rem', color:'#94a3b8', letterSpacing:1, marginBottom:14 }}>
              STATS
            </div>
            {[
              { label:'Projects Owned', val: ownedCount },
              { label:'Collaborating',  val: joinedCount },
              { label:'Total',          val: ownedCount + joinedCount },
            ].map((s, i, arr) => (
              <div key={s.label} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'8px 0',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <span style={{ color:'#94a3b8', fontSize:'0.82rem' }}>{s.label}</span>
                <span style={{
                  background:'linear-gradient(135deg,#a855f7,#ec4899)',
                  color:'#fff', borderRadius:6, fontWeight:700,
                  fontSize:'0.85rem', padding:'2px 10px',
                  fontFamily:'Arial, Helvetica, sans-serif',
                  minWidth:28, textAlign:'center', display:'inline-block',
                }}>
                  {s.val}
                </span>
              </div>
            ))}
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
                  background: activeTab === tab.key ? 'linear-gradient(135deg,#a855f7,#ec4899)' : 'transparent',
                  color: activeTab === tab.key ? '#fff' : '#94a3b8',
                  transition:'all 0.2s',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Project list */}
          {activeList.length === 0 ? (
            <div style={{ textAlign:'center', padding:60 }}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>🚀</div>
              <h3 style={{ fontFamily:'Orbitron', color:'#94a3b8', marginBottom:16 }}>
                {activeTab === 'owned' ? 'No projects yet' : 'Not collaborating yet'}
              </h3>
              {activeTab === 'owned' ? (
                <button className="btn-primary" onClick={() => navigate('/create')}>
                  Create Your First Project
                </button>
              ) : (
                <button className="btn-outline" onClick={() => navigate('/projects')}>
                  Browse Projects to Join
                </button>
              )}
            </div>
          ) : (
            <div style={{ display:'grid', gap:14 }}>
              {activeList.map(p => (
                <div key={p._id} className="glass"
                  style={{ padding:20, borderRadius:12, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                      <span style={{ background:'rgba(168,85,247,0.2)', color:'#a855f7', padding:'2px 10px', borderRadius:12, fontSize:'0.7rem', fontFamily:'Orbitron' }}>
                        {p.category}
                      </span>
                      <span style={{ background: p.status === 'open' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: p.status === 'open' ? '#10b981' : '#f59e0b', padding:'2px 10px', borderRadius:12, fontSize:'0.7rem' }}>
                        {p.status}
                      </span>
                    </div>
                    <div style={{ fontWeight:700, fontFamily:'Orbitron', fontSize:'0.88rem', color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:4 }}>
                      {p.title}
                    </div>
                    <div style={{ color:'#94a3b8', fontSize:'0.78rem' }}>
                      👥 {p.collaborators?.length || 0} collaborators &nbsp;·&nbsp; ❤️ {p.likes?.length || 0} likes
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button className="btn-outline" onClick={() => navigate(`/projects/${p._id}`)}
                      style={{ padding:'8px 14px', fontSize:'0.78rem' }}>View</button>
                    {activeTab === 'owned' && (<>
                      <button className="btn-outline" onClick={() => navigate(`/projects/${p._id}/edit`)}
                        style={{ padding:'8px 14px', fontSize:'0.78rem' }}>Edit</button>
                      <button onClick={() => handleDelete(p._id)}
                        style={{ padding:'8px 14px', fontSize:'0.78rem', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, color:'#f87171', cursor:'pointer' }}>
                        Delete
                      </button>
                    </>)}
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