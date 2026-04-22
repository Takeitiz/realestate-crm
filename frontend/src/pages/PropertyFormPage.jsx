import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { createProperty, updateProperty, getProperty, checkDuplicate, uploadImage } from '../api/properties'
import { parseListing } from '../api/ai'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { DISTRICTS_HANOI, PROPERTY_TYPES, TRANSACTION_TYPES, STATUSES, DIRECTIONS } from '../utils/format'

const EMPTY = {
  title: '', propertyType: '', transactionType: 'SALE', status: 'AVAILABLE',
  province: 'Hà Nội', district: '', ward: '', street: '', houseNumber: '',
  areaSqm: '', bedrooms: '', bathrooms: '', floors: '', direction: '',
  price: '', priceUnit: 'tỷ', description: '',
  sellerName: '', sellerPhone: '', sellerNotes: '',
  commissionRate: '', commissionNote: '', commissionStatus: 'PENDING',
  lat: '', lng: ''
}

export default function PropertyFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { aiProvider } = useAuth()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [duplicates, setDuplicates] = useState([])
  const [files, setFiles] = useState([])

  useEffect(() => {
    if (isEdit) {
      setLoading(true)
      getProperty(id).then(p => {
        setForm({
          title: p.title || '', propertyType: p.propertyType || '',
          transactionType: p.transactionType || 'SALE', status: p.status || 'AVAILABLE',
          province: p.province || 'Hà Nội', district: p.district || '',
          ward: p.ward || '', street: p.street || '', houseNumber: p.houseNumber || '',
          areaSqm: p.areaSqm || '', bedrooms: p.bedrooms || '', bathrooms: p.bathrooms || '',
          floors: p.floors || '', direction: p.direction || '',
          price: p.price || '', priceUnit: p.priceUnit || 'tỷ', description: p.description || '',
          sellerName: p.sellerName || '', sellerPhone: p.sellerPhone || '', sellerNotes: p.sellerNotes || '',
          commissionRate: p.commissionRate || '', commissionNote: p.commissionNote || '', commissionStatus: p.commissionStatus || 'PENDING',
          lat: p.lat || '', lng: p.lng || ''
        })
      }).catch(() => navigate('/properties'))
       .finally(() => setLoading(false))
    }
  }, [id])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleAiParse = async () => {
    if (!aiText.trim()) return toast.error('Vui lòng nhập nội dung cần phân tích')
    setAiLoading(true)
    try {
      const data = await parseListing(aiText)
      const parsed = JSON.parse(data.result)
      setForm(prev => ({ ...prev, ...Object.fromEntries(Object.entries(parsed).filter(([, v]) => v != null && v !== '')) }))
      toast.success('Đã phân tích và điền form thành công!')
      setAiText('')
    } catch (e) {
      toast.error('Lỗi phân tích AI. Vui lòng thử lại.')
    } finally { setAiLoading(false) }
  }

  const handleCheckDuplicate = async () => {
    if (!form.district || !form.areaSqm || !form.price) return
    try {
      const dups = await checkDuplicate({ district: form.district, areaSqm: parseFloat(form.areaSqm), price: parseFloat(form.price) })
      setDuplicates(dups)
      if (dups.length > 0) toast(`⚠️ Phát hiện ${dups.length} BĐS có thể trùng lặp!`, { icon: '⚠️' })
    } catch {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.district) return toast.error('Vui lòng nhập tiêu đề và quận/huyện')
    setSaving(true)
    try {
      const payload = {
        ...form,
        areaSqm: form.areaSqm ? parseFloat(form.areaSqm) : null,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        floors: form.floors ? parseInt(form.floors) : null,
        price: form.price ? parseFloat(form.price) : null,
        commissionRate: form.commissionRate ? parseFloat(form.commissionRate) : null,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        propertyType: form.propertyType || null,
        direction: form.direction || null,
      }
      let saved
      if (isEdit) {
        saved = await updateProperty(id, payload)
      } else {
        saved = await createProperty(payload)
        // Upload images if any
        for (let i = 0; i < files.length; i++) {
          try { await uploadImage(saved.id, files[i], i) } catch {}
        }
      }
      toast.success(isEdit ? 'Đã cập nhật BĐS!' : 'Đã thêm BĐS mới!')
      navigate(`/properties/${saved.id}`)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi lưu thông tin')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/properties')}>← Quay lại</button>
          <h1 className="page-title">{isEdit ? '✏️ Chỉnh sửa BĐS' : '➕ Thêm BĐS mới'}</h1>
        </div>
      </div>

      {/* AI Smart Data Entry */}
      {!isEdit && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            🤖 Nhập liệu thông minh bằng AI
            {aiProvider === 'mock' && <span className="badge badge-yellow" style={{ fontSize: 10 }}>Chế độ Mock</span>}
            {aiProvider === 'ollama' && <span className="badge badge-green" style={{ fontSize: 10 }}>Qwen2</span>}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 10 }}>
            Dán nội dung từ Zalo/nhóm chat vào đây, AI sẽ tự động trích xuất thông tin vào form.
          </p>
          <textarea id="ai-input" className="form-control" rows={4}
            placeholder="VD: Chào mn, cho thuê căn hộ 2PN tại Cầu Giấy, 68m2, tầng 15, đầy đủ nội thất, giá 12tr/tháng. LH: Chị Hoa - 0912345678"
            value={aiText} onChange={e => setAiText(e.target.value)} />
          <button id="btn-ai-parse" className="btn btn-primary" style={{ marginTop: 10 }}
            onClick={handleAiParse} disabled={aiLoading}>
            {aiLoading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Đang phân tích...</> : '✨ Phân tích & Điền form'}
          </button>
        </div>
      )}

      {/* Duplicate Warning */}
      {duplicates.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          ⚠️ Phát hiện {duplicates.length} BĐS có thể trùng lặp tại {form.district} với diện tích và giá tương tự.
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }}
            onClick={() => setDuplicates([])} > Bỏ qua</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
          <div>
            {/* Basic Info */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><div className="card-title">📋 Thông tin cơ bản</div></div>

              <div className="form-group">
                <label className="form-label">Tiêu đề *</label>
                <input id="input-title" className="form-control" placeholder="VD: Chung cư 2PN Cầu Giấy view hồ..."
                  value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Loại BĐS</label>
                  <select className="form-control" value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>
                    <option value="">Chọn...</option>
                    {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Giao dịch</label>
                  <select className="form-control" value={form.transactionType} onChange={e => set('transactionType', e.target.value)}>
                    {TRANSACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea className="form-control" rows={4} placeholder="Mô tả chi tiết về bất động sản..."
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
            </div>

            {/* Location */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><div className="card-title">📍 Vị trí</div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Quận/Huyện *</label>
                  <select id="input-district" className="form-control" value={form.district}
                    onChange={e => { set('district', e.target.value); setDuplicates([]); }}
                    onBlur={handleCheckDuplicate}>
                    <option value="">Chọn quận/huyện...</option>
                    {DISTRICTS_HANOI.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phường/Xã</label>
                  <input className="form-control" placeholder="VD: Dịch Vọng" value={form.ward} onChange={e => set('ward', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tên đường</label>
                  <input className="form-control" placeholder="VD: Trần Thái Tông" value={form.street} onChange={e => set('street', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số nhà (chỉ Manager thấy)</label>
                  <input className="form-control" placeholder="VD: 15B" value={form.houseNumber} onChange={e => set('houseNumber', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">🗺️ Vĩ độ (lat)</label>
                  <input className="form-control" type="number" step="0.000001" placeholder="21.028511" value={form.lat} onChange={e => set('lat', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">🗺️ Kinh độ (lng)</label>
                  <input className="form-control" type="number" step="0.000001" placeholder="105.854167" value={form.lng} onChange={e => set('lng', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Specs */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><div className="card-title">📐 Thông số</div></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Diện tích (m²)</label>
                  <input id="input-area" className="form-control" type="number" placeholder="68" value={form.areaSqm}
                    onChange={e => set('areaSqm', e.target.value)} onBlur={handleCheckDuplicate} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phòng ngủ</label>
                  <input className="form-control" type="number" placeholder="2" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phòng tắm</label>
                  <input className="form-control" type="number" placeholder="2" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số tầng</label>
                  <input className="form-control" type="number" placeholder="4" value={form.floors} onChange={e => set('floors', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hướng</label>
                  <select className="form-control" value={form.direction} onChange={e => set('direction', e.target.value)}>
                    <option value="">Chọn...</option>
                    {DIRECTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Pricing */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><div className="card-title">💰 Giá cả</div></div>
              <div className="form-group">
                <label className="form-label">Giá</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input id="input-price" className="form-control" type="number" step="0.01" placeholder="2.85"
                    value={form.price} onChange={e => set('price', e.target.value)} onBlur={handleCheckDuplicate}
                    style={{ flex: 1 }} />
                  <select className="form-control" value={form.priceUnit} onChange={e => set('priceUnit', e.target.value)}
                    style={{ width: 130 }}>
                    <option value="tỷ">tỷ</option>
                    <option value="triệu">triệu</option>
                    <option value="triệu/tháng">triệu/tháng</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Seller */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><div className="card-title">👤 Thông tin chủ nhà</div></div>
              <div className="form-group">
                <label className="form-label">Tên chủ nhà</label>
                <input className="form-control" placeholder="Nguyễn Văn A" value={form.sellerName} onChange={e => set('sellerName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại (chỉ Manager thấy)</label>
                <input className="form-control" placeholder="0912345678" value={form.sellerPhone} onChange={e => set('sellerPhone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú nội bộ</label>
                <textarea className="form-control" rows={3} placeholder="Lưu ý cho team..." value={form.sellerNotes} onChange={e => set('sellerNotes', e.target.value)} />
              </div>
            </div>

            {/* Commission */}
            <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(34,197,94,0.3)' }}>
              <div className="card-header"><div className="card-title">💸 Hoa hồng</div></div>
              <div className="form-group">
                <label className="form-label">Tỷ lệ hoa hồng (%)</label>
                <input className="form-control" type="number" step="0.1" placeholder="1.5" value={form.commissionRate} onChange={e => set('commissionRate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú hoa hồng</label>
                <textarea className="form-control" rows={2} placeholder="VD: Chia đôi với môi giới đối diện..." value={form.commissionNote} onChange={e => set('commissionNote', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Trạng thái hoa hồng</label>
                <select className="form-control" value={form.commissionStatus} onChange={e => set('commissionStatus', e.target.value)}>
                  <option value="PENDING">Chờ xác nhận</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="PAID">Đã thanh toán</option>
                </select>
              </div>
            </div>

            {/* Images */}
            {!isEdit && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header"><div className="card-title">🖼️ Ảnh (tự động thêm watermark)</div></div>
                <input type="file" accept="image/*" multiple className="form-control"
                  onChange={e => setFiles(Array.from(e.target.files))} />
                {files.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {files.length} ảnh được chọn
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button id="btn-save-property" className="btn btn-primary btn-lg" type="submit" disabled={saving}>
                {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Đang lưu...</> : (isEdit ? '💾 Cập nhật' : '✅ Thêm BĐS')}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => navigate('/properties')}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
