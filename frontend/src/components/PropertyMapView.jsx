import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const STATUS_COLORS = {
  AVAILABLE: '#22c55e',
  RESERVED:  '#f59e0b',
  SOLD:      '#ef4444',
  RENTED:    '#6366f1',
}

export default function PropertyMapView({ properties = [] }) {
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    const L = window.L
    if (!L) return

    // Hanoi center default
    const center = [21.0285, 105.8542]

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, { zoomControl: true }).setView(center, 12)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    }

    const map = mapInstanceRef.current

    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer)
      }
    })

    // Add property markers
    const withCoords = properties.filter(p => p.lat && p.lng)
    withCoords.forEach(p => {
      const color = STATUS_COLORS[p.status] || '#6b7280'

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          width: 14px; height: 14px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      const marker = L.marker([p.lat, p.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:200px;font-family:Inter,sans-serif">
            <div style="font-weight:700;font-size:14px;margin-bottom:6px">${p.title}</div>
            <div style="font-size:12px;color:#666;margin-bottom:4px">📍 ${p.district || ''}</div>
            <div style="font-size:13px;font-weight:600;color:${color};margin-bottom:8px">
              ${p.price ? p.price + ' ' + (p.priceUnit || '') : 'Chưa có giá'}
            </div>
            <div style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;background:${color}22;color:${color};margin-bottom:8px">
              ${p.status === 'AVAILABLE' ? 'Còn trống' : p.status === 'RESERVED' ? 'Đang giữ' : p.status === 'SOLD' ? 'Đã bán' : 'Đã thuê'}
            </div>
            <br/>
            <button onclick="window.navigateToProp(${p.id})" style="background:${color};color:white;border:none;border-radius:6px;padding:4px 12px;cursor:pointer;font-size:12px;font-weight:600">
              Xem chi tiết →
            </button>
          </div>
        `)
    })

    // Fit bounds if we have markers
    if (withCoords.length > 0) {
      const bounds = L.latLngBounds(withCoords.map(p => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    }

    return () => {}
  }, [properties])

  // Expose navigate to popup buttons
  useEffect(() => {
    window.navigateToProp = (id) => navigate(`/properties/${id}`)
    return () => { delete window.navigateToProp }
  }, [navigate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const withCoords = properties.filter(p => p.lat && p.lng)

  return (
    <div>
      {withCoords.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', marginBottom: 12,
          background: 'rgba(245,158,11,0.08)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)',
          color: '#f59e0b', fontSize: 13 }}>
          ⚠️ {properties.length} BĐS chưa có tọa độ. Thêm vĩ độ/kinh độ trong form chỉnh sửa để hiện trên bản đồ.
        </div>
      )}
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {status === 'AVAILABLE' ? 'Còn trống' : status === 'RESERVED' ? 'Đang giữ' : status === 'SOLD' ? 'Đã bán' : 'Đã thuê'}
            </span>
          </div>
        ))}
      </div>
      <div ref={mapRef} id="property-map"
        style={{ height: 560, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }} />
    </div>
  )
}
