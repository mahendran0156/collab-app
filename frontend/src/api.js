import axios from 'axios'  // ← explicit import required

const API_URL = import.meta.env.VITE_API_URL 
  || 'https://collab-backend-98o3.onrender.com'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('collab_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('collab_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
