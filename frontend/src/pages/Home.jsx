import React from 'react'
import { useNavigate } from 'react-router-dom'
import Scene3D from '../components/Scene3D.jsx'

const categories = [
  { icon:'🎨', label:'Design',      value:'design',       color:'#a855f7', desc:'UI/UX, Branding, Illustrations' },
  { icon:'🎵', label:'Music',       value:'music',        color:'#ec4899', desc:'Beats, Mixing, Songwriting' },
  { icon:'📱', label:'Social Media',value:'social-media', color:'#06b6d4', desc:'Content, Campaigns, Growth' },
  { icon:'💻', label:'Development', value:'development',  color:'#f59e0b', desc:'Web, App, Open Source' },
]

const stats = [
  { value:'2,400+', label:'Creators'    },
  { value:'850+',   label:'Projects'    },
  { value:'12K+',   label:'Collabs'     },
  { value:'98%',    label:'Success Rate'},
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:'100vh', overflowX:'hidden', background:'#050714' }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ position:'relative', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Scene3D height="100vh" />

        <div style={{ position:'relative', zIndex:10, textAlign:'center', maxWidth:720, padding:'0 24px' }}>
          <div style={{
            display:'inline-block', padding:'6px 20px', borderRadius:20,
            background:'rgba(168,85,247,0.15)', border:'1px solid rgba(168,85,247,0.4)',
            color:'#a855f7', fontSize:'0.7rem', letterSpacing:2,
            marginBottom:32, fontFamily:'Orbitron,sans-serif',
          }}>✦ WHERE CREATORS UNITE ✦</div>

          <h1 style={{
            fontFamily:'Orbitron,sans-serif',
            fontSize:'clamp(2.2rem,6vw,4.5rem)',
            fontWeight:800, lineHeight:1.1, marginBottom:24,
            background:'linear-gradient(135deg,#ffffff 20%,#a855f7 50%,#ec4899 75%,#06b6d4 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundClip:'text',
          }}>
            BUILD TOGETHER.<br />CREATE MAGIC.
          </h1>

          <p style={{ color:'#94a3b8', fontSize:'1.1rem', lineHeight:1.7, marginBottom:40, fontFamily:'Rajdhani,sans-serif' }}>
            The ultimate platform for designers, musicians, developers, and social media creators
            to find partners, launch projects, and build lasting creative relationships.
          </p>

          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn-primary"
              onClick={() => navigate('/register')}
              style={{ fontSize:'0.9rem', padding:'14px 36px' }}>
              Start Collaborating
            </button>
            <button className="btn-outline"
              onClick={() => navigate('/projects')}
              style={{ fontSize:'0.9rem', padding:'14px 36px' }}>
              Browse Projects
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section style={{
        padding:'60px 40px',
        background:'rgba(168,85,247,0.04)',
        borderTop:'1px solid rgba(168,85,247,0.12)',
        borderBottom:'1px solid rgba(168,85,247,0.12)',
      }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{
                fontFamily:'Orbitron,sans-serif', fontSize:'2rem', fontWeight:800,
                background:'linear-gradient(135deg,#a855f7,#ec4899,#06b6d4)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>{s.value}</div>
              <div style={{ color:'#94a3b8', fontSize:'0.85rem', marginTop:6, letterSpacing:1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      <section style={{ padding:'80px 40px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1.8rem', marginBottom:16, color:'#e2e8f0' }}>
            Collaborate In Any Field
          </h2>
          <p style={{ color:'#94a3b8' }}>From pixel-perfect design to chart-topping music</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:24 }}>
          {categories.map(cat => (
            <div key={cat.value}
              onClick={() => navigate(`/projects?category=${cat.value}`)}
              style={{
                background:'rgba(168,85,247,0.05)',
                border:`1px solid ${cat.color}33`,
                borderRadius:16, padding:32, textAlign:'center', cursor:'pointer',
                transition:'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform='translateY(-8px)'
                e.currentTarget.style.borderColor=cat.color
                e.currentTarget.style.boxShadow=`0 20px 50px ${cat.color}33`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform='translateY(0)'
                e.currentTarget.style.borderColor=`${cat.color}33`
                e.currentTarget.style.boxShadow='none'
              }}
            >
              <div style={{ fontSize:'2.8rem', marginBottom:14 }}>{cat.icon}</div>
              <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.95rem', color:cat.color, marginBottom:8 }}>{cat.label}</h3>
              <p style={{ color:'#94a3b8', fontSize:'0.85rem' }}>{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding:'80px 40px', textAlign:'center' }}>
        <div style={{ maxWidth:580, margin:'0 auto' }}>
          <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1.8rem', marginBottom:16, color:'#e2e8f0' }}>
            Ready to Build Something Amazing?
          </h2>
          <p style={{ color:'#94a3b8', marginBottom:36, lineHeight:1.7 }}>
            Join thousands of creators already collaborating on the platform
          </p>
          <button className="btn-primary"
            onClick={() => navigate('/register')}
            style={{ fontSize:'1rem', padding:'16px 48px' }}>
            Get Started — It's Free
          </button>
        </div>
      </section>

    </div>
  )
}
