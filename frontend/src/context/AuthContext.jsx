import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext({})

const API = import.meta.env.VITE_API_URL || 'https://collab-backend-98o3.onrender.com'

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => {
    try { return localStorage.getItem('collab_token') } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    axios.get(`${API}/api/users/profile`)
      .then(res => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('collab_token')
        delete axios.defaults.headers.common['Authorization']
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('collab_token', t)
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t); setUser(u)
    return u
  }

  const register = async (formData) => {
    const res = await axios.post(`${API}/api/auth/register`, formData)
    const { token: t, user: u } = res.data
    localStorage.setItem('collab_token', t)
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t); setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('collab_token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  const updateUser = (updatedUser) => setUser(updatedUser)

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export default AuthContext
