import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDeals, createDeal, moveDealStage, deleteDeal, getBuyers } from '../api/sprint3'
import { getProperties } from '../api/properties'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STAGES = [
  { id: 'NEW',         label: 'Mới',               color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  { id: 'VIEWED',      label: 'Đã xem',            color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  { id: 'NEGOTIATING', label: 'Thương lượng',       color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { id: 'DEPOSIT',     label: 'Đặt cọc',            color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  { id: 'CLOSED',      label: '🎉 Chốt',            color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  { id: 'CANCELLED',   label: 'Hủy',               color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
]

export default function DealsPage() {
  const navigate = useNavigate()
  const { isManager } = useAuth()
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [properties, setProperties] = useState([])
  const [buyers, setBuyers] = useState([])
  const [form, setForm] = useState({ propertyId: '', buyerId: '', expectedPrice: '', priceUnit: 'tỷ', notes: '' })
  const [creating, setCreating] = useState(false)
  const dragDeal = useRef(null)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [d, p, b] = await Promise.all([getDeals(), getProperties({ size: 200 }), getBuyers()])
      setDeals(d)
      setProperties(p.content || [])
      setBuyers(Array.isArray(b) ? b : b.content || [])
    } catch { toast.error('Lỗi tải dữ liệu') }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!form.propertyId || !form.buyerId) return toast.error('Chọn BĐS và khách hàng')
    setCreating(true)
    try {
      const d = await createDeal(form)
      setDeals(prev => [d, ...prev])
      setShowNew(false)
      setForm({ propertyId: '', buyerId: '', expectedPrice: '', priceUnit: 'tỷ', notes: '' })
      toast.success('Đã tạo deal mới!')
    } catch { toast.error('Lỗi tạo deal') }
    finally { setCreating(false) }
  }

  const handleDragStart = (e, deal) => {
    dragDeal.current = deal
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetStage) => {
    e.preventDefault()
    const deal = dragDeal.current
    if (!deal || deal.stage === targetStage) return
    try {
      const updated = await moveDealStage(deal.id, targetStage)
      setDeals(prev => prev.map(d => d.id === deal.id ? updated : d))
      toast.success(`Đã chuyển sang: ${STAGES.find(s => s.id === targetStage)?.label}`)
    } catch { toast.error('Lỗi di chuyển') }
    dragDeal.current = null
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa deal này?')) return
    try {
      await deleteDeal(id)
      setDeals(prev => prev.filter(d => d.id !== id))
      toast.success('Đã xóa')
    } catch { toast.error('Lỗi xóa') }
  }

  const totalPipeline = deals.filter(d => !['CANCELLED'].includes(d.stage)).length
  const closedDeals = deals.filter(d => d.stage === 'CLOSED').length

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 className="page-title">🔄 Deal Pipeline</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>
            {totalPipeline} deals đang hoạt động · {closedDeals} đã chốt
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Tạo Deal</button>
      </div>

      {/* New Deal Modal */}
      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 480, maxHeight: '90vh', overflow: 'auto' }}>
            <div className="card-header">
              <div className="card-title">🤝 Tạo Deal mới</div>
              <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--color-text-muted)' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">BĐS *</label>
                <select className="form-control" value={form.propertyId} onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))}>
                  <option value="">Chọn BĐS...</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} — {p.district}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Khách hàng *</label>
                <select className="form-control" value={form.buyerId} onChange={e => setForm(f => ({ ...f, buyerId: e.target.value }))}>
                  <option value="">Chọn khách...</option>
                  {buyers.map(b => (
                    <option key={b.id} value={b.id}>{b.buyerName} {b.buyerPhone ? `(${b.buyerPhone})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Giá dự kiến</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-control" type="number" step="0.01" placeholder="2.5"
                    value={form.expectedPrice} onChange={e => setForm(f => ({ ...f, expectedPrice: e.target.value }))} style={{ flex: 1 }} />
                  <select className="form-control" style={{ width: 120 }} value={form.priceUnit} onChange={e => setForm(f => ({ ...f, priceUnit: e.target.value }))}>
                    <option value="tỷ">tỷ</option>
                    <option value="triệu">triệu</option>
                    <option value="triệu/tháng">triệu/tháng</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={handleCreate} disabled={creating || !form.propertyId || !form.buyerId}>
                  {creating ? 'Đang tạo...' : '✅ Tạo deal'}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading
        ? <div className="loading-overlay"><div className="spinner" /></div>
        : (
          /* Kanban Board */
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${STAGES.length}, minmax(220px, 1fr))`,
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 16
          }}>
            {STAGES.map(stage => {
              const colDeals = deals.filter(d => d.stage === stage.id)
              return (
                <div key={stage.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  style={{
                    background: stage.bg,
                    border: `1px solid ${stage.color}33`,
                    borderRadius: 'var(--radius-lg)',
                    padding: 12,
                    minHeight: 520,
                  }}>
                  {/* Column header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: stage.color }}>{stage.label}</div>
                    <span style={{ background: `${stage.color}22`, color: stage.color, fontSize: 12, fontWeight: 700,
                      padding: '1px 8px', borderRadius: 20 }}>{colDeals.length}</span>
                  </div>

                  {/* Deal cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {colDeals.map(deal => (
                      <div key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal)}
                        style={{
                          background: 'var(--color-bg-primary)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: 12,
                          cursor: 'grab',
                          transition: 'box-shadow 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
                      >
                        {/* Property */}
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4,
                          cursor: 'pointer', color: 'var(--color-accent)' }}
                          onClick={() => navigate(`/properties/${deal.propertyId}`)}>
                          🏠 {deal.propertyTitle}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>📍 {deal.propertyDistrict}</div>

                        {/* Buyer */}
                        <div style={{ fontSize: 12, marginBottom: 4 }}>
                          👤 <strong>{deal.buyerName}</strong>
                          {deal.buyerPhone && <span style={{ color: 'var(--color-text-muted)' }}> · {deal.buyerPhone}</span>}
                        </div>

                        {/* Price */}
                        {deal.expectedPrice
                          ? <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, marginBottom: 4 }}>
                              💰 {deal.expectedPrice} {deal.priceUnit}
                            </div>
                          : <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                              💰 {deal.propertyPrice} {deal.propertyPriceUnit}
                            </div>
                        }

                        {deal.notes && (
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic',
                            borderTop: '1px solid var(--color-border)', paddingTop: 6, marginTop: 4 }}>
                            {deal.notes}
                          </div>
                        )}

                        {/* Agent + delete */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          {isManager() && (
                            <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>📋 {deal.agentName}</span>
                          )}
                          <button onClick={() => handleDelete(deal.id)}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                              fontSize: 12, color: 'var(--color-text-muted)' }}>🗑️</button>
                        </div>

                        {/* Stage nav pills */}
                        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                          {STAGES.filter(s => s.id !== deal.stage && s.id !== 'CANCELLED').slice(0, 3).map(s => (
                            <button key={s.id}
                              onClick={async () => {
                                const updated = await moveDealStage(deal.id, s.id)
                                setDeals(prev => prev.map(d => d.id === deal.id ? updated : d))
                                toast.success(`→ ${s.label}`)
                              }}
                              style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, border: `1px solid ${s.color}`,
                                background: 'transparent', color: s.color, cursor: 'pointer' }}>
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {colDeals.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: `${stage.color}66`, fontSize: 12, pointerEvents: 'none' }}>
                        Kéo deal vào đây
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}
