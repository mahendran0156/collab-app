import React, { useState } from 'react';

const categoryColors = {
  design: { bg: 'rgba(168,85,247,0.15)', border: '#a855f7', color: '#a855f7', icon: '🎨' },
  music: { bg: 'rgba(236,72,153,0.15)', border: '#ec4899', color: '#ec4899', icon: '🎵' },
  'social-media': { bg: 'rgba(6,182,212,0.15)', border: '#06b6d4', color: '#06b6d4', icon: '📱' },
  development: { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', color: '#f59e0b', icon: '💻' },
  other: { bg: 'rgba(148,163,184,0.15)', border: '#94a3b8', color: '#94a3b8', icon: '✨' }
};

export default function ProjectCard({ project, onClick }) {
  const [hovered, setHovered] = useState(false);
  const cat = categoryColors[project.category] || categoryColors.other;

  return (
    <div
      onClick={() => onClick && onClick(project._id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `rgba(168,85,247,0.12)` : 'rgba(168,85,247,0.05)',
        border: `1px solid ${hovered ? cat.border : 'rgba(168,85,247,0.2)'}`,
        borderRadius: 16, padding: 24, cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 20px 60px ${cat.border}33` : '0 4px 20px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden'
      }}
    >
      {hovered && <div style={{
        position:'absolute', top:0, left:0, right:0, height:2,
        background: `linear-gradient(90deg, transparent, ${cat.border}, transparent)`,
        animation: 'shimmer 1.5s infinite'
      }} />}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
        <span style={{
          background: cat.bg, border: `1px solid ${cat.border}`, color: cat.color,
          padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem',
          fontFamily: 'Orbitron', letterSpacing: '0.5px'
        }}>{cat.icon} {project.category}</span>
        <span style={{
          background: project.status === 'open' ? 'rgba(34,197,94,0.2)' : project.status === 'in-progress' ? 'rgba(245,158,11,0.2)' : 'rgba(148,163,184,0.2)',
          color: project.status === 'open' ? '#22c55e' : project.status === 'in-progress' ? '#f59e0b' : '#94a3b8',
          padding: '4px 10px', borderRadius: 20, fontSize: '0.7rem', fontFamily: 'Orbitron'
        }}>{project.status}</span>
      </div>

      <h3 style={{fontFamily:'Orbitron', fontSize:'1rem', fontWeight:700, marginBottom:8, color:'var(--text)',
        background: hovered ? `linear-gradient(135deg, ${cat.color}, #e2e8f0)` : 'none',
        WebkitBackgroundClip: hovered ? 'text' : 'unset',
        WebkitTextFillColor: hovered ? 'transparent' : 'var(--text)'
      }}>{project.title}</h3>
      <p style={{color:'var(--text-muted)', fontSize:'0.88rem', lineHeight:1.5, marginBottom:16,
        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'
      }}>{project.description}</p>

      <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:16}}>
        {project.tags?.slice(0,3).map(tag => (
          <span key={tag} style={{background:'rgba(255,255,255,0.05)', padding:'2px 10px', borderRadius:12, fontSize:'0.72rem', color:'var(--text-muted)', border:'1px solid rgba(255,255,255,0.08)'}}>#{tag}</span>
        ))}
      </div>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg, ${cat.border}, #06b6d4)`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700}}>
            {project.owner?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{fontSize:'0.82rem', color:'var(--text-muted)'}}>{project.owner?.name}</span>
        </div>
        <div style={{display:'flex', gap:12, fontSize:'0.8rem', color:'var(--text-muted)'}}>
          <span>❤️ {project.likes?.length || 0}</span>
          <span>👥 {project.collaborators?.length || 0}</span>
          <span>⭐ {project.reviews?.length || 0}</span>
        </div>
      </div>
    </div>
  );
}
