import React, { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, getPublicConfig } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('BĐS CRM')
  const [companyTagline, setCompanyTagline] = useState('')
  const [aiProvider, setAiProvider] = useState('mock')

  useEffect(() => {
    // Load public config
    getPublicConfig()
      .then(d => {
        setCompanyName(d.companyName || 'BĐS CRM')
        setCompanyTagline(d.companyTagline || '')
        setAiProvider(d.aiProvider || 'mock')
      })
      .catch(() => {})

    // Restore session
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try { setUser(JSON.parse(savedUser)) } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const data = await apiLogin(username, password)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({ username: data.username, fullName: data.fullName, role: data.role }))
    setUser({ username: data.username, fullName: data.fullName, role: data.role })
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isManager = () => user?.role === 'MANAGER'
  const isAgent = () => user?.role === 'AGENT'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isManager, isAgent, companyName, companyTagline, aiProvider }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
