import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(5,7,20,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(168,85,247,0.2)', padding: '0 32px', height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <Link to="/" style={{textDecoration:'none', display:'flex', alignItems:'center', gap:'10px'}}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg,#a855f7,#ec4899)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: '18px', boxShadow: '0 0 20px rgba(168,85,247,0.5)'
        }}>🤝</div>
        <span style={{fontFamily:'Orbitron', fontSize:'1.1rem', fontWeight:800,
          background:'linear-gradient(135deg,#a855f7,#ec4899,#06b6d4)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>COLLAB</span>
      </Link>

      <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
        <Link to="/projects" style={{color:'var(--text-muted)', textDecoration:'none', padding:'8px 16px', fontFamily:'Rajdhani', fontSize:'0.95rem', transition:'color 0.2s'}}
          onMouseEnter={e=>e.target.style.color='var(--primary)'} onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>Projects</Link>
        <Link to="/explore" style={{color:'var(--text-muted)', textDecoration:'none', padding:'8px 16px', fontFamily:'Rajdhani', fontSize:'0.95rem', transition:'color 0.2s'}}
          onMouseEnter={e=>e.target.style.color='var(--primary)'} onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>Explore</Link>
        {user ? (
          <>
            <Link to="/create" style={{color:'var(--text-muted)', textDecoration:'none', padding:'8px 16px', fontFamily:'Rajdhani', fontSize:'0.95rem'}}
              onMouseEnter={e=>e.target.style.color='var(--primary)'} onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>+ New</Link>
            <Link to="/dashboard" style={{color:'var(--text-muted)', textDecoration:'none', padding:'8px 16px', fontFamily:'Rajdhani', fontSize:'0.95rem'}}
              onMouseEnter={e=>e.target.style.color='var(--primary)'} onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>Dashboard</Link>
            <button onClick={()=>{logout();navigate('/')}} className="btn-outline" style={{padding:'6px 16px',fontSize:'0.75rem'}}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"><button className="btn-outline" style={{padding:'6px 16px',fontSize:'0.75rem'}}>Login</button></Link>
            <Link to="/register"><button className="btn-primary" style={{padding:'6px 16px',fontSize:'0.75rem'}}>Join</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}
