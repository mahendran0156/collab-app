import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext({})

// Vite uses import.meta.env — NOT process.env
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => {
    try { return localStorage.getItem('collab_token') } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    axios.get(`${API}/users/profile`)
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('collab_token')
        delete axios.defaults.headers.common['Authorization']
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, []) // run once on mount only

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('collab_token', t)
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t); setUser(u)
    return u
  }

  const register = async (data) => {
    const res = await axios.post(`${API}/auth/register`, data)
    const { token: t, user: u } = res.data
    localStorage.setItem('collab_token', t)
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t); setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('collab_token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null); setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
