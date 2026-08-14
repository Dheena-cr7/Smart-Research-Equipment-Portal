import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const storedRole = localStorage.getItem('role')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setRole(storedRole)
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials)
    const { token: t, user: u, role: r } = res.data
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    localStorage.setItem('role', r)
    setToken(t)
    setUser(u)
    setRole(r)
    return res.data
  }, [])

  const register = useCallback(async (data) => {
    const res = await authService.register(data)
    const { token: t, user: u, role: r } = res.data
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    localStorage.setItem('role', r)
    setToken(t)
    setUser(u)
    setRole(r)
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    setToken(null)
    setUser(null)
    setRole(null)
  }, [])

  const isAuthenticated = Boolean(token && user)

  return (
    <AuthContext.Provider value={{ user, token, role, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
