import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const categories = ['all', 'design', 'music', 'social-media', 'development', 'other'];
const statuses = ['all', 'open', 'in-progress', 'completed'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    fetchProjects();
  }, [category, status]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (status !== 'all') params.status = status;
      if (search) params.search = search;
      const res = await axios.get(`${API}/projects`, { params });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div style={{ marginBottom:40 }}>
        <h1 style={{ fontFamily:'Orbitron', fontSize:'2rem', marginBottom:8, background:'var(--gradient)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Discover Projects</h1>
        <p style={{ color:'var(--text-muted)' }}>Find your next creative collaboration</p>
      </div>

      <div style={{ display:'flex', gap:16, marginBottom:32, flexWrap:'wrap' }}>
        <input placeholder="Search projects..." value={search} onChange={e=>setSearch(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&fetchProjects()} style={{ flex:'1', minWidth:200 }} />
        <select value={category} onChange={e=>setCategory(e.target.value)} style={{ width:'auto', minWidth:140 }}>
          {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace('-',' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
        </select>
        <select value={status} onChange={e=>setStatus(e.target.value)} style={{ width:'auto', minWidth:120 }}>
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('-',' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
        </select>
        <button className="btn-primary" onClick={fetchProjects} style={{ padding:'12px 24px', fontSize:'0.8rem' }}>Search</button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', color:'var(--primary)', fontFamily:'Orbitron', padding:60 }}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign:'center', padding:80 }}>
          <div style={{ fontSize:'3rem', marginBottom:16 }}>🔍</div>
          <h3 style={{ fontFamily:'Orbitron', color:'var(--text-muted)' }}>No projects found</h3>
          <button className="btn-primary" onClick={() => navigate('/create')} style={{ marginTop:24 }}>Create First Project</button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:24 }}>
          {projects.map(p => <ProjectCard key={p._id} project={p} onClick={() => navigate(`/projects/${p._id}`)} />)}
        </div>
      )}
    </div>
  );
}
