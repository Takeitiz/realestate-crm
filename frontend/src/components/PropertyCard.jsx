import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  formatPrice, formatArea, formatPropertyType,
  formatTransactionType, formatStatus, formatFreshness
} from '../utils/format'

export default function PropertyCard({ property, selected, onSelect }) {
  const navigate = useNavigate()
  const hasImage = property.imageUrls && property.imageUrls.length > 0

  return (
    <div
      className="property-card"
      style={selected ? { borderColor: 'var(--color-accent)', boxShadow: 'var(--shadow-glow)' } : {}}
      onClick={() => navigate(`/properties/${property.id}`)}
    >
      {/* Image */}
      <div style={{ position: 'relative' }}>
        {hasImage ? (
          <img
            src={property.imageUrls[0]}
            alt={property.title}
            className="property-card-image"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
          />
        ) : null}
        <div className="property-card-image-placeholder" style={{ display: hasImage ? 'none' : 'flex' }}>
          {property.propertyType === 'APARTMENT' ? '🏢' : property.propertyType === 'LAND' ? '🌿' : property.propertyType === 'VILLA' ? '🏰' : '🏠'}
        </div>

        {/* Badges overlay */}
        <div className="property-card-badges">
          <span className={`badge status-${property.status}`}>
            {formatStatus(property.status)}
          </span>
          <span className={`badge badge-${property.transactionType === 'SALE' ? 'blue' : 'purple'}`}>
            {formatTransactionType(property.transactionType)}
          </span>
        </div>

        {/* Freshness indicator */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span className={`freshness-dot freshness-${property.freshnessStatus}`}
            title={formatFreshness(property.freshnessStatus)} />
        </div>

        {/* Select checkbox */}
        {onSelect && (
          <div style={{ position: 'absolute', bottom: 10, right: 10 }}
            onClick={e => { e.stopPropagation(); onSelect(property) }}>
            <div style={{
              width: 22, height: 22, border: '2px solid white', borderRadius: 4,
              background: selected ? 'var(--color-accent)' : 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              {selected && <span style={{ color: '#0d1117', fontSize: 14, fontWeight: 700 }}>✓</span>}
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="property-card-body">
        <div className="property-card-title">{property.title}</div>
        <div className="property-card-location">
          📍 {[property.ward, property.district].filter(Boolean).join(', ') || 'Hà Nội'}
        </div>

        <div className="property-card-specs">
          {property.areaSqm && (
            <div className="spec-item">📐 {formatArea(property.areaSqm)}</div>
          )}
          {property.bedrooms > 0 && (
            <div className="spec-item">🛏 {property.bedrooms} PN</div>
          )}
          {property.bathrooms > 0 && (
            <div className="spec-item">🚿 {property.bathrooms} WC</div>
          )}
          {property.floors > 0 && (
            <div className="spec-item">🏗 {property.floors} tầng</div>
          )}
        </div>

        <div className="property-card-footer">
          <div className="property-card-price">{formatPrice(property.price, property.priceUnit)}</div>
          <div className="text-xs text-muted">{formatPropertyType(property.propertyType)}</div>
        </div>
      </div>
    </div>
  )
}
