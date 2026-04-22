import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseSearch } from '../api/ai'
import { getProperties } from '../api/properties'
import PropertyCard from '../components/PropertyCard'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function ChatSearchPage() {
  const navigate = useNavigate()
  const { aiProvider } = useAuth()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [parsedFilters, setParsedFilters] = useState(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return toast.error('Vui lòng nhập yêu cầu tìm kiếm')
    setLoading(true)
    try {
      const aiResult = await parseSearch(query)
      let filters = {}
      try { filters = JSON.parse(aiResult.result) } catch (e) { filters = {} }
      setParsedFilters(filters)

      // Build query params
      const params = { size: 20 }
      if (filters.district)     params.district     = filters.district
      if (filters.ward)         params.ward         = filters.ward
      if (filters.street)       params.street       = filters.street
      if (filters.propertyType) params.propertyType = filters.propertyType
      if (filters.transactionType) params.transactionType = filters.transactionType
      if (filters.minBedrooms)  params.minBedrooms  = filters.minBedrooms
      if (filters.minBathrooms) params.minBathrooms = filters.minBathrooms
      if (filters.minFloors)    params.minFloors    = filters.minFloors
      if (filters.maxPrice)     params.maxPrice     = filters.maxPrice
      if (filters.minArea)      params.minArea      = filters.minArea
      params.status = 'AVAILABLE'

      const data = await getProperties(params)
      setResults(data.content || [])
      setSearched(true)
    } catch (e) {
      toast.error('Lỗi tìm kiếm')
    } finally { setLoading(false) }
  }

  const exampleQueries = [
    'Tìm chung cư 2 phòng ngủ ở Cầu Giấy dưới 3 tỷ',
    'Thuê văn phòng quận Ba Đình khoảng 20 triệu',
    'Nhà phố 4 tầng Đống Đa sổ đỏ ngõ thông',
    'Đất mặt đường Hà Đông dưới 5 tỷ',
  ]

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">🔍 Tìm kiếm bằng AI</h1>
          <p className="page-subtitle">Nhập yêu cầu của khách hàng bằng ngôn ngữ tự nhiên</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="ai-panel" style={{ marginBottom: 24 }}>
        <div className="ai-panel-header">
          🤖 Chat-to-Search
          {aiProvider === 'mock' && <span className="badge badge-yellow" style={{ fontSize: 10 }}>Mock Mode</span>}
          {aiProvider === 'ollama' && <span className="badge badge-green" style={{ fontSize: 10 }}>Qwen2</span>}
        </div>
        <textarea id="search-input" className="form-control" rows={3}
          style={{ marginBottom: 12 }}
          placeholder="VD: Khách cần tìm chung cư 2 phòng ngủ ở Cầu Giấy hoặc Thanh Xuân, diện tích khoảng 70m2, giá dưới 3 tỷ..."
          value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleSearch()} />

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button id="btn-ai-search" className="btn btn-primary" onClick={handleSearch} disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Đang tìm...</> : '✨ Tìm kiếm'}
          </button>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>hoặc Ctrl+Enter</span>
        </div>

        {/* Example queries */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>Thử nghiệm:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {exampleQueries.map(q => (
              <button key={q} className="badge badge-teal" style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 12, border: 'none' }}
                onClick={() => setQuery(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parsed Filters */}
      {parsedFilters && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">🔎 Bộ lọc được nhận diện</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(parsedFilters).filter(([, v]) => v != null).map(([k, v]) => (
              <span key={k} className="badge badge-teal">
                {k}: {String(v)}
              </span>
            ))}
            {Object.values(parsedFilters).every(v => v === null) && (
              <span className="text-muted text-sm">Không nhận diện được bộ lọc cụ thể</span>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {searched && (
        <div>
          <div style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 16 }}>
            {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${results.length} BĐS phù hợp`}
          </div>
          {results.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">Không tìm thấy BĐS phù hợp</div>
              <div className="empty-state-desc">Thử điều chỉnh yêu cầu tìm kiếm</div>
            </div>
          ) : (
            <div className="property-grid">
              {results.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
