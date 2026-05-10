import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', description:'', category:'design', tags:'', status:'open' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = { ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) };
      const res = await axios.post(`${API}/projects`, data);
      navigate(`/projects/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ maxWidth:680 }}>
      <h1 style={{ fontFamily:'Orbitron', fontSize:'1.8rem', marginBottom:8, background:'var(--gradient)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>New Project</h1>
      <p style={{ color:'var(--text-muted)', marginBottom:40 }}>Launch your collaborative project</p>

      {error && <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:8, padding:'12px 16px', marginBottom:20, color:'#f87171' }}>{error}</div>}

      <div className="glass" style={{ padding:40 }}>
        <form onSubmit={handleSubmit}>
          {[{key:'title',label:'PROJECT TITLE',type:'text',placeholder:'An amazing collab project...'},{key:'description',label:'DESCRIPTION',type:'textarea',placeholder:'What are you building? Who are you looking for?'}].map(f => (
            <div key={f.key} style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:8, letterSpacing:1 }}>{f.label}</label>
              {f.type === 'textarea'
                ? <textarea placeholder={f.placeholder} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} required style={{ minHeight:120, resize:'vertical' }} />
                : <input type="text" placeholder={f.placeholder} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} required />
              }
            </div>
          ))}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
            <div>
              <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:8, letterSpacing:1 }}>CATEGORY</label>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                {['design','music','social-media','development','other'].map(c => <option key={c} value={c}>{c.replace('-',' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:8, letterSpacing:1 }}>STATUS</label>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                {['open','in-progress','completed'].map(s => <option key={s} value={s}>{s.replace('-',' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom:32 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:8, letterSpacing:1 }}>TAGS (comma separated)</label>
            <input type="text" placeholder="react, ui-design, music-production..." value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} />
          </div>
          <div style={{ display:'flex', gap:16 }}>
            <button type="submit" className="btn-primary" style={{ flex:1, padding:'14px' }} disabled={loading}>{loading ? 'Creating...' : 'Launch Project'}</button>
            <button type="button" className="btn-outline" onClick={() => navigate('/projects')} style={{ padding:'14px 24px' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
