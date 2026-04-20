import React, { useState, useEffect } from 'react'
import { getRequirements, createRequirement, updateRequirement, deleteRequirement } from '../api/crm'
import { DISTRICTS_HANOI, PROPERTY_TYPES, TRANSACTION_TYPES, formatTransactionType, formatPropertyType } from '../utils/format'
import toast from 'react-hot-toast'

const EMPTY = { buyerName: '', buyerPhone: '', transactionType: 'SALE', propertyType: '', targetDistrict: '', targetWard: '', minArea: '', maxArea: '', minBedrooms: '', maxPrice: '', priceUnit: 'tỷ', notes: '', active: true }

export default function BuyerRequirementsPage() {
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try { setRequirements(await getRequirements()) }
    catch (e) { toast.error('Lỗi tải dữ liệu') }
    finally { setLoading(false) }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (r) => {
    setEditing(r)
    setForm({ buyerName: r.buyerName || '', buyerPhone: r.buyerPhone || '', transactionType: r.transactionType || 'SALE', propertyType: r.propertyType || '', targetDistrict: r.targetDistrict || '', targetWard: r.targetWard || '', minArea: r.minArea || '', maxArea: r.maxArea || '', minBedrooms: r.minBedrooms || '', maxPrice: r.maxPrice || '', priceUnit: r.priceUnit || 'tỷ', notes: r.notes || '', active: r.active ?? true })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.buyerName) return toast.error('Vui lòng nhập tên khách hàng')
    setSaving(true)
    try {
      const payload = { ...form, minArea: form.minArea ? +form.minArea : null, maxArea: form.maxArea ? +form.maxArea : null, minBedrooms: form.minBedrooms ? +form.minBedrooms : null, maxPrice: form.maxPrice ? +form.maxPrice : null, propertyType: form.propertyType || null }
      if (editing) { await updateRequirement(editing.id, payload) } else { await createRequirement(payload) }
      toast.success(editing ? 'Đã cập nhật!' : 'Đã thêm khách hàng!')
      setShowForm(false)
      load()
    } catch { toast.error('Lỗi lưu dữ liệu') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa yêu cầu này?')) return
    try { await deleteRequirement(id); toast.success('Đã xóa'); load() } catch { toast.error('Lỗi xóa') }
  }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Yêu cầu Khách hàng</h1>
          <p className="page-subtitle">Lưu trữ yêu cầu để nhận thông báo tự động khi có BĐS phù hợp</p>
        </div>
        <button id="btn-add-buyer" className="btn btn-primary" onClick={openCreate}>+ Thêm khách</button>
      </div>

      {loading ? <div className="loading-overlay"><div className="spinner spinner-lg" /></div> :
        requirements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">Chưa có yêu cầu nào</div>
            <div className="empty-state-desc">Thêm yêu cầu khách hàng để nhận thông báo tự động</div>
            <button className="btn btn-primary" onClick={openCreate}>+ Thêm khách hàng</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Khách hàng</th><th>Giao dịch</th><th>Loại BĐS</th>
                <th>Quận/Huyện</th><th>Diện tích</th><th>Giá tối đa</th>
                <th>Trạng thái</th><th>Thao tác</th>
              </tr></thead>
              <tbody>
                {requirements.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.buyerName}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{r.buyerPhone}</div>
                    </td>
                    <td><span className={`badge badge-${r.transactionType === 'SALE' ? 'blue' : 'purple'}`}>{formatTransactionType(r.transactionType)}</span></td>
                    <td>{r.propertyType ? formatPropertyType(r.propertyType) : '--'}</td>
                    <td>{r.targetDistrict || '--'}</td>
                    <td>{r.minArea || r.maxArea ? `${r.minArea || 0}–${r.maxArea || '∞'} m²` : '--'}</td>
                    <td>{r.maxPrice ? `${r.maxPrice} ${r.priceUnit || 'tỷ'}` : '--'}</td>
                    <td><span className={`badge ${r.active ? 'badge-green' : 'badge-red'}`}>{r.active ? 'Đang tìm' : 'Tạm dừng'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button id={`btn-edit-req-${r.id}`} className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}>✏️</button>
                        <button id={`btn-del-req-${r.id}`} className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Cập nhật yêu cầu' : 'Thêm khách hàng mới'}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Tên khách hàng *</label>
                <input className="form-control" placeholder="Anh/Chị Nguyễn Văn A" value={form.buyerName} onChange={e => set('buyerName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input className="form-control" placeholder="0912345678" value={form.buyerPhone} onChange={e => set('buyerPhone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Giao dịch</label>
                <select className="form-control" value={form.transactionType} onChange={e => set('transactionType', e.target.value)}>
                  {TRANSACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Loại BĐS</label>
                <select className="form-control" value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>
                  <option value="">Tất cả</option>
                  {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quận/Huyện</label>
                <select className="form-control" value={form.targetDistrict} onChange={e => set('targetDistrict', e.target.value)}>
                  <option value="">Tất cả</option>
                  {DISTRICTS_HANOI.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phòng ngủ tối thiểu</label>
                <input className="form-control" type="number" value={form.minBedrooms} onChange={e => set('minBedrooms', e.target.value)} placeholder="2" />
              </div>
              <div className="form-group">
                <label className="form-label">Diện tích tối thiểu (m²)</label>
                <input className="form-control" type="number" value={form.minArea} onChange={e => set('minArea', e.target.value)} placeholder="50" />
              </div>
              <div className="form-group">
                <label className="form-label">Giá tối đa</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="form-control" type="number" value={form.maxPrice} onChange={e => set('maxPrice', e.target.value)} placeholder="3" />
                  <select className="form-control" style={{ width: 110 }} value={form.priceUnit} onChange={e => set('priceUnit', e.target.value)}>
                    <option value="tỷ">tỷ</option>
                    <option value="triệu/tháng">tr/tháng</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Ghi chú</label>
                <textarea className="form-control" rows={2} value={form.notes} placeholder="Yêu cầu đặc biệt của khách..." onChange={e => set('notes', e.target.value)} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
                  <span className="form-label" style={{ margin: 0 }}>Đang tìm kiếm</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
              <button id="btn-save-buyer" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
