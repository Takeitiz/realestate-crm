import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { importExcel } from '../api/sprint4'
import toast from 'react-hot-toast'

const TEMPLATE_URL = '/api/properties/import/template'

const COL_GUIDE = [
  ['title', '✅ Bắt buộc', 'Tên BĐS'],
  ['propertyType', '—', 'APARTMENT | HOUSE | LAND | VILLA | SHOPHOUSE | OFFICE'],
  ['transactionType', '—', 'SALE | RENT'],
  ['status', '—', 'AVAILABLE | RESERVED | SOLD | RENTED'],
  ['province', '—', 'VD: Hà Nội'],
  ['district', '✅ Bắt buộc', 'VD: Cầu Giấy'],
  ['ward', '—', 'VD: Dịch Vọng'],
  ['street', '—', 'Tên đường'],
  ['houseNumber', '—', 'Số nhà'],
  ['areaSqm', '—', 'Số (m²)'],
  ['bedrooms', '—', 'Số phòng ngủ'],
  ['bathrooms', '—', 'Số phòng tắm'],
  ['floors', '—', 'Số tầng'],
  ['direction', '—', 'NORTH | SOUTH | EAST | WEST | NORTHEAST | NORTHWEST | SOUTHEAST | SOUTHWEST'],
  ['price', '—', 'Số (không đơn vị)'],
  ['priceUnit', '—', 'tỷ | triệu | triệu/tháng | USD'],
  ['description', '—', 'Mô tả dài'],
  ['sellerName', '—', 'Tên chủ nhà'],
  ['sellerPhone', '—', 'SĐT chủ'],
  ['sellerNotes', '—', 'Ghi chú nội bộ'],
  ['lat', '—', 'Vĩ độ (VD: 21.028511)'],
  ['lng', '—', 'Kinh độ (VD: 105.854167)'],
]

export default function BulkImportPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  const handleSelect = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)')
      return
    }
    setFile(f)
    setResult(null)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    try {
      const res = await importExcel(file)
      setResult(res)
      if (res.success > 0) {
        toast.success(`✅ Đã nhập ${res.success}/${res.total} BĐS thành công!`)
      }
      if (res.errors?.length > 0) {
        toast.error(`⚠️ ${res.errors.length} hàng bị lỗi`)
      }
    } catch (e) {
      toast.error('Lỗi nhập liệu. Kiểm tra lại file.')
    }
    finally { setImporting(false) }
  }

  const pct = result ? Math.round((result.success / result.total) * 100) : 0

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => navigate('/properties')}>← Quay lại</button>
          <h1 className="page-title">📥 Nhập BĐS hàng loạt</h1>
          <p className="page-subtitle">Tải lên file Excel để thêm nhiều BĐS cùng lúc</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

        {/* Left: upload flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step 1: Download template */}
          <div className="card" style={{ border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>1</div>
              <div className="card-title">Tải template Excel</div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
              Mở file, điền thông tin BĐS vào các cột theo hướng dẫn. Không xóa dòng tiêu đề.
            </p>
            <a href={TEMPLATE_URL} download="bds-import-template.xlsx" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              ⬇️ Tải template (.xlsx)
            </a>
          </div>

          {/* Step 2: Upload */}
          <div className="card" style={{ border: file ? '1px solid rgba(34,197,94,0.4)' : '1px dashed var(--color-border)', background: file ? 'rgba(34,197,94,0.04)' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: file ? '#22c55e' : 'var(--color-bg-secondary)',
                color: file ? 'white' : 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>2</div>
              <div className="card-title">Chọn file Excel</div>
            </div>

            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleSelect} />

            {!file ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', cursor: 'pointer' }}
                onClick={() => fileInputRef.current?.click()}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>📂</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Nhấn để chọn file hoặc kéo thả vào đây</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>.xlsx, .xls</div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>📊</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{file.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => { setFile(null); setResult(null); fileInputRef.current.value = '' }}>✕ Đổi file</button>
              </div>
            )}
          </div>

          {/* Step 3: Import */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: result?.success > 0 ? '#22c55e' : 'var(--color-bg-secondary)',
                color: result?.success > 0 ? 'white' : 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>3</div>
              <div className="card-title">Nhập dữ liệu</div>
            </div>

            <button className="btn btn-primary btn-lg" onClick={handleImport}
              disabled={!file || importing} style={{ width: '100%', marginBottom: 12 }}>
              {importing
                ? <><span className="spinner" style={{ width: 16, height: 16, marginRight: 8 }} /> Đang nhập...</>
                : '🚀 Bắt đầu nhập liệu'}
            </button>

            {/* Result */}
            {result && (
              <div>
                {/* Progress bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span>✅ Thành công: <strong style={{ color: '#22c55e' }}>{result.success}</strong></span>
                  <span>❌ Lỗi: <strong style={{ color: '#ef4444' }}>{result.errors.length}</strong></span>
                  <span>📋 Tổng: <strong>{result.total}</strong></span>
                </div>
                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 4, height: 8, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#22c55e', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>

                {result.success > 0 && (
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/properties')}>
                    🏠 Xem danh sách BĐS →
                  </button>
                )}

                {/* Error table */}
                {result.errors.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#ef4444' }}>
                      ❌ Chi tiết lỗi:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {result.errors.map((e, i) => (
                        <div key={i} style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.06)',
                          border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 12 }}>
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>Dòng {e.row}</span>
                          {e.title && <span style={{ color: 'var(--color-text-muted)' }}> · {e.title}</span>}
                          <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>{e.error}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: column guide */}
        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <div className="card-header"><div className="card-title">📋 Danh sách cột</div></div>
          <div style={{ fontSize: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 4, padding: '4px 0',
              borderBottom: '1px solid var(--color-border)', marginBottom: 8,
              color: 'var(--color-text-muted)', fontWeight: 600 }}>
              <span>Tên cột</span><span>Bắt buộc?</span>
            </div>
            {COL_GUIDE.map(([col, req, desc]) => (
              <div key={col} style={{ padding: '5px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code style={{ fontSize: 11, background: 'var(--color-bg-secondary)', padding: '1px 5px', borderRadius: 4 }}>{col}</code>
                  <span style={{ fontSize: 10, color: req === '✅ Bắt buộc' ? '#22c55e' : 'var(--color-text-muted)', fontWeight: req === '✅ Bắt buộc' ? 700 : 400 }}>
                    {req}
                  </span>
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 11, marginTop: 2 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
