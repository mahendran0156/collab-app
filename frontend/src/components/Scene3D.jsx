import React, { useMemo } from 'react'

export default function Scene3D({ height = '100vh' }) {
  // Generate stars ONCE - never on re-render
  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    dur: (2 + Math.random() * 4).toFixed(1),
    delay: (Math.random() * 5).toFixed(1),
  })), [])

  // Fixed geometric shapes - no random on render
  const shapes = useMemo(() => [
    { w:70,  h:70,  top:'18%', left:'10%', color:'#a855f7', rot:45,  anim:'fl1', dur:7  },
    { w:45,  h:45,  top:'55%', left:'80%', color:'#06b6d4', rot:0,   anim:'fl2', dur:9,  round:'50%' },
    { w:55,  h:55,  top:'72%', left:'20%', color:'#ec4899', rot:20,  anim:'fl3', dur:11 },
    { w:35,  h:35,  top:'28%', left:'62%', color:'#f59e0b', rot:60,  anim:'fl1', dur:8  },
    { w:80,  h:80,  top:'12%', left:'82%', color:'#a855f7', rot:15,  anim:'fl2', dur:13, op:0.25 },
    { w:40,  h:40,  top:'65%', left:'50%', color:'#06b6d4', rot:30,  anim:'fl3', dur:10 },
  ], [])

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      height, zIndex: 0, overflow: 'hidden',
      background: 'linear-gradient(150deg,#050714 0%,#0a0a2e 55%,#050714 100%)',
    }}>
      <style>{`
        @keyframes twinkle {
          0%,100%{opacity:.1;transform:scale(1)}
          50%{opacity:.9;transform:scale(1.5)}
        }
        @keyframes fl1 {
          0%,100%{transform:translateY(0) rotate(var(--r))}
          50%{transform:translateY(-30px) rotate(calc(var(--r) + 18deg))}
        }
        @keyframes fl2 {
          0%,100%{transform:translateY(0) rotate(var(--r))}
          50%{transform:translateY(25px) rotate(calc(var(--r) - 14deg))}
        }
        @keyframes fl3 {
          0%,100%{transform:translateX(0) rotate(var(--r))}
          50%{transform:translateX(-22px) rotate(calc(var(--r) + 22deg))}
        }
        @keyframes orb1 {
          0%,100%{transform:scale(1);opacity:.2}
          50%{transform:scale(1.18);opacity:.32}
        }
        @keyframes orb2 {
          0%,100%{transform:scale(1) translate(0,0);opacity:.16}
          50%{transform:scale(1.12) translate(18px,-14px);opacity:.26}
        }
        @keyframes orb3 {
          0%,100%{transform:scale(1) translate(0,0);opacity:.14}
          50%{transform:scale(1.1) translate(-16px,18px);opacity:.22}
        }
        @keyframes scan {
          0%{top:-4px} 100%{top:100%}
        }
      `}</style>

      {/* --- GLOW ORBS --- */}
      <div style={{ position:'absolute', width:620, height:620, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(168,85,247,.22) 0%,transparent 68%)',
        left:'-14%', top:'-12%', animation:'orb1 10s ease-in-out infinite', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', width:520, height:520, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(236,72,153,.18) 0%,transparent 68%)',
        right:'-5%', bottom:'5%', animation:'orb2 12s ease-in-out infinite', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', width:440, height:440, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(6,182,212,.15) 0%,transparent 68%)',
        left:'38%', bottom:'12%', animation:'orb3 14s ease-in-out infinite', pointerEvents:'none' }}/>

      {/* --- GRID LINES --- */}
      {Array.from({length:14},(_,i)=>(
        <div key={`h${i}`} style={{ position:'absolute', left:0, right:0, height:1,
          top:`${i*7.3}%`, background:'rgba(168,85,247,.06)', pointerEvents:'none' }}/>
      ))}
      {Array.from({length:11},(_,i)=>(
        <div key={`v${i}`} style={{ position:'absolute', top:0, bottom:0, width:1,
          left:`${i*10}%`, background:'rgba(168,85,247,.04)', pointerEvents:'none' }}/>
      ))}

      {/* --- SCAN LINE --- */}
      <div style={{ position:'absolute', left:0, right:0, height:2,
        background:'linear-gradient(90deg,transparent,rgba(168,85,247,.5),transparent)',
        animation:'scan 7s linear infinite', pointerEvents:'none' }}/>

      {/* --- STARS --- */}
      {stars.map(s => (
        <div key={s.id} style={{
          position:'absolute', borderRadius:'50%', background:'#fff',
          width:s.size, height:s.size, left:`${s.x}%`, top:`${s.y}%`,
          animation:`twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          pointerEvents:'none',
        }}/>
      ))}

      {/* --- FLOATING SHAPES --- */}
      {shapes.map((s,i) => (
        <div key={i} style={{
          position:'absolute', width:s.w, height:s.h,
          border:`1.5px solid ${s.color}`, borderRadius:s.round||4,
          top:s.top, left:s.left,
          '--r': `${s.rot}deg`,
          opacity: s.op ?? 0.45,
          animation:`${s.anim} ${s.dur}s ease-in-out infinite`,
          pointerEvents:'none',
        }}/>
      ))}

      {/* --- VIGNETTE --- */}
      <div style={{ position:'absolute', inset:0,
        background:'radial-gradient(ellipse at center,transparent 45%,rgba(5,7,20,.65) 100%)',
        pointerEvents:'none' }}/>
    </div>
  )
}
