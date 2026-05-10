import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ comment:'', rating:5 });
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    axios.get(`${API}/projects/${id}`)
      .then(res => setProject(res.data))
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [id]);

  const joinProject = async () => {
    try {
      const res = await axios.post(`${API}/projects/${id}/join`);
      setProject(res.data);
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/projects/${id}/review`, review);
      setProject(res.data);
      setReview({ comment:'', rating:5 });
    } catch (err) { alert('Login to review'); }
  };

  const likeProject = async () => {
    try {
      await axios.post(`${API}/projects/${id}/like`);
      const res = await axios.get(`${API}/projects/${id}`);
      setProject(res.data);
    } catch (err) { alert('Login to like'); }
  };

  if (loading) return <div style={{ textAlign:'center', padding:120, color:'var(--primary)', fontFamily:'Orbitron' }}>Loading...</div>;
  if (!project) return null;

  const catColors = { design:'#a855f7', music:'#ec4899', 'social-media':'#06b6d4', development:'#f59e0b', other:'#94a3b8' };
  const color = catColors[project.category] || '#94a3b8';
  const isCollaborator = user && project.collaborators?.some(c => c._id === user.id);
  const isOwner = user && project.owner?._id === user.id;

  return (
    <div className="page" style={{ maxWidth:900 }}>
      <button onClick={() => navigate('/projects')} style={{ background:'none', border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-muted)', padding:'8px 16px', borderRadius:8, cursor:'pointer', marginBottom:32, fontFamily:'Rajdhani' }}>← Back</button>

      <div className="glass" style={{ padding:40, marginBottom:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
          <div style={{ flex:1 }}>
            <span style={{ background:`${color}22`, border:`1px solid ${color}`, color, padding:'4px 14px', borderRadius:20, fontSize:'0.7rem', fontFamily:'Orbitron' }}>{project.category}</span>
            <h1 style={{ fontFamily:'Orbitron', fontSize:'1.8rem', marginTop:16, marginBottom:8, color:'var(--text)' }}>{project.title}</h1>
            <p style={{ color:'var(--text-muted)', lineHeight:1.7 }}>{project.description}</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12, alignItems:'flex-end' }}>
            <span style={{ background: project.status === 'open' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)', color: project.status === 'open' ? '#22c55e' : '#f59e0b', padding:'6px 16px', borderRadius:20, fontSize:'0.8rem', fontFamily:'Orbitron' }}>{project.status}</span>
            <button onClick={likeProject} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontFamily:'Rajdhani', fontSize:'0.9rem' }}>❤️ {project.likes?.length || 0}</button>
            {!isOwner && !isCollaborator && user && (
              <button className="btn-primary" onClick={joinProject} style={{ padding:'10px 24px' }}>Join Project</button>
            )}
            {isCollaborator && <span style={{ color:'#22c55e', fontFamily:'Orbitron', fontSize:'0.7rem' }}>✓ COLLABORATING</span>}
          </div>
        </div>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:20 }}>
          {project.tags?.map(t => <span key={t} style={{ background:'rgba(255,255,255,0.05)', padding:'4px 12px', borderRadius:12, fontSize:'0.75rem', color:'var(--text-muted)', border:'1px solid rgba(255,255,255,0.08)' }}>#{t}</span>)}
        </div>

        <div style={{ display:'flex', gap:32, marginTop:32, paddingTop:24, borderTop:'1px solid rgba(168,85,247,0.15)' }}>
          <div>
            <div style={{ fontSize:'0.7rem', fontFamily:'Orbitron', color:'var(--text-muted)', marginBottom:4 }}>OWNER</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg, ${color}, #06b6d4)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{project.owner?.name?.charAt(0)}</div>
              <span style={{ fontFamily:'Rajdhani', fontSize:'0.95rem' }}>{project.owner?.name}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize:'0.7rem', fontFamily:'Orbitron', color:'var(--text-muted)', marginBottom:4 }}>COLLABORATORS</div>
            <div style={{ display:'flex', gap:-8 }}>
              {project.collaborators?.slice(0,5).map(c => (
                <div key={c._id} style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg, #a855f7, #ec4899)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.75rem', border:'2px solid var(--bg)', marginLeft:-4 }}>{c.name?.charAt(0)}</div>
              ))}
              {(!project.collaborators || project.collaborators.length === 0) && <span style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>No collaborators yet</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="glass" style={{ padding:32 }}>
        <h2 style={{ fontFamily:'Orbitron', fontSize:'1rem', marginBottom:24, color:'var(--text)' }}>💬 Reviews & Comments</h2>
        {user && (
          <form onSubmit={submitReview} style={{ marginBottom:32, paddingBottom:32, borderBottom:'1px solid rgba(168,85,247,0.1)' }}>
            <div style={{ display:'flex', gap:12, marginBottom:12 }}>
              <textarea placeholder="Share your thoughts..." value={review.comment} onChange={e=>setReview({...review,comment:e.target.value})} style={{ flex:1, minHeight:80, resize:'vertical' }} required />
            </div>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <label style={{ fontFamily:'Orbitron', fontSize:'0.7rem', color:'var(--text-muted)' }}>RATING</label>
              <select value={review.rating} onChange={e=>setReview({...review,rating:+e.target.value})} style={{ width:'auto' }}>
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ⭐</option>)}
              </select>
              <button type="submit" className="btn-primary" style={{ padding:'8px 20px', fontSize:'0.8rem' }}>Post Review</button>
            </div>
          </form>
        )}
        {project.reviews?.length === 0 && <p style={{ color:'var(--text-muted)', fontFamily:'Rajdhani' }}>No reviews yet. Be the first!</p>}
        {project.reviews?.map((r, i) => (
          <div key={i} style={{ padding:'16px 0', borderBottom:'1px solid rgba(168,85,247,0.08)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#a855f7,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem' }}>{r.user?.name?.charAt(0)}</div>
                <span style={{ fontFamily:'Orbitron', fontSize:'0.75rem', color:'var(--text)' }}>{r.user?.name}</span>
              </div>
              <span>{'⭐'.repeat(r.rating)}</span>
            </div>
            <p style={{ color:'var(--text-muted)', fontFamily:'Rajdhani', fontSize:'0.95rem', lineHeight:1.6 }}>{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
