// src/api.js  (or src/utils/api.js)
// Drop this into your frontend/src/ folder
// Replaces any existing axios config

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'https://collab-backend-chdh.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── REQUEST INTERCEPTOR: attach JWT automatically ─────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login — adjust path if needed
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── TYPED API METHODS ────────────────────────────────────────────────────────

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Projects
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  join: (id) => api.post(`/projects/${id}/join`),
  leave: (id) => api.post(`/projects/${id}/leave`),
  like: (id) => api.post(`/projects/${id}/like`),
  review: (id, data) => api.post(`/projects/${id}/review`, data),
};

// Users
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getOne: (id) => api.get(`/users/${id}`),
};

// Messages
export const messagesAPI = {
  getHistory: (projectId, params) => api.get(`/messages/${projectId}`, { params }),
  send: (projectId, content) => api.post(`/messages/${projectId}`, { content }),
  delete: (id) => api.delete(`/messages/${id}`),
};

export default api;
