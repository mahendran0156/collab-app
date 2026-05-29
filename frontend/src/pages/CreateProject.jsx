import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title:'', description:'', category:'development', tags:'', status:'open'
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/projects', {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        status:      form.status,
        tags:        form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      // Navigate to dashboard — location.key change triggers dashboard refresh
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ paddingTop:90, paddingBottom:40, paddingLeft:32, paddingRight:32, maxWidth:680, margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Orbitron', fontSize:'1.8rem', marginBottom:8, background:'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        New Project
      </h1>
      <p style={{ color:'#94a3b8', marginBottom:40 }}>Launch your collaborative project</p>

      {error && (
        <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:8, padding:'12px 16px', marginBottom:20, color:'#f87171' }}>
          {error}
        </div>
      )}

      <div className="glass" style={{ padding:40 }}>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>PROJECT TITLE</label>
            <input type="text" placeholder="An amazing collab project..." value={form.title}
              onChange={e => setForm({...form, title:e.target.value})} required />
          </div>

          {/* Description */}
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>DESCRIPTION</label>
            <textarea placeholder="What are you building? Who are you looking for?" value={form.description}
              onChange={e => setForm({...form, description:e.target.value})} required style={{ minHeight:120, resize:'vertical' }} />
          </div>

          {/* Category + Status */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
            <div>
              <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>CATEGORY</label>
              <select value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="music">Music</option>
                <option value="social-media">Social Media</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>STATUS</label>
              <select value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom:32 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>TAGS (comma separated)</label>
            <input type="text" placeholder="react, ui-design, music-production..." value={form.tags}
              onChange={e => setForm({...form, tags:e.target.value})} />
          </div>

          <div style={{ display:'flex', gap:16 }}>
            <button type="submit" className="btn-primary" style={{ flex:1, padding:'14px' }} disabled={loading}>
              {loading ? 'Creating...' : 'Launch Project'}
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate('/dashboard')} style={{ padding:'14px 24px' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}