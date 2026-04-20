import React, { useState, useEffect, useRef } from 'react'
import { getProperties } from '../api/properties'
import { generatePitch } from '../api/ai'
import PropertyCard from '../components/PropertyCard'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function PitchGeneratorPage() {
  const { aiProvider } = useAuth()
  const [properties, setProperties] = useState([])
  const [selected, setSelected] = useState([])
  const [buyerContext, setBuyerContext] = useState('')
  const [pitch, setPitch] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const pitchRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    getProperties({ status: 'AVAILABLE', size: 30 })
      .then(d => setProperties(d.content || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleSelect = (property) => {
    setSelected(prev => prev.find(p => p.id === property.id)
      ? prev.filter(p => p.id !== property.id)
      : prev.length >= 5 ? (toast.error('Chọn tối đa 5 BĐS'), prev)
      : [...prev, property]
    )
  }

  const handleGenerate = async () => {
    if (selected.length === 0) return toast.error('Vui lòng chọn ít nhất 1 BĐS')
    setGenerating(true)
    try {
      const data = await generatePitch(selected, buyerContext || 'Khách hàng tiềm năng')
      setPitch(data.result)
      setTimeout(() => pitchRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch { toast.error('Lỗi tạo tin nhắn') }
    finally { setGenerating(false) }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pitch)
      .then(() => toast.success('Đã sao chép vào clipboard!'))
      .catch(() => toast.error('Không thể sao chép'))
  }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">✉️ Tạo tin nhắn Zalo</h1>
          <p className="page-subtitle">Chọn BĐS và để AI tạo tin nhắn giới thiệu chuyên nghiệp</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="card" style={{ marginBottom: 20, background: 'rgba(45,212,191,0.03)', borderColor: 'rgba(45,212,191,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>
            {aiProvider === 'ollama' ? '🟢' : '🟡'}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              AI Provider: {aiProvider === 'ollama' ? 'Ollama (Qwen2)' : 'Mock Mode'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {aiProvider === 'mock'
                ? 'Đang dùng mẫu tin nhắn. Cài đặt Ollama + Qwen2 để tạo nội dung AI thực sự.'
                : 'Đang kết nối với Qwen2 để tạo nội dung thực sự bằng tiếng Việt.'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Property Selection */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>
              🏠 Chọn BĐS ({selected.length}/5)
            </h2>
            {selected.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Bỏ chọn tất cả</button>
            )}
          </div>

          {loading ? (
            <div className="loading-overlay"><div className="spinner spinner-lg" /></div>
          ) : (
            <div className="property-grid">
              {properties.map(p => (
                <PropertyCard key={p.id} property={p}
                  selected={selected.some(s => s.id === p.id)}
                  onSelect={toggleSelect} />
              ))}
            </div>
          )}
        </div>

        {/* Generator Panel */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">🎯 Thông tin khách hàng</div></div>
            <div className="form-group">
              <label className="form-label">Mô tả ngắn về nhu cầu khách</label>
              <textarea id="buyer-context" className="form-control" rows={4}
                placeholder="VD: Anh Minh 35 tuổi, đang tìm mua căn hộ để ở, ngân sách 3 tỷ, ưu tiên gần trường cho con..."
                value={buyerContext} onChange={e => setBuyerContext(e.target.value)} />
            </div>

            {/* Selected list */}
            {selected.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>BĐS đã chọn:</div>
                {selected.map(p => (
                  <div key={p.id} style={{ fontSize: 12, padding: '4px 0', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>• {p.title}</span>
                    <button className="btn btn-ghost" style={{ fontSize: 10, padding: '0 4px' }}
                      onClick={() => toggleSelect(p)}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <button id="btn-generate-pitch" className="btn btn-primary w-full" onClick={handleGenerate}
              disabled={generating || selected.length === 0}>
              {generating
                ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Đang tạo tin nhắn...</>
                : '✨ Tạo tin nhắn Zalo'}
            </button>
          </div>

          {/* Generated Pitch */}
          {pitch && (
            <div ref={pitchRef} className="card">
              <div className="card-header">
                <div className="card-title">📱 Tin nhắn Zalo</div>
                <button id="btn-copy-pitch" className="btn btn-secondary btn-sm" onClick={handleCopy}>
                  📋 Sao chép
                </button>
              </div>
              <div className="pitch-result">{pitch}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
