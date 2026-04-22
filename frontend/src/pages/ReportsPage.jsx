import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAgentReport, getPropertyReport, exportAgentCsvUrl } from '../api/sprint4'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PERIOD_OPTIONS = [
  { label: '7 ngày', value: 7 },
  { label: '30 ngày', value: 30 },
  { label: '90 ngày', value: 90 },
  { label: '1 năm', value: 365 },
]

export default function ReportsPage() {
  const navigate = useNavigate()
  const { isManager } = useAuth()
  const [tab, setTab] = useState('agents')
  const [days, setDays] = useState(30)
  const [agentData, setAgentData] = useState([])
  const [propData, setPropData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sortCol, setSortCol] = useState('closedDeals')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => { loadAll() }, [days])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [a, p] = await Promise.all([
        isManager() ? getAgentReport(days) : Promise.resolve([]),
        getPropertyReport()
      ])
      setAgentData(a || [])
      setPropData(p)
    } catch (e) {
      if (e.response?.status === 403) toast.error('Chỉ Manager được xem báo cáo này')
      else toast.error('Lỗi tải báo cáo')
    }
    finally { setLoading(false) }
  }

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const sorted = [...agentData].sort((a, b) => {
    const av = Number(a[sortCol]) || 0, bv = Number(b[sortCol]) || 0
    return sortDir === 'asc' ? av - bv : bv - av
  })

  const maxClosed = Math.max(...agentData.map(r => Number(r.closedDeals)), 1)

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Báo cáo & Phân tích</h1>
          <p className="page-subtitle">Hiệu suất hoạt động của đội ngũ môi giới</p>
        </div>
        {isManager() && (
          <a href={exportAgentCsvUrl(days)}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            ⬇️ Xuất CSV
          </a>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 0 }}>
        {[
          { id: 'agents', label: '👤 Hiệu suất MG' },
          { id: 'properties', label: '🏠 Sức khoẻ BĐS' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px',
              fontSize: 13, fontWeight: 600,
              color: tab === t.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
              borderBottom: tab === t.id ? '2px solid var(--color-accent)' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s'
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading
        ? <div className="loading-overlay"><div className="spinner spinner-lg" /></div>
        : <>
          {/* ─── TAB: AGENTS ─── */}
          {tab === 'agents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Summary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  {
                    label: 'Tổng môi giới', value: agentData.length,
                    icon: '👥', color: '#6366f1', bg: 'rgba(99,102,241,0.08)'
                  },
                  {
                    label: 'BĐS trong kỳ', value: agentData.reduce((s, r) => s + Number(r.propertiesInPeriod), 0),
                    icon: '🏠', color: '#2dd4bf', bg: 'rgba(45,212,191,0.08)'
                  },
                  {
                    label: 'Lịch hẹn hoàn thành', value: agentData.reduce((s, r) => s + Number(r.completedAppointments), 0),
                    icon: '📅', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'
                  },
                  {
                    label: 'Deal đã chốt', value: agentData.reduce((s, r) => s + Number(r.closedDeals), 0),
                    icon: '🎉', color: '#22c55e', bg: 'rgba(34,197,94,0.08)'
                  },
                ].map(c => (
                  <div key={c.label} className="card" style={{ textAlign: 'center', background: c.bg, border: `1px solid ${c.color}33` }}>
                    <div style={{ fontSize: 24 }}>{c.icon}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: c.color, lineHeight: 1.1 }}>{c.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Period selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Kỳ báo cáo:</span>
                {PERIOD_OPTIONS.map(o => (
                  <button key={o.value}
                    className={`btn btn-sm ${days === o.value ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setDays(o.value)}>
                    {o.label}
                  </button>
                ))}
              </div>

              {/* Visual bar chart */}
              {agentData.length > 0 && (
                <div className="card">
                  <div className="card-header"><div className="card-title">🏆 Deals đã chốt theo MG</div></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sorted.slice(0, 8).map((r, i) => (
                      <div key={r.agentId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: i < 3 ? ['#f59e0b', '#9ca3af', '#b45309'][i] : 'var(--color-bg-secondary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 12, color: i < 3 ? 'white' : 'var(--color-text-muted)' }}>
                          {i + 1}
                        </div>
                        <div style={{ width: 130, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{r.agentName}</div>
                        <div style={{ flex: 1, background: 'var(--color-bg-secondary)', borderRadius: 4, height: 22, overflow: 'hidden' }}>
                          <div style={{
                            width: `${(Number(r.closedDeals) / maxClosed) * 100}%`,
                            minWidth: Number(r.closedDeals) > 0 ? 30 : 0,
                            height: '100%',
                            background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                            borderRadius: 4,
                            display: 'flex', alignItems: 'center', paddingLeft: 8, transition: 'width 0.6s'
                          }}>
                            {Number(r.closedDeals) > 0 && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{r.closedDeals}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', width: 40, textAlign: 'right' }}>{r.closeRate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data table */}
              <div className="card" style={{ overflow: 'auto' }}>
                <div className="card-header"><div className="card-title">📋 Chi tiết hiệu suất</div></div>
                {agentData.length === 0
                  ? <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>Chưa có dữ liệu</div>
                  : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                          {[
                            { key: 'agentName', label: 'Tên MG' },
                            { key: 'totalProperties', label: 'Tổng BĐS' },
                            { key: 'propertiesInPeriod', label: 'BĐS kỳ này' },
                            { key: 'totalAppointments', label: 'Lịch hẹn' },
                            { key: 'completedAppointments', label: 'Hẹn xong' },
                            { key: 'totalDeals', label: 'Tổng deal' },
                            { key: 'closedDeals', label: 'Đã chốt' },
                            { key: 'closeRate', label: 'Tỷ lệ' },
                            { key: 'activityCount', label: 'Hoạt động' },
                          ].map(col => (
                            <th key={col.key}
                              style={{ padding: '8px 12px', textAlign: 'left', cursor: 'pointer',
                                color: sortCol === col.key ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                fontWeight: 600, whiteSpace: 'nowrap', userSelect: 'none' }}
                              onClick={() => handleSort(col.key)}>
                              {col.label} {sortCol === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map((r, i) => (
                          <tr key={r.agentId}
                            style={{ borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'var(--color-bg-secondary)' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                              {i < 3 && <span style={{ marginRight: 4 }}>{['🥇','🥈','🥉'][i]}</span>}
                              {r.agentName}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>{r.totalProperties}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <span style={{ color: '#2dd4bf', fontWeight: 600 }}>{r.propertiesInPeriod}</span>
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>{r.totalAppointments}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', color: '#f59e0b', fontWeight: 600 }}>{r.completedAppointments}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>{r.totalDeals}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', color: '#22c55e', fontWeight: 700 }}>{r.closedDeals}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>{r.closeRate}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--color-text-muted)' }}>{r.activityCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                }
              </div>
            </div>
          )}

          {/* ─── TAB: PROPERTIES ─── */}
          {tab === 'properties' && propData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Stale properties */}
              <div className="card">
                <div className="card-header" style={{ justifyContent: 'space-between' }}>
                  <div className="card-title">⚠️ BĐS chưa cập nhật ({propData.staleCount} BĐS hơn 30 ngày)</div>
                </div>
                {propData.staleProperties.length === 0
                  ? <div style={{ textAlign: 'center', padding: 24, color: '#22c55e', fontSize: 14 }}>✅ Tất cả BĐS đều được cập nhật trong 30 ngày!</div>
                  : (
                    <div style={{ overflow: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600 }}>BĐS</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600 }}>Quận</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600 }}>MG</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 600 }}>Không cập nhật</th>
                            <th style={{ padding: '8px 12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {propData.staleProperties.map((p, i) => {
                            const urgency = p.daysSinceUpdate > 60 ? '#ef4444' : p.daysSinceUpdate > 30 ? '#f97316' : '#f59e0b'
                            return (
                              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                                onClick={() => navigate(`/properties/${p.id}`)}>
                                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--color-accent)' }}>🏠 {p.title}</td>
                                <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>📍 {p.district}</td>
                                <td style={{ padding: '8px 12px' }}>{p.agentName}</td>
                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                  <span style={{ color: urgency, fontWeight: 700 }}>{p.daysSinceUpdate} ngày</span>
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20,
                                    background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
                                    {p.status}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </div>

              {/* Price changes */}
              <div className="card">
                <div className="card-header"><div className="card-title">💰 Lịch sử thay đổi giá (30 ngày)</div></div>
                {propData.priceChanges.length === 0
                  ? <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)', fontSize: 13 }}>Chưa có thay đổi giá nào</div>
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {propData.priceChanges.map((h, i) => {
                        const increased = Number(h.newPrice) > Number(h.oldPrice)
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                            borderBottom: i < propData.priceChanges.length - 1 ? '1px solid var(--color-border)' : 'none',
                            cursor: 'pointer' }}
                            onClick={() => navigate(`/properties/${h.propertyId}`)}>
                            <div style={{ fontSize: 18 }}>{increased ? '📈' : '📉'}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent)' }}>{h.propertyTitle}</div>
                              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                                <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>{h.oldPrice} {h.priceUnit}</span>
                                {' → '}
                                <span style={{ color: increased ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{h.newPrice} {h.priceUnit}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--color-text-muted)' }}>
                              <div>{h.changedBy}</div>
                              <div>{new Date(h.changedAt).toLocaleDateString('vi-VN')}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                }
              </div>
            </div>
          )}
        </>
      }
    </div>
  )
}
