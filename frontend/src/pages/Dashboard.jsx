import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import ProjectCard from '../components/ProjectCard.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/users/profile`).then(r => setProfile(r.data));
    axios.get(`${API}/projects`).then(r => {
      const mine = r.data.filter(p => p.owner?._id === user?.id || p.owner === user?.id);
      setProjects(mine);
    });
  }, [user]);

  const fieldIcons = { design:'🎨', music:'🎵', 'social-media':'📱', development:'💻', other:'✨' };

  return (
    <div className="page">
      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:32, alignItems:'start' }}>
        <div>
          <div className="glass" style={{ padding:32, textAlign:'center', marginBottom:24 }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#a855f7,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', margin:'0 auto 16px', boxShadow:'0 0 30px rgba(168,85,247,0.4)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontFamily:'Orbitron', fontSize:'1rem', marginBottom:4 }}>{profile?.name}</h2>
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:12 }}>{profile?.email}</p>
            <span style={{ background:'rgba(168,85,247,0.2)', border:'1px solid var(--primary)', color:'var(--primary)', padding:'4px 14px', borderRadius:20, fontSize:'0.7rem', fontFamily:'Orbitron' }}>
              {fieldIcons[profile?.field]} {profile?.field?.replace('-',' ')}
            </span>
            {profile?.bio && <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginTop:16, lineHeight:1.6 }}>{profile.bio}</p>}
          </div>
          <div className="glass" style={{ padding:24, marginBottom:24 }}>
            <h3 style={{ fontFamily:'Orbitron', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:16 }}>STATS</h3>
            {[{label:'Projects Owned', value:projects.length},{label:'Total Collabs', value:profile?.projects?.length||0},{label:'Reviews', value:0}].map(s => (
              <div key={s.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(168,85,247,0.1)' }}>
                <span style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>{s.label}</span>
                <span style={{ fontFamily:'Orbitron', color:'var(--primary)', fontSize:'0.9rem' }}>{s.value}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={() => navigate('/create')} style={{ width:'100%', padding:'14px' }}>+ New Project</button>
        </div>
        <div>
          <h2 style={{ fontFamily:'Orbitron', fontSize:'1.2rem', marginBottom:24, color:'var(--text)' }}>My Projects</h2>
          {projects.length === 0 ? (
            <div className="glass" style={{ padding:60, textAlign:'center' }}>
              <div style={{ fontSize:'3rem', marginBottom:16 }}>🚀</div>
              <h3 style={{ fontFamily:'Orbitron', color:'var(--text-muted)', marginBottom:16 }}>No projects yet</h3>
              <button className="btn-primary" onClick={() => navigate('/create')}>Create Your First Project</button>
            </div>
          ) : (
            <div style={{ display:'grid', gap:20 }}>
              {projects.map(p => <ProjectCard key={p._id} project={p} onClick={() => navigate(`/projects/${p._id}`)} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
