import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form,    setForm]    = useState({ title:'', description:'', category:'development', status:'open', tags:'' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  // Load existing project data
  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(res => {
        const p = res.data.project;
        // Verify ownership
        if (String(p.owner?._id || p.owner) !== String(user?._id)) {
          navigate(`/projects/${id}`);
          return;
        }
        setForm({
          title:       p.title       || '',
          description: p.description || '',
          category:    p.category    || 'development',
          status:      p.status      || 'open',
          tags:        Array.isArray(p.tags) ? p.tags.join(', ') : '',
        });
      })
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.put(`/projects/${id}`, {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        status:      form.status,
        tags:        form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update project');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ textAlign:'center', paddingTop:120, color:'#a855f7', fontFamily:'Orbitron,sans-serif' }}>
      Loading project...
    </div>
  );

  return (
    <div style={{ paddingTop:90, paddingBottom:40, paddingLeft:32, paddingRight:32, maxWidth:680, margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Orbitron', fontSize:'1.8rem', marginBottom:8, background:'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        Edit Project
      </h1>
      <p style={{ color:'#94a3b8', marginBottom:40 }}>Update your project details</p>

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
            <input type="text" value={form.title}
              onChange={e => setForm({...form, title:e.target.value})} required />
          </div>

          {/* Description */}
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>DESCRIPTION</label>
            <textarea value={form.description}
              onChange={e => setForm({...form, description:e.target.value})}
              required style={{ minHeight:120, resize:'vertical' }} />
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
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom:32 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>TAGS (comma separated)</label>
            <input type="text" value={form.tags}
              onChange={e => setForm({...form, tags:e.target.value})}
              placeholder="react, design, music-production..." />
          </div>

          <div style={{ display:'flex', gap:16 }}>
            <button type="submit" className="btn-primary" style={{ flex:1, padding:'14px' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-outline"
              onClick={() => navigate(`/projects/${id}`)}
              style={{ padding:'14px 24px' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}