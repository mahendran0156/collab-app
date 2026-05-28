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
      .catch(err => console.error(err))
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
      setMessage('Profile updated!');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ textAlign:'center', paddingTop:120, color:'#a855f7', fontFamily:'Orbitron' }}>Loading...</div>
  );

  return (
    <div style={{ paddingTop:90, paddingBottom:40, paddingLeft:'5%', paddingRight:'5%', maxWidth:600, margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Orbitron', fontSize:'1.8rem', marginBottom:8, background:'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        Edit Profile
      </h1>
      <p style={{ color:'#94a3b8', marginBottom:32 }}>Update your creator profile</p>

      {message && <div style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.4)', borderRadius:8, padding:'12px 16px', marginBottom:20, color:'#10b981' }}>✅ {message}</div>}
      {error   && <div style={{ background:'rgba(239,68,68,0.15)',  border:'1px solid rgba(239,68,68,0.4)',  borderRadius:8, padding:'12px 16px', marginBottom:20, color:'#f87171' }}>❌ {error}</div>}

      <div className="glass" style={{ padding:36 }}>
        <form onSubmit={handleSubmit}>
          {[
            { key:'username', label:'USERNAME', type:'text', placeholder:'Your username', required:true },
            { key:'bio',      label:'BIO',      type:'textarea', placeholder:'Tell collaborators about yourself...' },
            { key:'skills',   label:'SKILLS (comma separated)', type:'text', placeholder:'React, Node.js, Design...' },
            { key:'github',   label:'GITHUB URL',   type:'text', placeholder:'https://github.com/username' },
            { key:'portfolio',label:'PORTFOLIO/WEBSITE', type:'text', placeholder:'https://yoursite.com' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>{f.label}</label>
              {f.type === 'textarea'
                ? <textarea value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder} style={{ minHeight:80, resize:'vertical' }} />
                : <input type="text" value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder} required={f.required} />
              }
            </div>
          ))}

          <div style={{ marginBottom:28 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'#94a3b8', marginBottom:8, letterSpacing:1 }}>YOUR FIELD</label>
            <select value={form.field} onChange={e => setForm({...form, field:e.target.value})}>
              {fieldOptions.map(f => <option key={f} value={f}>{f.replace('-',' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
          </div>

          <div style={{ display:'flex', gap:12 }}>
            <button type="submit" className="btn-primary" style={{ flex:1, padding:14 }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
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