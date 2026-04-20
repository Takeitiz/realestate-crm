import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, companyName, companyTagline } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) return toast.error('Vui lòng nhập đầy đủ thông tin')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sai tên đăng nhập hoặc mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card animate-fade">
        <div className="login-header">
          <div className="login-logo">🏡</div>
          <h1 className="login-title">{companyName || 'BĐS CRM'}</h1>
          <p className="login-subtitle">{companyTagline || 'Hệ thống quản lý bất động sản nội bộ'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Tên đăng nhập</label>
            <input id="login-username" className="form-control" type="text"
              placeholder="Nhập tên đăng nhập..." value={username}
              onChange={e => setUsername(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Mật khẩu</label>
            <input id="login-password" className="form-control" type="password"
              placeholder="Nhập mật khẩu..." value={password}
              onChange={e => setPassword(e.target.value)} />
          </div>

          <button id="login-submit" className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Đang đăng nhập...</> : '🔐 Đăng nhập'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--color-text-muted)' }}>
          <div style={{ marginBottom: 4, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Tài khoản demo:</div>
          <div>👑 Quản lý: <strong style={{ color: 'var(--color-text-primary)' }}>admin / password</strong></div>
          <div>🤝 Môi giới: <strong style={{ color: 'var(--color-text-primary)' }}>agent1 / password</strong></div>
        </div>
      </div>
    </div>
  )
}
