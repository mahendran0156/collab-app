import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Scene3D from '../components/Scene3D.jsx';

const fields = ['design', 'music', 'social-media', 'development', 'other'];

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', field:'other' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding:'80px 20px 20px' }}>
      <Scene3D height="100vh" />
      <div className="glass" style={{ position:'relative', zIndex:10, padding:'48px 40px', width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:16 }}>✨</div>
          <h1 style={{ fontFamily:'Orbitron', fontSize:'1.5rem', background:'var(--gradient)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Join Collab</h1>
          <p style={{ color:'var(--text-muted)', marginTop:8, fontFamily:'Rajdhani' }}>Start building creative partnerships</p>
        </div>
        {error && <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:8, padding:'12px 16px', marginBottom:20, color:'#f87171', fontSize:'0.88rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[{key:'name',label:'FULL NAME',type:'text',placeholder:'Your name'},{key:'email',label:'EMAIL',type:'email',placeholder:'you@example.com'},{key:'password',label:'PASSWORD',type:'password',placeholder:'Min 6 chars'}].map(f => (
            <div key={f.key} style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:8, letterSpacing:1 }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} required />
            </div>
          ))}
          <div style={{ marginBottom:32 }}>
            <label style={{ display:'block', fontFamily:'Orbitron', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:8, letterSpacing:1 }}>YOUR FIELD</label>
            <select value={form.field} onChange={e=>setForm({...form,field:e.target.value})}>
              {fields.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1).replace('-',' ')}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ width:'100%', padding:'14px', fontSize:'0.9rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:24, color:'var(--text-muted)', fontFamily:'Rajdhani' }}>
          Have an account? <Link to="/login" style={{ color:'var(--primary)', textDecoration:'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
