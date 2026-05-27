// frontend/src/config.js
// Single source of truth for all environment config

const API_URL = import.meta.env.VITE_API_URL 
  || 'https://collab-backend-98o3.onrender.com'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL 
  || 'https://collab-backend-98o3.onrender.com'

export { API_URL, SOCKET_URL }
export default API_URL
