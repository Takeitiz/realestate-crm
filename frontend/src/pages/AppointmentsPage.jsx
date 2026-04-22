import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAppointments, updateAppointmentStatus, deleteAppointment } from '../api/sprint2'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  SCHEDULED:  { label: 'Đã đặt lịch', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  COMPLETED:  { label: 'Đã xem',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  CANCELLED:  { label: 'Đã hủy',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  NO_SHOW:    { label: 'Không đến',   color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
}

const STATUS_TRANSITIONS = {
  SCHEDULED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW:   [],
}

export default function AppointmentsPage() {
  const navigate = useNavigate()
  const { isManager } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try { setAppointments(await getAppointments()) }
    catch { toast.error('Lỗi tải lịch hẹn') }
    finally { setLoading(false) }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await updateAppointmentStatus(id, status)
      setAppointments(prev => prev.map(a => a.id === id ? updated : a))
      toast.success('Đã cập nhật trạng thái')
    } catch { toast.error('Lỗi cập nhật') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa lịch hẹn này?')) return
    try {
      await deleteAppointment(id)
      setAppointments(prev => prev.filter(a => a.id !== id))
      toast.success('Đã xóa')
    } catch { toast.error('Lỗi xóa') }
  }

  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter)

  const upcoming = appointments.filter(a => a.status === 'SCHEDULED' && new Date(a.scheduledAt) >= new Date()).length
  const completed = appointments.filter(a => a.status === 'COMPLETED').length

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">📅 Lịch hẹn xem nhà</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>
            {upcoming} lịch sắp tới · {completed} đã xem
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = appointments.filter(a => a.status === key).length
          return (
            <div key={key} className="card" style={{ textAlign: 'center', cursor: 'pointer', borderColor: filter === key ? cfg.color : undefined }}
              onClick={() => setFilter(filter === key ? 'ALL' : key)}>
              <div style={{ fontSize: 24, fontWeight: 800, color: cfg.color }}>{count}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{cfg.label}</div>
            </div>
          )
        })}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['ALL', ...Object.keys(STATUS_CONFIG)].map(key => (
          <button key={key} onClick={() => setFilter(key)}
            className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-secondary'}`}>
            {key === 'ALL' ? 'Tất cả' : STATUS_CONFIG[key].label}
          </button>
        ))}
      </div>

      {loading
        ? <div className="loading-overlay"><div className="spinner" /></div>
        : filtered.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-title">Không có lịch hẹn</div></div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(a => {
                const cfg = STATUS_CONFIG[a.status]
                const isPast = new Date(a.scheduledAt) < new Date()
                const transitions = STATUS_TRANSITIONS[a.status]
                return (
                  <div key={a.id} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                        {isPast && a.status === 'SCHEDULED' && (
                          <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11,
                            background: 'rgba(249,115,22,0.12)', color: '#f97316' }}>⚠️ Đã qua</span>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, cursor: 'pointer', color: 'var(--color-accent)' }}
                        onClick={() => navigate(`/properties/${a.propertyId}`)}>
                        🏠 {a.propertyTitle}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 2 }}>📍 {a.propertyDistrict}</div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        👤 <strong>{a.buyerName}</strong>
                        {a.buyerPhone && <span style={{ color: 'var(--color-text-muted)' }}> · {a.buyerPhone}</span>}
                      </div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        🗓️ <strong>{new Date(a.scheduledAt).toLocaleString('vi-VN')}</strong>
                      </div>
                      {isManager && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Môi giới: {a.agentName}</div>}
                      {a.notes && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6, fontStyle: 'italic' }}>📝 {a.notes}</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140 }}>
                      {transitions.map(s => (
                        <button key={s} className="btn btn-sm btn-secondary" onClick={() => handleStatusChange(a.id, s)}
                          style={{ fontSize: 12 }}>
                          → {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                      <button className="btn btn-sm" onClick={() => handleDelete(a.id)}
                        style={{ fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: 'none' }}>
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
      }
    </div>
  )
}
