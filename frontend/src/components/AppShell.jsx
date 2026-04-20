import React, { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { countUnread, getNotifications, markRead, markAllRead } from '../api/crm'
import { formatDistanceToNow } from '../utils/format'

export default function AppShell() {
  const { user, logout, companyName, companyTagline } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    loadUnread()
    const interval = setInterval(loadUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const loadUnread = () => {
    countUnread().then(d => setUnread(d.count)).catch(() => {})
  }

  const openNotifications = () => {
    if (!notifOpen) {
      getNotifications().then(d => setNotifications(d.slice(0, 15))).catch(() => {})
    }
    setNotifOpen(v => !v)
  }

  const handleMarkRead = async (id) => {
    await markRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  const handleMarkAllRead = async () => {
    await markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnread(0)
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const navItems = [
    { to: '/', icon: '📊', label: 'Tổng quan', end: true },
    { to: '/properties', icon: '🏠', label: 'Bất động sản' },
    { to: '/buyers', icon: '👥', label: 'Khách hàng' },
    { to: '/search', icon: '🔍', label: 'Tìm kiếm AI' },
    { to: '/pitch', icon: '✉️', label: 'Tạo tin Zalo' },
  ]

  return (
    <div className="app-shell">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🏡</div>
          <div>
            <div className="logo-text">{companyName}</div>
            {companyTagline && <div className="logo-sub">{companyTagline}</div>}
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-label">Chính</div>
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-section" style={{ marginTop: 'auto' }}>
            <div className="nav-section-label">Tài khoản</div>
            <div style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{user?.fullName}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-accent)', marginTop: 2 }}>
                {user?.role === 'MANAGER' ? '👑 Quản lý' : '🤝 Môi giới'}
              </div>
            </div>
            <button className="nav-link" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>Đăng xuất
            </button>
          </div>
        </nav>
      </aside>

      <div className="main-content">
        <header className="navbar">
          <div className="navbar-left">
            <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(v => !v)}
              style={{ display: 'none' }} id="menu-toggle">☰</button>
          </div>
          <div className="navbar-right">
            {/* Notification Bell */}
            <div className="notif-bell" ref={notifRef} onClick={openNotifications}>
              <button className="btn btn-ghost btn-icon" style={{ fontSize: 18, position: 'relative' }}>
                🔔
                {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
              </button>
              {notifOpen && (
                <div className="notif-dropdown">
                  <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>Thông báo</span>
                    {unread > 0 && (
                      <button className="btn btn-ghost" style={{ fontSize: 12, padding: '2px 8px' }} onClick={(e) => { e.stopPropagation(); handleMarkAllRead() }}>
                        Đọc tất cả
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="empty-state" style={{ padding: '24px' }}>
                      <div className="empty-state-icon">🔔</div>
                      <div className="empty-state-desc">Chưa có thông báo</div>
                    </div>
                  ) : notifications.map(n => (
                    <div key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                      onClick={(e) => { e.stopPropagation(); if (!n.isRead) handleMarkRead(n.id); if (n.propertyId) navigate(`/properties/${n.propertyId}`); setNotifOpen(false) }}>
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-time">{formatDistanceToNow(n.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User avatar */}
            <div className="user-avatar" title={user?.fullName}>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
