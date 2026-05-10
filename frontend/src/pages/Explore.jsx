import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Explore() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const fieldIcons = { design:'🎨', music:'🎵', 'social-media':'📱', development:'💻', other:'✨' };
  const fieldColors = { design:'#a855f7', music:'#ec4899', 'social-media':'#06b6d4', development:'#f59e0b', other:'#94a3b8' };

  useEffect(() => {
    axios.get(`${API}/users`).then(r => setUsers(r.data));
  }, []);

  return (
    <div className="page">
      <h1 style={{ fontFamily:'Orbitron', fontSize:'2rem', marginBottom:8, background:'var(--gradient)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Explore Creators</h1>
      <p style={{ color:'var(--text-muted)', marginBottom:40 }}>Find talented collaborators in your field</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:24 }}>
        {users.map(u => {
          const color = fieldColors[u.field] || '#94a3b8';
          return (
            <div key={u._id} className="glass" style={{ padding:28, textAlign:'center', transition:'all 0.3s', cursor:'pointer' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.borderColor=color; e.currentTarget.style.boxShadow=`0 20px 40px ${color}33`}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(168,85,247,0.3)'; e.currentTarget.style.boxShadow='none'}}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:`linear-gradient(135deg, ${color}, #06b6d4)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:800, margin:'0 auto 16px', boxShadow:`0 0 20px ${color}55` }}>
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <h3 style={{ fontFamily:'Orbitron', fontSize:'0.9rem', marginBottom:8 }}>{u.name}</h3>
              <span style={{ background:`${color}22`, border:`1px solid ${color}`, color, padding:'3px 12px', borderRadius:20, fontSize:'0.7rem', fontFamily:'Orbitron' }}>
                {fieldIcons[u.field]} {u.field?.replace('-',' ')}
              </span>
              {u.bio && <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginTop:12, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{u.bio}</p>}
              {u.skills?.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginTop:12 }}>
                  {u.skills.slice(0,3).map(s => <span key={s} style={{ background:'rgba(255,255,255,0.05)', padding:'2px 10px', borderRadius:12, fontSize:'0.7rem', color:'var(--text-muted)' }}>{s}</span>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
