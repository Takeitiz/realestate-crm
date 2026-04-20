import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProperties } from '../api/properties'
import PropertyCard from '../components/PropertyCard'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, companyName } = useAuth()
  const [stats, setStats] = useState({ total: 0, available: 0, reserved: 0, sold: 0, rented: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [all, available, reserved, sold] = await Promise.all([
        getProperties({ size: 100 }),
        getProperties({ status: 'AVAILABLE', size: 100 }),
        getProperties({ status: 'RESERVED', size: 100 }),
        getProperties({ status: 'SOLD', size: 100 }),
      ])
      setStats({
        total: all.totalElements,
        available: available.totalElements,
        reserved: reserved.totalElements,
        sold: sold.totalElements,
      })
      setRecent(all.content?.slice(0, 6) || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Tổng BĐS', value: stats.total, icon: '🏠', color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)' },
    { label: 'Còn trống', value: stats.available, icon: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Đang giữ', value: stats.reserved, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Đã bán/thuê', value: stats.sold, icon: '🔑', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  ]

  return (
    <div className="animate-fade">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">👋 Xin chào, {user?.fullName?.split(' ').pop()}!</h1>
          <p className="page-subtitle">Tổng quan hệ thống {companyName}</p>
        </div>
        <button id="btn-add-property" className="btn btn-primary" onClick={() => navigate('/properties/new')}>
          + Thêm BĐS mới
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>
                {loading ? '...' : s.value}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Freshness Legend */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">🚦 Trạng thái độ tươi dữ liệu</div>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { color: 'GREEN', label: 'Mới cập nhật (≤ 7 ngày)', desc: 'Có thể giới thiệu ngay' },
            { color: 'YELLOW', label: 'Cần xác nhận (7–30 ngày)', desc: 'Liên hệ chủ trước khi giới thiệu' },
            { color: 'RED', label: 'Dữ liệu cũ (> 30 ngày)', desc: 'Có thể đã được bán/cho thuê' },
          ].map(item => (
            <div key={item.color} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span className={`freshness-dot freshness-${item.color}`} style={{ marginTop: 6 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Properties */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>🕐 BĐS mới nhất</h2>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/properties')}>Xem tất cả →</button>
        </div>
        {loading ? (
          <div className="loading-overlay"><div className="spinner spinner-lg" /></div>
        ) : recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏠</div>
            <div className="empty-state-title">Chưa có bất động sản nào</div>
            <div className="empty-state-desc">Bắt đầu bằng cách thêm BĐS đầu tiên</div>
            <button className="btn btn-primary" onClick={() => navigate('/properties/new')}>+ Thêm BĐS</button>
          </div>
        ) : (
          <div className="property-grid">
            {recent.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
