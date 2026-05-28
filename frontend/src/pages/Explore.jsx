import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const fields = ['all', 'developer', 'designer', 'musician', 'social-media', 'other'];

export default function Explore() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [field,    setField]    = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [field]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (field  !== 'all') params.field  = field;
      if (search)            params.search = search;

      const res = await api.get('/users', { params });
      // backend returns { users: [...], pagination: {...} }
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Field → emoji map
  const fieldEmoji = {
    developer:    '💻',
    designer:     '🎨',
    musician:     '🎵',
    'social-media': '📱',
    other:        '✨',
  };

  return (
    <div className="page">

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: '2rem', marginBottom: 8, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Explore Creators
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Find talented collaborators in your field</p>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name, skill, bio..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchUsers()}
          style={{ flex: '1', minWidth: 200 }}
        />
        <select
          value={field}
          onChange={e => setField(e.target.value)}
          style={{ width: 'auto', minWidth: 160 }}
        >
          {fields.map(f => (
            <option key={f} value={f}>
              {f === 'all' ? 'All Fields' : f.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
        <button
          className="btn-primary"
          onClick={fetchUsers}
          style={{ padding: '12px 24px', fontSize: '0.8rem' }}
        >
          Search
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--primary)', fontFamily: 'Orbitron', padding: 60 }}>
          Loading creators...
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>👥</div>
          <h3 style={{ fontFamily: 'Orbitron', color: 'var(--text-muted)' }}>No creators found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Try a different search or field filter</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {users.map(u => (
            <div
              key={u._id}
              className="glass"
              onClick={() => navigate(`/users/${u._id}`)}
              style={{ padding: 28, cursor: 'pointer', transition: 'transform 0.2s', borderRadius: 16 }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'var(--gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Orbitron', fontWeight: 700, fontSize: '1.2rem', color: '#fff',
                  flexShrink: 0,
                }}>
                  {u.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>
                    {u.username}
                  </div>
                  <div style={{ color: 'var(--primary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {fieldEmoji[u.field] || '✨'}
                    {u.field?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Creator'}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {u.bio && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 16,
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {u.bio}
                </p>
              )}

              {/* Skills */}
              {u.skills?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {u.skills.slice(0, 4).map(skill => (
                    <span key={skill} style={{
                      background: 'rgba(99,102,241,0.15)', color: 'var(--primary)',
                      padding: '2px 10px', borderRadius: 12, fontSize: '0.72rem',
                    }}>
                      {skill}
                    </span>
                  ))}
                  {u.skills.length > 4 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', padding: '2px 4px' }}>
                      +{u.skills.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  📁 {u.projectsOwned?.length || 0} projects
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  🤝 {u.projectsJoined?.length || 0} collabs
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}