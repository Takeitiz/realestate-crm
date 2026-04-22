import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProperties } from '../api/properties'
import { getDashboardStats } from '../api/sprint3'
import PropertyCard from '../components/PropertyCard'
import { useAuth } from '../context/AuthContext'

const STAGE_LABELS = {
  NEW: 'Mới', VIEWED: 'Đã xem', NEGOTIATING: 'Thương lượng',
  DEPOSIT: 'Đặt cọc', CLOSED: 'Chốt', CANCELLED: 'Hủy'
}
const STAGE_COLORS = {
  NEW: '#6366f1', VIEWED: '#3b82f6', NEGOTIATING: '#f59e0b',
  DEPOSIT: '#f97316', CLOSED: '#22c55e', CANCELLED: '#6b7280'
}
const STAGES_ORDER = ['NEW', 'VIEWED', 'NEGOTIATING', 'DEPOSIT', 'CLOSED', 'CANCELLED']

// Simple inline sparkline with SVG
function Sparkline({ data, color = '#2dd4bf' }) {
  if (!data || data.length < 2) return null
  const values = Object.values(data)
  const max = Math.max(...values, 1)
  const w = 200, h = 50, pad = 4
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2)
    const y = h - pad - (v / max) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <polygon points={`${pad},${h - pad} ${pts} ${w - pad},${h - pad}`}
        fill={color} opacity={0.12} />
    </svg>
  )
}

// Simple donut chart
function DonutChart({ slices, size = 120 }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1
  let offset = 0
  const r = 40, cx = size / 2, cy = size / 2
  const circumference = 2 * Math.PI * r
  return (
    <svg width={size} height={size}>
      {slices.map((s, i) => {
        const frac = s.value / total
        const dash = frac * circumference
        const gap = circumference - dash
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={s.color} strokeWidth={14}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circumference}
            style={{ transition: 'stroke-dasharray 0.5s' }} />
        )
        offset += frac
        return el
      })}
      <circle cx={cx} cy={cy} r={28} fill="var(--color-bg-primary)" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--color-text-primary)">{total}</text>
    </svg>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, companyName, isManager } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [s, all] = await Promise.all([getDashboardStats(), getProperties({ size: 6, sort: 'createdAt,desc' })])
      setStats(s)
      setRecent(all.content || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>

  const propertySlices = stats ? [
    { label: 'Còn trống', value: Number(stats.available), color: '#22c55e' },
    { label: 'Đang giữ',  value: Number(stats.reserved),  color: '#f59e0b' },
    { label: 'Đã bán/thuê', value: Number(stats.sold),    color: '#ef4444' },
  ] : []

  const dealStageData = stats?.dealsByStage || {}

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

      {/* ── Row 1: KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Tổng BĐS',       value: stats?.total,               icon: '🏠', color: '#2dd4bf', bg: 'rgba(45,212,191,0.08)' },
          { label: 'Còn trống',      value: stats?.available,           icon: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
          { label: 'Đang giữ',       value: stats?.reserved,            icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
          { label: 'Đã bán/thuê',    value: stats?.sold,                icon: '🔑', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
          { label: 'Chưa cập nhật',  value: stats?.stale,               icon: '⚠️', color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
        ].map(c => (
          <div key={c.label} className="card" style={{ textAlign: 'center', background: c.bg, border: `1px solid ${c.color}33` }}>
            <div style={{ fontSize: 28 }}>{c.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: c.color, lineHeight: 1.1 }}>{c.value ?? '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Property status donut */}
        <div className="card">
          <div className="card-header"><div className="card-title">🥧 Trạng thái BĐS</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <DonutChart slices={propertySlices} size={120} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {propertySlices.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{s.label}: </span>
                    <strong style={{ color: s.color }}>{s.value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7-day activity sparkline */}
        <div className="card">
          <div className="card-header"><div className="card-title">📈 Hoạt động 7 ngày qua</div></div>
          {stats?.dailyActivity && (
            <>
              <Sparkline data={stats.dailyActivity} color="#2dd4bf" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {Object.entries(stats.dailyActivity).map(([day, cnt]) => (
                  <div key={day} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)' }}>{cnt}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{new Date(day).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>
            📅 {stats?.upcomingAppointments || 0} lịch hẹn trong 7 ngày tới
          </div>
        </div>
      </div>

      {/* ── Row 3: Deal Pipeline + Leaderboard ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isManager() ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 24 }}>

        {/* Deal pipeline bar */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div className="card-title">🔄 Deal Pipeline</div>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/deals')}>Xem tất cả →</button>
          </div>
          {Object.keys(dealStageData).length === 0
            ? <div style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: 24 }}>Chưa có deal nào</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STAGES_ORDER.map(stage => {
                  const cnt = dealStageData[stage] || 0
                  const maxVal = Math.max(...Object.values(dealStageData).map(Number), 1)
                  const pct = (cnt / maxVal) * 100
                  return (
                    <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 90, fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'right', flexShrink: 0 }}>{STAGE_LABELS[stage]}</div>
                      <div style={{ flex: 1, background: 'var(--color-bg-secondary)', borderRadius: 4, height: 20, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: STAGE_COLORS[stage], borderRadius: 4, transition: 'width 0.5s', display: 'flex', alignItems: 'center', paddingLeft: 6 }}>
                          {cnt > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{cnt}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
          }
        </div>

        {/* Agent leaderboard (manager only) */}
        {isManager() && (
          <div className="card">
            <div className="card-header"><div className="card-title">🏆 Bảng xếp hạng MG</div></div>
            {!stats?.leaderboard?.length
              ? <div style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: 24 }}>Chưa có dữ liệu</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stats.leaderboard.slice(0, 5).map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
                      borderBottom: i < Math.min(stats.leaderboard.length, 5) - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? ['#f59e0b','#9ca3af','#b45309'][i] : 'var(--color-bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800,
                        color: i < 3 ? 'white' : 'var(--color-text-muted)', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{row.agentName}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{row.totalDeals} deals · {row.closedDeals} chốt</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#22c55e' }}>{row.closedDeals}</div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
      </div>

      {/* ── Row 4: Recent Properties ── */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div className="card-title">🆕 BĐS mới nhất</div>
          <button className="btn btn-sm btn-ghost" onClick={() => navigate('/properties')}>Xem tất cả →</button>
        </div>
        {recent.length > 0
          ? <div className="property-grid">
              {recent.map(p => <PropertyCard key={p.id} property={p} onClick={() => navigate(`/properties/${p.id}`)} />)}
            </div>
          : <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)' }}>Chưa có BĐS nào</div>
        }
      </div>
    </div>
  )
}
