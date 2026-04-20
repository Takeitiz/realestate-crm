import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProperty, updateStatus } from '../api/properties'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  formatPrice, formatArea, formatPropertyType, formatTransactionType,
  formatStatus, formatDirection, formatFreshness, formatDate
} from '../utils/format'

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Còn trống', icon: '✅' },
  { value: 'RESERVED', label: 'Đang giữ chỗ', icon: '⏳' },
  { value: 'SOLD', label: 'Đã bán', icon: '🏷️' },
  { value: 'RENTED', label: 'Đã cho thuê', icon: '🔑' },
]

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isManager } = useAuth()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadProperty()
  }, [id])

  const loadProperty = async () => {
    setLoading(true)
    try {
      setProperty(await getProperty(id))
    } catch (e) {
      toast.error('Không tìm thấy bất động sản')
      navigate('/properties')
    } finally { setLoading(false) }
  }

  const handleStatusChange = async (status) => {
    setUpdating(true)
    try {
      const updated = await updateStatus(id, status)
      setProperty(updated)
      toast.success('Đã cập nhật trạng thái')
    } catch (e) { toast.error('Lỗi cập nhật trạng thái') }
    finally { setUpdating(false) }
  }

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>
  if (!property) return null

  const details = [
    { icon: '📐', label: 'Diện tích', value: formatArea(property.areaSqm) },
    { icon: '🛏', label: 'Phòng ngủ', value: property.bedrooms ? `${property.bedrooms} phòng` : '--' },
    { icon: '🚿', label: 'Phòng tắm', value: property.bathrooms ? `${property.bathrooms} phòng` : '--' },
    { icon: '🏗', label: 'Số tầng', value: property.floors ? `${property.floors} tầng` : '--' },
    { icon: '🧭', label: 'Hướng', value: formatDirection(property.direction) },
    { icon: '🗂', label: 'Loại BĐS', value: formatPropertyType(property.propertyType) },
    { icon: '💼', label: 'Giao dịch', value: formatTransactionType(property.transactionType) },
    { icon: '📅', label: 'Cập nhật', value: formatDate(property.updatedAt) },
  ]

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/properties')}>
            ← Quay lại
          </button>
          <h1 className="page-title">{property.title}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            <span className={`badge status-${property.status}`}>{formatStatus(property.status)}</span>
            <span className={`badge badge-${property.transactionType === 'SALE' ? 'blue' : 'purple'}`}>
              {formatTransactionType(property.transactionType)}
            </span>
            <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className={`freshness-dot freshness-${property.freshnessStatus}`} />
              {formatFreshness(property.freshnessStatus)}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button id="btn-edit-property" className="btn btn-secondary" onClick={() => navigate(`/properties/${id}/edit`)}>
            ✏️ Chỉnh sửa
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Main Content */}
        <div>
          {/* Image Gallery */}
          {property.imageUrls?.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
              <img src={property.imageUrls[imgIdx]} alt={property.title}
                style={{ width: '100%', height: 360, objectFit: 'cover' }} />
              {property.imageUrls.length > 1 && (
                <div style={{ display: 'flex', gap: 8, padding: 12, overflowX: 'auto' }}>
                  {property.imageUrls.map((url, i) => (
                    <img key={i} src={url} alt={`Ảnh ${i+1}`}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, cursor: 'pointer',
                        border: i === imgIdx ? '2px solid var(--color-accent)' : '2px solid transparent' }}
                      onClick={() => setImgIdx(i)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><div className="card-title">📝 Mô tả</div></div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>
                {property.description}
              </p>
            </div>
          )}

          {/* Specs Grid */}
          <div className="card">
            <div className="card-header"><div className="card-title">📋 Thông số kỹ thuật</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {details.map(d => (
                <div key={d.label} style={{ background: 'var(--color-bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>{d.icon} {d.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{d.value || '--'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Price Card */}
          <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(45,212,191,0.08), rgba(14,165,233,0.08))', borderColor: 'rgba(45,212,191,0.3)' }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>Giá</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-accent)' }}>
              {formatPrice(property.price, property.priceUnit)}
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <div className="card-header"><div className="card-title">📍 Vị trí</div></div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
              {property.houseNumber ? <div>Số nhà: <strong>{property.houseNumber}</strong></div> : null}
              {property.street ? <div>Đường: <strong>{property.street}</strong></div> : null}
              {property.ward ? <div>Phường: <strong>{property.ward}</strong></div> : null}
              {property.district ? <div>Quận: <strong>{property.district}</strong></div> : null}
              {property.province ? <div>Tỉnh/TP: <strong>{property.province}</strong></div> : null}
            </div>
          </div>

          {/* Seller Info */}
          <div className="card">
            <div className="card-header"><div className="card-title">👤 Thông tin chủ nhà</div></div>
            <div style={{ fontSize: 14, lineHeight: 1.8 }}>
              {property.sellerName && <div>Tên: <strong>{property.sellerName}</strong></div>}
              {property.sellerPhone && (
                <div>SĐT: <strong style={{ color: property.sellerPhone.includes('*') ? 'var(--color-warning)' : 'var(--color-accent)' }}>
                  {property.sellerPhone}
                </strong>{property.sellerPhone.includes('*') && ' 🔒'}</div>
              )}
              {property.sellerNotes && (
                <div style={{ marginTop: 8, color: 'var(--color-text-muted)', fontSize: 13 }}>
                  Ghi chú: {property.sellerNotes}
                </div>
              )}
            </div>
          </div>

          {/* Status Control */}
          <div className="card">
            <div className="card-header"><div className="card-title">🔄 Cập nhật trạng thái</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STATUS_OPTIONS.map(s => (
                <button key={s.value} id={`btn-status-${s.value.toLowerCase()}`}
                  className={`btn ${property.status === s.value ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={updating || property.status === s.value}
                  onClick={() => handleStatusChange(s.value)}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Creator Info */}
          {property.createdByName && (
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Được thêm bởi <strong>{property.createdByName}</strong><br />
              {formatDate(property.createdAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
