import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicProperty } from '../api/social'
import { formatPrice, formatArea, formatPropertyType, formatTransactionType, formatStatus } from '../utils/format'

export default function PublicPropertyPage() {
  const { token } = useParams()
  const [property, setProperty] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicProperty(token)
      .then(setProperty)
      .catch(e => setError(e.error || 'Liên kết không hợp lệ hoặc đã hết hạn'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)' }}>
      <div className="spinner spinner-lg" />
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔗</div>
      <h2 style={{ color: 'var(--color-text-primary)' }}>{error}</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>Vui lòng liên hệ môi giới để nhận link mới.</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', background: 'var(--color-bg-primary)', minHeight: '100vh' }}>
      {/* Branding */}
      <div style={{ textAlign: 'center', marginBottom: 32, padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-accent)' }}>🏠 BĐS CRM</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Thông tin bất động sản</div>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--color-text-primary)' }}>{property.title}</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <span className={`badge status-${property.status}`}>{formatStatus(property.status)}</span>
        <span className={`badge badge-${property.transactionType === 'SALE' ? 'blue' : 'purple'}`}>
          {formatTransactionType(property.transactionType)}
        </span>
        <span className="badge badge-teal">{formatPropertyType(property.propertyType)}</span>
      </div>

      {/* Images */}
      {property.imageUrls?.length > 0 && (
        <div style={{ marginBottom: 24, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <img src={property.imageUrls[0]} alt={property.title} style={{ width: '100%', height: 320, objectFit: 'cover' }} />
        </div>
      )}

      {/* Price + Location */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Giá</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-accent)' }}>
            {formatPrice(property.price, property.priceUnit)}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>📍 Vị trí</div>
          <div style={{ fontSize: 13, lineHeight: 1.7 }}>
            {[property.street, property.ward, property.district, property.province].filter(Boolean).join(', ')}
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><div className="card-title">📐 Thông số</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { icon: '📐', label: 'Diện tích', value: formatArea(property.areaSqm) },
            { icon: '🛏', label: 'Phòng ngủ', value: property.bedrooms ? `${property.bedrooms} phòng` : '--' },
            { icon: '🚿', label: 'Phòng tắm', value: property.bathrooms ? `${property.bathrooms} phòng` : '--' },
            { icon: '🏗', label: 'Số tầng', value: property.floors ? `${property.floors} tầng` : '--' },
          ].map(d => (
            <div key={d.label} style={{ background: 'var(--color-bg-secondary)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{d.icon} {d.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{d.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {property.description && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><div className="card-title">📝 Mô tả</div></div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>
            {property.description}
          </p>
        </div>
      )}

      {/* Contact */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(45,212,191,0.08), rgba(14,165,233,0.08))' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8 }}>Liên hệ môi giới để được tư vấn</div>
          {property.sellerPhone && (
            <a href={`tel:${property.sellerPhone}`}
              style={{ display: 'inline-block', padding: '10px 24px', background: 'var(--color-accent)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 16 }}>
              📞 {property.sellerPhone.includes('*') ? 'Liên hệ ngay' : property.sellerPhone}
            </a>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--color-text-muted)' }}>
        Powered by BĐS CRM · Thông tin được chia sẻ bởi môi giới
      </div>
    </div>
  )
}
