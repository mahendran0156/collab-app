import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Scene3D from '../components/Scene3D.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
      <Scene3D height="100vh" />
      <div className="glass" style={{ position:'relative', zIndex:10, padding:'48px 40px', width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:16 }}>🤝</div>
          <h1 style={{ fontFamily:'Orbitron', fontSize:'1.5rem', background:'var(--gradient)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Welcome Back</h1>
          <p style={{ color:'var(--text-muted)', marginTop:8, fontFamily:'Rajdhani' }}>Sign in to continue collaborating</p>
        </div>
        {error && <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:8, padding:'12px 16px', marginBottom:20, color:'#f87171', fontSize:'0.88rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:8, letterSpacing:1 }}>EMAIL</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          </div>
          <div style={{ marginBottom:32 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:8, letterSpacing:1 }}>PASSWORD</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
          </div>
          <button type="submit" className="btn-primary" style={{ width:'100%', padding:'14px', fontSize:'0.9rem' }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:24, color:'var(--text-muted)', fontFamily:'Rajdhani' }}>
          No account? <Link to="/register" style={{ color:'var(--primary)', textDecoration:'none' }}>Join Collab</Link>
        </p>
      </div>
    </div>
  );
}
