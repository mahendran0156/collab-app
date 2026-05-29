import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const fieldOptions = ['developer','designer','musician','social-media','other'];

export default function EditProfile() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ username:'', bio:'', field:'other', skills:'', github:'', portfolio:'' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [message, setMessage] = useState('');
  const [error,   setError]   = useState('');

  // Load current profile data
  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        const u = res.data.user;
        setForm({
          username:  u.username  || '',
          bio:       u.bio       || '',
          field:     u.field     || 'other',
          skills:    Array.isArray(u.skills) ? u.skills.join(', ') : '',
          github:    u.github    || '',
          portfolio: u.portfolio || '',
        });
      })
      .catch(err => console.error('Load profile error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      const res = await api.put('/users/profile', {
        username:  form.username.trim(),
        bio:       form.bio.trim(),
        field:     form.field,
        skills:    form.skills.split(',').map(s => s.trim()).filter(Boolean),
        github:    form.github.trim(),
        portfolio: form.portfolio.trim(),
      });
      if (updateUser) updateUser(res.data.user);
      setMessage('Profile updated successfully!');
      // Use navigate — NOT window.location (preserves auth)
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ textAlign:'center', paddingTop:120, color:'#a855f7', fontFamily:'Orbitron,sans-serif' }}>
      Loading...
    </div>
  );

  return (
    <div style={{ paddingTop:90, paddingBottom:40, paddingLeft:32, paddingRight:32, maxWidth:600, margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Orbitron', fontSize:'1.8rem', marginBottom:8, background:'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        Edit Profile
      </h1>
      <p style={{ color:'#94a3b8', marginBottom:32 }}>Update your creator profile</p>

      {message && (
        <div style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.4)', borderRadius:8, padding:'12px 16px', marginBottom:20, color:'#10b981' }}>
          ✅ {message}
        </div>
      )}
      {error && (
        <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:8, padding:'12px 16px', marginBottom:20, color:'#f87171' }}>
          ❌ {error}
        </div>
      )}

      <div className="glass" style={{ padding:36 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>USERNAME</label>
            <input type="text" value={form.username}
              onChange={e => setForm({...form, username:e.target.value})} required />
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>YOUR FIELD</label>
            <select value={form.field} onChange={e => setForm({...form, field:e.target.value})}>
              {fieldOptions.map(f => (
                <option key={f} value={f}>
                  {f.replace('-',' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>BIO</label>
            <textarea value={form.bio}
              onChange={e => setForm({...form, bio:e.target.value})}
              placeholder="Tell collaborators about yourself..."
              style={{ minHeight:80, resize:'vertical' }} />
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>SKILLS (comma separated)</label>
            <input type="text" value={form.skills}
              onChange={e => setForm({...form, skills:e.target.value})}
              placeholder="React, Node.js, UI Design..." />
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>GITHUB URL</label>
            <input type="text" value={form.github}
              onChange={e => setForm({...form, github:e.target.value})}
              placeholder="https://github.com/username" />
          </div>

          <div style={{ marginBottom:28 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>PORTFOLIO / WEBSITE</label>
            <input type="text" value={form.portfolio}
              onChange={e => setForm({...form, portfolio:e.target.value})}
              placeholder="https://yoursite.com" />
          </div>

          <div style={{ display:'flex', gap:12 }}>
            <button type="submit" className="btn-primary"
              style={{ flex:1, padding:14 }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-outline"
              onClick={() => navigate('/dashboard')}
              style={{ padding:'14px 24px' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}