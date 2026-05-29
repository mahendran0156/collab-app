import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://collab-backend-98o3.onrender.com'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('collab_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

// Handle errors globally — BUT don't redirect on 401 for /auth/me
// because that causes logout loops when token is being checked
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || ''
    const status = err.response?.status

    // Only force logout on 401 for non-auth-check endpoints
    // Never redirect on /auth/me — let the caller handle it
    if (status === 401 && !url.includes('/auth/me') && !url.includes('/auth/login')) {
      localStorage.removeItem('collab_token')
      // Use React Router navigate instead of window.location to avoid full reload
      // We dispatch a custom event that App.jsx listens to
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    return Promise.reject(err)
  }
)

export default api