import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext({})

const API = import.meta.env.VITE_API_URL || 'https://collab-backend-98o3.onrender.com'

// Set token on axios globally
const setAxiosToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(null)
  const [loading, setLoading] = useState(true)

  // On app start — restore token from localStorage and verify it
  useEffect(() => {
    const stored = localStorage.getItem('collab_token')
    if (!stored) { setLoading(false); return }

    setAxiosToken(stored)
    setToken(stored)

    axios.get(`${API}/api/auth/me`)
      .then(res => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('collab_token')
        setAxiosToken(null)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('collab_token', t)
    setAxiosToken(t)
    setToken(t)
    setUser(u)
    return u
  }

  const register = async (formData) => {
    const res = await axios.post(`${API}/api/auth/register`, formData)
    const { token: t, user: u } = res.data
    localStorage.setItem('collab_token', t)
    setAxiosToken(t)
    setToken(t)
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('collab_token')
    setAxiosToken(null)
    setToken(null)
    setUser(null)
  }

  // Called after profile update to sync user in context
  const updateUser = (updatedUser) => setUser(updatedUser)

  // Called after creating/joining projects to refresh user data
  const refreshUser = async () => {
    try {
      const res = await axios.get(`${API}/api/auth/me`)
      setUser(res.data.user)
    } catch (err) {
      console.error('refreshUser failed:', err)
    }
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      updateUser, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export default AuthContext