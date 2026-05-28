import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project,  setProject]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [message,  setMessage]  = useState('');
  const [joining,  setJoining]  = useState(false);

  // ── Comment/Review state ──────────────────────────────────────────────────
  const [reviewText,   setReviewText]   = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting,   setSubmitting]   = useState(false);
  const [reviewMsg,    setReviewMsg]    = useState('');

  useEffect(() => { fetchProject(); }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);
    } catch (err) {
      setError('Project not found');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) { navigate('/login'); return; }
    setJoining(true);
    try {
      const res = await api.post(`/projects/${id}/join`);
      setProject(res.data.project);
      setMessage('Successfully joined project!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to join project');
    } finally { setJoining(false); }
  };

  const handleLeave = async () => {
    try {
      await api.post(`/projects/${id}/leave`);
      fetchProject();
      setMessage('Left project successfully');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to leave project');
    }
  };

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await api.post(`/projects/${id}/like`);
      setProject(prev => ({
        ...prev,
        likes: res.data.liked
          ? [...(prev.likes || []), user._id]
          : (prev.likes || []).filter(l => l !== user._id),
      }));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to delete project');
    }
  };

  // ── Submit review/comment ─────────────────────────────────────────────────
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!reviewText.trim()) { setReviewMsg('Please write a comment'); return; }
    setSubmitting(true);
    setReviewMsg('');
    try {
      await api.post(`/projects/${id}/review`, {
        rating:  reviewRating,
        comment: reviewText.trim(),
      });
      setReviewText('');
      setReviewRating(5);
      setReviewMsg('Comment posted!');
      fetchProject(); // refresh to show new comment
    } catch (err) {
      setReviewMsg(err.response?.data?.error || 'Failed to post comment');
    } finally { setSubmitting(false); }
  };

  const isOwner        = user && project?.owner?._id === user._id;
  const isCollaborator = user && project?.collaborators?.some(c => c._id === user._id);
  const isLiked        = user && project?.likes?.includes(user._id);
  const hasReviewed    = user && project?.reviews?.some(r => r.user?._id === user._id);

  if (loading) return (
    <div style={{ textAlign:'center', paddingTop:120, color:'var(--primary)', fontFamily:'Orbitron' }}>
      Loading project...
    </div>
  );

  if (error || !project) return (
    <div style={{ textAlign:'center', paddingTop:120 }}>
      <div style={{ fontSize:'3rem', marginBottom:16 }}>😕</div>
      <h3 style={{ fontFamily:'Orbitron', color:'var(--text-muted)' }}>{error || 'Project not found'}</h3>
      <button className="btn-primary" onClick={() => navigate('/projects')} style={{ marginTop:24 }}>
        Back to Projects
      </button>
    </div>
  );

  return (
    <div style={{ paddingTop:90, paddingBottom:40, paddingLeft:32, paddingRight:32, maxWidth:860, margin:'0 auto' }}>

      {/* Message banner */}
      {message && (
        <div style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.4)', borderRadius:8, padding:'12px 16px', marginBottom:20, color:'var(--primary)' }}>
          {message}
        </div>
      )}

      {/* ── Project header card ── */}
      <div className="glass" style={{ padding:40, marginBottom:24 }}>
        <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
          <span style={{ background:'rgba(99,102,241,0.2)', color:'var(--primary)', padding:'4px 12px', borderRadius:20, fontSize:'0.75rem', fontFamily:'Orbitron' }}>
            {project.category}
          </span>
          <span style={{ background: project.status === 'open' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: project.status === 'open' ? '#10b981' : '#f59e0b', padding:'4px 12px', borderRadius:20, fontSize:'0.75rem' }}>
            {project.status}
          </span>
        </div>

        <h1 style={{ fontFamily:'Orbitron', fontSize:'1.8rem', marginBottom:12, background:'var(--gradient)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          {project.title}
        </h1>
        <p style={{ color:'var(--text-muted)', lineHeight:1.7, marginBottom:16 }}>
          {project.description}
        </p>

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
            {project.tags.map(tag => (
              <span key={tag} style={{ background:'rgba(99,102,241,0.1)', color:'var(--primary)', padding:'2px 10px', borderRadius:12, fontSize:'0.75rem' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{ display:'flex', gap:24, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.05)', flexWrap:'wrap' }}>
          <button onClick={handleLike} style={{ background:'none', border:'none', cursor:'pointer', color: isLiked ? '#ef4444' : 'var(--text-muted)', display:'flex', alignItems:'center', gap:6, fontSize:'0.9rem' }}>
            ❤️ {project.likes?.length || 0}
          </button>
          <span style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>
            👥 {project.collaborators?.length || 0} / {project.maxCollaborators || 5}
          </span>
          <span style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>
            ⭐ {project.averageRating || 0} ({project.reviews?.length || 0} reviews)
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:12, marginTop:20, flexWrap:'wrap' }}>
          {!isOwner && !isCollaborator && project.status !== 'closed' && (
            <button className="btn-primary" onClick={handleJoin} disabled={joining} style={{ padding:'10px 24px' }}>
              {joining ? 'Joining...' : '+ Join Project'}
            </button>
          )}
          {isCollaborator && (
            <button className="btn-outline" onClick={handleLeave} style={{ padding:'10px 24px' }}>
              Leave Project
            </button>
          )}
          {isOwner && (
            <>
              <button className="btn-outline" onClick={() => navigate(`/projects/${id}/edit`)} style={{ padding:'10px 24px' }}>Edit</button>
              <button onClick={handleDelete} style={{ padding:'10px 24px', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:8, color:'#f87171', cursor:'pointer' }}>Delete</button>
            </>
          )}
          <button className="btn-outline" onClick={() => navigate('/projects')} style={{ padding:'10px 24px' }}>← Back</button>
        </div>
      </div>

      {/* ── Owner info ── */}
      <div className="glass" style={{ padding:24, marginBottom:24 }}>
        <h3 style={{ fontFamily:'Orbitron', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:14, letterSpacing:1 }}>
          PROJECT OWNER
        </h3>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background:'var(--gradient)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron', fontWeight:700, color:'#fff' }}>
            {project.owner?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight:600 }}>{project.owner?.username}</div>
            <div style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{project.owner?.field}</div>
          </div>
        </div>
      </div>

      {/* ── Collaborators ── */}
      {project.collaborators?.length > 0 && (
        <div className="glass" style={{ padding:24, marginBottom:24 }}>
          <h3 style={{ fontFamily:'Orbitron', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:14, letterSpacing:1 }}>
            COLLABORATORS ({project.collaborators.length})
          </h3>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {project.collaborators.map(c => (
              <div key={c._id} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.03)', padding:'8px 14px', borderRadius:20 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--gradient)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontFamily:'Orbitron', fontWeight:700, color:'#fff' }}>
                  {c.username?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize:'0.85rem' }}>{c.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Comments & Reviews ── */}
      <div className="glass" style={{ padding:32, marginBottom:24 }}>
        <h3 style={{ fontFamily:'Orbitron', fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:24, letterSpacing:1 }}>
          💬 COMMENTS & REVIEWS ({project.reviews?.length || 0})
        </h3>

        {/* Existing reviews */}
        {project.reviews?.length > 0 ? (
          <div style={{ marginBottom:28 }}>
            {project.reviews.map((r, i) => (
              <div key={i} style={{ padding:16, background:'rgba(255,255,255,0.03)', borderRadius:10, marginBottom:12, borderLeft:'3px solid var(--primary)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--gradient)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron', fontWeight:700, fontSize:'0.8rem', color:'#fff' }}>
                    {r.user?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <span style={{ fontWeight:600, fontSize:'0.9rem' }}>{r.user?.username || 'User'}</span>
                    <span style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginLeft:8 }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Star rating */}
                  <div style={{ marginLeft:'auto', color:'#f59e0b', fontSize:'0.85rem' }}>
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </div>
                </div>
                {r.comment && (
                  <p style={{ color:'var(--text-muted)', fontSize:'0.88rem', lineHeight:1.6, margin:0, paddingLeft:42 }}>
                    {r.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'20px 0 28px', color:'var(--text-muted)', fontSize:'0.88rem' }}>
            No comments yet. Be the first to comment!
          </div>
        )}

        {/* Add comment form */}
        {user ? (
          isOwner ? (
            <div style={{ color:'var(--text-muted)', fontSize:'0.85rem', textAlign:'center', padding:12, background:'rgba(255,255,255,0.03)', borderRadius:8 }}>
              You can't review your own project
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit}>
              <div style={{ fontFamily:'Orbitron', fontSize:'0.72rem', color:'var(--text-muted)', letterSpacing:1, marginBottom:10 }}>
                {hasReviewed ? 'UPDATE YOUR COMMENT' : 'ADD A COMMENT'}
              </div>

              {/* Star rating selector */}
              <div style={{ display:'flex', gap:6, marginBottom:12, alignItems:'center' }}>
                <span style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginRight:4 }}>Rating:</span>
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.3rem', color: star <= reviewRating ? '#f59e0b' : 'rgba(255,255,255,0.2)', padding:'0 2px', transition:'color 0.15s' }}
                  >
                    ★
                  </button>
                ))}
                <span style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginLeft:4 }}>({reviewRating}/5)</span>
              </div>

              {/* Comment textarea */}
              <textarea
                placeholder="Share your thoughts about this project..."
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                rows={3}
                style={{ width:'100%', marginBottom:10, resize:'vertical', minHeight:80, boxSizing:'border-box' }}
              />

              {reviewMsg && (
                <div style={{ color: reviewMsg.includes('posted') ? '#10b981' : '#f87171', fontSize:'0.82rem', marginBottom:10 }}>
                  {reviewMsg}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={submitting} style={{ padding:'10px 28px' }}>
                {submitting ? 'Posting...' : hasReviewed ? 'Update Comment' : 'Post Comment'}
              </button>
            </form>
          )
        ) : (
          <div style={{ textAlign:'center', padding:16, background:'rgba(99,102,241,0.08)', borderRadius:10 }}>
            <span style={{ color:'var(--text-muted)', fontSize:'0.88rem' }}>
              <button onClick={() => navigate('/login')} style={{ background:'none', border:'none', color:'var(--primary)', cursor:'pointer', fontWeight:600, fontSize:'0.88rem' }}>
                Sign in
              </button>
              {' '}to leave a comment
            </span>
          </div>
        )}
      </div>

    </div>
  );
}