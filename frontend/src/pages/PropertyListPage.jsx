import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProperties } from '../api/properties'
import PropertyCard from '../components/PropertyCard'
import { DISTRICTS_HANOI, PROPERTY_TYPES, TRANSACTION_TYPES, STATUSES } from '../utils/format'

export default function PropertyListPage() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    district: '', propertyType: '', transactionType: '', status: '', minBedrooms: '', maxPrice: ''
  })

  const totalPages = Math.ceil(total / 12)

  useEffect(() => { load() }, [page, filters])

  const load = async () => {
    setLoading(true)
    try {
      const params = { page, size: 12 }
      if (filters.district) params.district = filters.district
      if (filters.propertyType) params.propertyType = filters.propertyType
      if (filters.transactionType) params.transactionType = filters.transactionType
      if (filters.status) params.status = filters.status
      if (filters.minBedrooms) params.minBedrooms = filters.minBedrooms
      if (filters.maxPrice) params.maxPrice = filters.maxPrice
      const data = await getProperties(params)
      setProperties(data.content || [])
      setTotal(data.totalElements || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(0)
  }

  const clearFilters = () => { setFilters({ district: '', propertyType: '', transactionType: '', status: '', minBedrooms: '', maxPrice: '' }); setPage(0) }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏠 Danh sách Bất động sản</h1>
          <p className="page-subtitle">{total} bất động sản trong hệ thống</p>
        </div>
        <button id="btn-new-property" className="btn btn-primary" onClick={() => navigate('/properties/new')}>
          + Thêm BĐS
        </button>
      </div>

      {/* Filter Panel */}
      <div className="filter-panel">
        <div className="filter-grid">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Quận/Huyện</label>
            <select className="form-control" value={filters.district} onChange={e => handleFilter('district', e.target.value)}>
              <option value="">Tất cả</option>
              {DISTRICTS_HANOI.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Loại BĐS</label>
            <select className="form-control" value={filters.propertyType} onChange={e => handleFilter('propertyType', e.target.value)}>
              <option value="">Tất cả</option>
              {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Loại giao dịch</label>
            <select className="form-control" value={filters.transactionType} onChange={e => handleFilter('transactionType', e.target.value)}>
              <option value="">Tất cả</option>
              {TRANSACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Trạng thái</label>
            <select className="form-control" value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
              <option value="">Tất cả</option>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tối thiểu phòng ngủ</label>
            <select className="form-control" value={filters.minBedrooms} onChange={e => handleFilter('minBedrooms', e.target.value)}>
              <option value="">Tất cả</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ PN</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Giá tối đa (tỷ)</label>
            <input className="form-control" type="number" placeholder="VD: 5"
              value={filters.maxPrice} onChange={e => handleFilter('maxPrice', e.target.value)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-secondary w-full" onClick={clearFilters}>🔄 Xóa lọc</button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-overlay"><div className="spinner spinner-lg" /></div>
      ) : properties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">Không tìm thấy kết quả</div>
          <div className="empty-state-desc">Thử thay đổi bộ lọc để tìm BĐS phù hợp</div>
          <button className="btn btn-secondary" onClick={clearFilters}>Xóa bộ lọc</button>
        </div>
      ) : (
        <>
          <div className="property-grid">
            {properties.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Trước</button>
              <span style={{ padding: '5px 12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Trang {page + 1} / {totalPages}
              </span>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Sau →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
