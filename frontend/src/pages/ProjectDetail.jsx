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
  const [joining,  setJoining]  = useState(false);
  const [message,  setMessage]  = useState('');

  // ── Fetch project ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);
    } catch (err) {
      setError('Project not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Join project ───────────────────────────────────────────────────────────
  const handleJoin = async () => {
    if (!user) { navigate('/login'); return; }
    setJoining(true);
    try {
      const res = await api.post(`/projects/${id}/join`);
      setProject(res.data.project);
      setMessage('Successfully joined project!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to join project');
    } finally {
      setJoining(false);
    }
  };

  // ── Leave project ──────────────────────────────────────────────────────────
  const handleLeave = async () => {
    try {
      await api.post(`/projects/${id}/leave`);
      fetchProject();
      setMessage('Left project successfully');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to leave project');
    }
  };

  // ── Like project ───────────────────────────────────────────────────────────
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
    } catch (err) {
      console.error(err);
    }
  };

  // ── Delete project (owner only) ────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to delete project');
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isOwner        = user && project?.owner?._id === user._id;
  const isCollaborator = user && project?.collaborators?.some(c => c._id === user._id);
  const isLiked        = user && project?.likes?.includes(user._id);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: 'var(--primary)', fontFamily: 'Orbitron' }}>
      Loading project...
    </div>
  );

  if (error || !project) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
      <h3 style={{ fontFamily: 'Orbitron', color: 'var(--text-muted)' }}>{error || 'Project not found'}</h3>
      <button className="btn-primary" onClick={() => navigate('/projects')} style={{ marginTop: 24 }}>
        Back to Projects
      </button>
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 800 }}>

      {/* Message banner */}
      {message && (
        <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: 'var(--primary)' }}>
          {message}
        </div>
      )}

      {/* Header */}
      <div className="glass" style={{ padding: 40, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontFamily: 'Orbitron' }}>
                {project.category}
              </span>
              <span style={{ background: project.status === 'open' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: project.status === 'open' ? '#10b981' : '#f59e0b', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem' }}>
                {project.status}
              </span>
            </div>
            <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', marginBottom: 12, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {project.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              {project.description}
            </p>

            {/* Tags */}
            {project.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {project.tags.map(tag => (
                  <span key={tag} style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '2px 10px', borderRadius: 12, fontSize: '0.75rem' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24, marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
          <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? '#ef4444' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
            ❤️ {project.likes?.length || 0}
          </button>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
            👥 {project.collaborators?.length || 0} / {project.maxCollaborators || 5}
          </span>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
            ⭐ {project.averageRating || 0}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {!isOwner && !isCollaborator && project.status !== 'closed' && (
            <button className="btn-primary" onClick={handleJoin} disabled={joining} style={{ padding: '10px 24px' }}>
              {joining ? 'Joining...' : '+ Join Project'}
            </button>
          )}
          {isCollaborator && (
            <button className="btn-outline" onClick={handleLeave} style={{ padding: '10px 24px' }}>
              Leave Project
            </button>
          )}
          {isOwner && (
            <>
              <button className="btn-outline" onClick={() => navigate(`/projects/${id}/edit`)} style={{ padding: '10px 24px' }}>
                Edit
              </button>
              <button onClick={handleDelete} style={{ padding: '10px 24px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, color: '#f87171', cursor: 'pointer' }}>
                Delete
              </button>
            </>
          )}
          <button className="btn-outline" onClick={() => navigate('/projects')} style={{ padding: '10px 24px' }}>
            ← Back
          </button>
        </div>
      </div>

      {/* Owner info */}
      <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, letterSpacing: 1 }}>
          PROJECT OWNER
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron', fontWeight: 700 }}>
            {project.owner?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{project.owner?.username}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{project.owner?.field}</div>
          </div>
        </div>
      </div>

      {/* Collaborators */}
      {project.collaborators?.length > 0 && (
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, letterSpacing: 1 }}>
            COLLABORATORS ({project.collaborators.length})
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {project.collaborators.map(c => (
              <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: 20 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontFamily: 'Orbitron', fontWeight: 700 }}>
                  {c.username?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: '0.85rem' }}>{c.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}