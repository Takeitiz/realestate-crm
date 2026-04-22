import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProperty, updateStatus } from '../api/properties'
import { getActivity, getComments, addComment, deleteComment, toggleFavorite, getMyFavorites, generateShareLink } from '../api/social'
import { getPropertyAppointments, createAppointment, updateAppointmentStatus, getPriceHistory, getDocuments, uploadDocument, deleteDocument, downloadDocumentUrl } from '../api/sprint2'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  formatPrice, formatArea, formatPropertyType, formatTransactionType,
  formatStatus, formatDirection, formatFreshness, formatDate
} from '../utils/format'

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Còn trống', icon: '✅' },
  { value: 'RESERVED',  label: 'Đang giữ chỗ', icon: '⏳' },
  { value: 'SOLD',      label: 'Đã bán', icon: '🏷️' },
  { value: 'RENTED',    label: 'Đã cho thuê', icon: '🔑' },
]

const ACTION_LABELS = {
  CREATED: { icon: '✨', label: 'Được tạo' },
  STATUS_CHANGED: { icon: '🔄', label: 'Thay đổi trạng thái' },
  PRICE_UPDATED: { icon: '💰', label: 'Cập nhật giá' },
  INFO_UPDATED: { icon: '✏️', label: 'Cập nhật thông tin' },
  IMAGE_UPLOADED: { icon: '📷', label: 'Thêm ảnh' },
  IMAGE_DELETED: { icon: '🗑️', label: 'Xóa ảnh' },
  BUYER_MATCHED: { icon: '🤝', label: 'Khớp khách hàng' },
  COMMENT_ADDED: { icon: '💬', label: 'Bình luận' },
  SHARE_LINK_GENERATED: { icon: '🔗', label: 'Tạo link chia sẻ' },
}

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isManager } = useAuth()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [updating, setUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [isFavorite, setIsFavorite] = useState(false)
  const [activity, setActivity] = useState([])
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [shareInfo, setShareInfo] = useState(null)
  const [generatingShare, setGeneratingShare] = useState(false)
  // Sprint 2
  const [appointments, setAppointments] = useState([])
  const [priceHistory, setPriceHistory] = useState([])
  const [documents, setDocuments] = useState([])
  const [showApptModal, setShowApptModal] = useState(false)
  const [apptForm, setApptForm] = useState({ buyerName: '', buyerPhone: '', scheduledAt: '', notes: '' })
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const fileInputRef = useRef(null)
  const commentInputRef = useRef(null)

  useEffect(() => {
    // Reset tab data when switching properties
    setActivity([])
    setComments([])
    setAppointments([])
    setDocuments([])
    setPriceHistory([])
    setActiveTab('info')
    loadAll()
  }, [id])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [prop, favIds] = await Promise.all([getProperty(id), getMyFavorites()])
      setProperty(prop)
      setIsFavorite(favIds.includes(Number(id)))
    } catch (e) {
      toast.error('Không tìm thấy bất động sản')
      navigate('/properties')
    } finally { setLoading(false) }
  }

  const loadTabData = async (tab) => {
    setActiveTab(tab)
    if (tab === 'activity' && activity.length === 0) {
      try {
        const [acts, ph] = await Promise.all([getActivity(id), getPriceHistory(id)])
        setActivity(acts)
        setPriceHistory(ph)
      } catch {}
    }
    if (tab === 'comments' && comments.length === 0) {
      try { setComments(await getComments(id)) } catch {}
    }
    if (tab === 'appointments' && appointments.length === 0) {
      try { setAppointments(await getPropertyAppointments(id)) } catch {}
    }
    if (tab === 'documents' && documents.length === 0) {
      try { setDocuments(await getDocuments(id)) } catch {}
    }
  }

  const handleStatusChange = async (status) => {
    setUpdating(true)
    try {
      const updated = await updateStatus(id, status)
      setProperty(updated)
      setActivity([]) // reset so it reloads
      toast.success('Đã cập nhật trạng thái')
    } catch (e) { toast.error('Lỗi cập nhật trạng thái') }
    finally { setUpdating(false) }
  }

  const handleToggleFavorite = async () => {
    try {
      const result = await toggleFavorite(id)
      setIsFavorite(result.favorited)
      toast.success(result.favorited ? '⭐ Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích')
    } catch { toast.error('Lỗi') }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setSubmittingComment(true)
    try {
      const c = await addComment(id, newComment)
      setComments(prev => [c, ...prev])
      setNewComment('')
      setActivity([]) // reset activity cache
    } catch { toast.error('Lỗi gửi bình luận') }
    finally { setSubmittingComment(false) }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Xóa bình luận này?')) return
    try {
      await deleteComment(id, commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('Đã xóa bình luận')
    } catch { toast.error('Lỗi xóa bình luận') }
  }

  const handleGenerateShare = async () => {
    setGeneratingShare(true)
    try {
      const info = await generateShareLink(id)
      setShareInfo(info)
      setActivity([])
      toast.success('Đã tạo link chia sẻ!')
    } catch { toast.error('Lỗi tạo link') }
    finally { setGeneratingShare(false) }
  }

  // Appointment
  const handleBookAppointment = async () => {
    try {
      const a = await createAppointment({ ...apptForm, propertyId: id })
      setAppointments(prev => [a, ...prev])
      setShowApptModal(false)
      setApptForm({ buyerName: '', buyerPhone: '', scheduledAt: '', notes: '' })
      toast.success('Đã đặt lịch hẹn!')
    } catch { toast.error('Lỗi đặt lịch') }
  }

  const handleApptStatus = async (apptId, status) => {
    const updated = await updateAppointmentStatus(apptId, status)
    setAppointments(prev => prev.map(a => a.id === apptId ? updated : a))
    toast.success('Đã cập nhật')
  }

  // Documents
  const handleDocUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingDoc(true)
    try {
      const doc = await uploadDocument(id, file)
      setDocuments(prev => [doc, ...prev])
      toast.success('Đã tải lên: ' + file.name)
    } catch { toast.error('Lỗi tải lên') }
    finally { setUploadingDoc(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleDocDelete = async (docId) => {
    if (!confirm('Xóa tài liệu này?')) return
    await deleteDocument(id, docId)
    setDocuments(prev => prev.filter(d => d.id !== docId))
    toast.success('Đã xóa')
  }

  const shareUrl = shareInfo ? `${window.location.origin}/public/p/${shareInfo.token}` : null

  const copyZalo = () => {
    if (!property) return
    const text = `🏠 ${property.title}
📍 ${[property.street, property.ward, property.district, property.province].filter(Boolean).join(', ')}
📐 ${formatArea(property.areaSqm)} | 🛏 ${property.bedrooms || 0}PN | 🚿 ${property.bathrooms || 0}WC | 🏗 ${property.floors || 0} tầng
💰 ${formatPrice(property.price, property.priceUnit)}
📞 Liên hệ để biết thêm chi tiết!`
    navigator.clipboard.writeText(text)
    toast.success('Đã copy nội dung Zalo!')
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

  const tabs = [
    { id: 'info',         label: '📋 Thông tin' },
    { id: 'activity',     label: '📜 Lịch sử' },
    { id: 'appointments', label: '📅 Lịch hẹn' },
    { id: 'documents',    label: '📁 Tài liệu' },
    { id: 'comments',     label: '💬 Ghi chú' },
    { id: 'share',        label: '🔗 Chia sẻ' },
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
          <button id="btn-favorite" title={isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
            className={`btn ${isFavorite ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 18, padding: '8px 14px' }}
            onClick={handleToggleFavorite}>
            {isFavorite ? '⭐' : '☆'}
          </button>
          <button id="btn-edit-property" className="btn btn-secondary" onClick={() => navigate(`/properties/${id}/edit`)}>
            ✏️ Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => loadTabData(t.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px',
              fontSize: 13, fontWeight: 600, color: activeTab === t.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
              borderBottom: activeTab === t.id ? '2px solid var(--color-accent)' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s'
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Main Content */}
        <div>
          {/* ─── TAB: INFO ─── */}
          {activeTab === 'info' && <>
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
            {property.description && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header"><div className="card-title">📝 Mô tả</div></div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {property.description}
                </p>
              </div>
            )}
            <div className="card">
              <div className="card-header"><div className="card-title">📋 Thông số kỹ thuật</div></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {details.map(d => (
                  <div key={d.label} style={{ background: 'var(--color-bg-secondary)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>{d.icon} {d.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{d.value || '--'}</div>
                  </div>
                ))}
              </div>
            </div>
          </>}

          {/* ─── TAB: ACTIVITY ─── */}
          {activeTab === 'activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div className="card-header"><div className="card-title">📜 Lịch sử hoạt động</div></div>
                {activity.length === 0
                  ? <div className="empty-state" style={{ padding: 32 }}><div className="empty-state-icon">📭</div><div className="empty-state-title">Chưa có hoạt động nào</div></div>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {activity.map((log, i) => {
                        const meta = ACTION_LABELS[log.action] || { icon: '•', label: log.action }
                        return (
                          <div key={log.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < activity.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{meta.icon}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{meta.label}</div>
                              {log.detail && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{log.detail}</div>}
                              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                                {log.userName} · {new Date(log.createdAt).toLocaleString('vi-VN')}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                }
              </div>
              {priceHistory.length > 0 && (
                <div className="card">
                  <div className="card-header"><div className="card-title">💰 Lịch sử giá</div></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {priceHistory.map((h, i) => (
                      <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < priceHistory.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                        <div>
                          <div style={{ fontSize: 13 }}>
                            <span style={{ color: 'var(--color-error)', textDecoration: 'line-through' }}>{h.oldPrice} {h.priceUnit}</span>
                            {' → '}
                            <span style={{ color: '#22c55e', fontWeight: 700 }}>{h.newPrice} {h.priceUnit}</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{h.changedBy} · {new Date(h.changedAt).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: COMMENTS ─── */}
          {activeTab === 'comments' && (
            <div className="card">
              <div className="card-header"><div className="card-title">💬 Ghi chú nội bộ</div></div>
              <div style={{ marginBottom: 16 }}>
                <textarea ref={commentInputRef} className="form-control" rows={3} placeholder="Thêm ghi chú cho BĐS này..." value={newComment} onChange={e => setNewComment(e.target.value)} style={{ marginBottom: 8 }} />
                <button className="btn btn-primary btn-sm" onClick={handleAddComment} disabled={submittingComment || !newComment.trim()}>
                  {submittingComment ? 'Đang gửi...' : '💬 Gửi ghi chú'}
                </button>
              </div>
              {comments.length === 0
                ? <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 24, fontSize: 13 }}>Chưa có ghi chú nào</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {comments.map(c => (
                      <div key={c.id} style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{c.authorName}</div>
                          {(c.authorUsername === user?.username || isManager) && (
                            <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 12 }}>🗑️</button>
                          )}
                        </div>
                        <div style={{ fontSize: 13, margin: '6px 0', lineHeight: 1.6 }}>{c.content}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{new Date(c.createdAt).toLocaleString('vi-VN')}</div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* ─── TAB: APPOINTMENTS ─── */}
          {activeTab === 'appointments' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-title">📅 Lịch hẹn xem nhà</div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowApptModal(true)}>+ Đặt lịch</button>
              </div>
              {showApptModal && (
                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>📅 Đặt lịch xem nhà</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <input className="form-control" placeholder="Tên khách *" value={apptForm.buyerName} onChange={e => setApptForm(p => ({...p, buyerName: e.target.value}))} />
                    <input className="form-control" placeholder="SĐT khách" value={apptForm.buyerPhone} onChange={e => setApptForm(p => ({...p, buyerPhone: e.target.value}))} />
                  </div>
                  <input type="datetime-local" className="form-control" style={{ marginBottom: 8 }} value={apptForm.scheduledAt} onChange={e => setApptForm(p => ({...p, scheduledAt: e.target.value}))} />
                  <textarea className="form-control" rows={2} placeholder="Ghi chú..." style={{ marginBottom: 8 }} value={apptForm.notes} onChange={e => setApptForm(p => ({...p, notes: e.target.value}))} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleBookAppointment} disabled={!apptForm.buyerName || !apptForm.scheduledAt}>✅ Xác nhận</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowApptModal(false)}>Hủy</button>
                  </div>
                </div>
              )}
              {appointments.length === 0
                ? <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)', fontSize: 13 }}>Chưa có lịch hẹn nào cho BĐS này</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {appointments.map(a => {
                      const statusColors = { SCHEDULED: '#3b82f6', COMPLETED: '#22c55e', CANCELLED: '#ef4444', NO_SHOW: '#f97316' }
                      const statusLabels = { SCHEDULED: 'Đã đặt', COMPLETED: 'Đã xem', CANCELLED: 'Đã hủy', NO_SHOW: 'Không đến' }
                      return (
                        <div key={a.id} style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${statusColors[a.status]}22`, color: statusColors[a.status], fontWeight: 600 }}>{statusLabels[a.status]}</span>
                              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>👤 {a.buyerName} {a.buyerPhone && `· ${a.buyerPhone}`}</div>
                              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>🗓️ {new Date(a.scheduledAt).toLocaleString('vi-VN')}</div>
                              {a.notes && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{a.notes}</div>}
                            </div>
                            {a.status === 'SCHEDULED' && (
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => handleApptStatus(a.id, 'COMPLETED')}>✅</button>
                                <button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => handleApptStatus(a.id, 'NO_SHOW')}>👻</button>
                                <button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => handleApptStatus(a.id, 'CANCELLED')}>✗</button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
              }
            </div>
          )}

          {/* ─── TAB: DOCUMENTS ─── */}
          {activeTab === 'documents' && (
            <div className="card">
              <div className="card-header"><div className="card-title">📁 Tài liệu đính kèm</div></div>
              <div style={{ marginBottom: 16 }}>
                <input ref={fileInputRef} type="file" id="doc-upload" style={{ display: 'none' }} onChange={handleDocUpload} />
                <button className="btn btn-primary btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingDoc}>
                  {uploadingDoc ? '⏳ Đang tải...' : '📎 Tải tài liệu lên'}
                </button>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 8 }}>PDF, Word, Excel, hình ảnh...</span>
              </div>
              {documents.length === 0
                ? <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)', fontSize: 13 }}>Chưa có tài liệu nào</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {documents.map(d => {
                      const ext = d.filename?.split('.').pop()?.toLowerCase() || ''
                      const icon = ['pdf'].includes(ext) ? '📄' : ['doc','docx'].includes(ext) ? '📝' : ['xls','xlsx'].includes(ext) ? '📊' : ['jpg','jpeg','png'].includes(ext) ? '🖼️' : '📎'
                      const size = d.fileSizeBytes > 1024*1024 ? `${(d.fileSizeBytes/1024/1024).toFixed(1)} MB` : `${Math.round(d.fileSizeBytes/1024)} KB`
                      return (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--color-bg-secondary)', borderRadius: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 20 }}>{icon}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{d.filename}</div>
                              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{size} · {d.uploadedBy}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <a href={downloadDocumentUrl(id, d.id)} download={d.filename} className="btn btn-sm btn-secondary" style={{ fontSize: 12 }}>⬇️ Tải</a>
                            <button className="btn btn-sm" style={{ fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: 'none' }} onClick={() => handleDocDelete(d.id)}>🗑️</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
              }
            </div>
          )}

          {activeTab === 'share' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Zalo copy */}
              <div className="card">
                <div className="card-header"><div className="card-title">📲 Copy cho Zalo</div></div>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                  Tạo tin nhắn Zalo có định dạng đẹp, sẵn sàng gửi cho khách hàng.
                </p>
                <button id="btn-copy-zalo" className="btn btn-primary" onClick={copyZalo}>📋 Copy nội dung Zalo</button>
              </div>

              {/* Share link */}
              <div className="card">
                <div className="card-header"><div className="card-title">🔗 Link chia sẻ công khai</div></div>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                  Tạo link xem BĐS không cần đăng nhập. Link sẽ hết hạn sau {shareInfo?.expireDays || 7} ngày.
                </p>
                <button id="btn-generate-share" className="btn btn-secondary" onClick={handleGenerateShare} disabled={generatingShare}>
                  {generatingShare ? 'Đang tạo...' : '✨ Tạo link chia sẻ'}
                </button>
                {shareInfo && (
                  <div style={{ marginTop: 12, padding: 12, background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 12, wordBreak: 'break-all', marginBottom: 8, color: 'var(--color-accent)' }}>{shareUrl}</div>
                    <button className="btn btn-primary btn-sm" onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Đã copy link!') }}>📋 Copy link</button>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
                      Hết hạn: {new Date(shareInfo.expiresAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── Sidebar (always visible) ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(45,212,191,0.08), rgba(14,165,233,0.08))', borderColor: 'rgba(45,212,191,0.3)' }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>Giá</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-accent)' }}>
              {formatPrice(property.price, property.priceUnit)}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">📍 Vị trí</div></div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
              {property.houseNumber && <div>Số nhà: <strong>{property.houseNumber}</strong></div>}
              {property.street && <div>Đường: <strong>{property.street}</strong></div>}
              {property.ward && <div>Phường: <strong>{property.ward}</strong></div>}
              {property.district && <div>Quận: <strong>{property.district}</strong></div>}
              {property.province && <div>Tỉnh/TP: <strong>{property.province}</strong></div>}
            </div>
          </div>

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

          {property.commissionRate != null && (
            <div className="card" style={{ borderColor: property.commissionStatus === 'PAID' ? '#22c55e' : property.commissionStatus === 'CONFIRMED' ? '#3b82f6' : undefined }}>
              <div className="card-header"><div className="card-title">💸 Hoa hồng</div></div>
              <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                <div>Tỷ lệ: <strong>{property.commissionRate}%</strong></div>
                {property.commissionNote && <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{property.commissionNote}</div>}
                <div style={{ marginTop: 8 }}>
                  {[{v:'PENDING',l:'Chờ xác nhận',c:'#f97316'},{v:'CONFIRMED',l:'Đã xác nhận',c:'#3b82f6'},{v:'PAID',l:'Đã thanh toán',c:'#22c55e'}].map(s => (
                    <span key={s.v} style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: property.commissionStatus === s.v ? `${s.c}22` : 'transparent',
                      color: property.commissionStatus === s.v ? s.c : 'var(--color-text-muted)',
                      border: `1px solid ${property.commissionStatus === s.v ? s.c : 'transparent'}`, marginRight: 4 }}>
                      {s.l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

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
