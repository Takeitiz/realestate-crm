// Formatting utilities
export function formatPrice(price, unit) {
  if (!price) return 'Liên hệ'
  return `${price} ${unit || 'tỷ'}`
}

export function formatArea(area) {
  if (!area) return '--'
  return `${area} m²`
}

export function formatPropertyType(type) {
  const map = { HOUSE: 'Nhà phố', APARTMENT: 'Chung cư', LAND: 'Đất', SHOPHOUSE: 'Shophouse', VILLA: 'Biệt thự' }
  return map[type] || type
}

export function formatTransactionType(type) {
  return type === 'SALE' ? 'Bán' : 'Cho thuê'
}

export function formatStatus(status) {
  const map = { AVAILABLE: 'Còn trống', RESERVED: 'Đang giữ chỗ', SOLD: 'Đã bán', RENTED: 'Đã thuê' }
  return map[status] || status
}

export function formatDirection(dir) {
  const map = {
    DONG: 'Đông', TAY: 'Tây', NAM: 'Nam', BAC: 'Bắc',
    DONG_BAC: 'Đông Bắc', TAY_BAC: 'Tây Bắc', DONG_NAM: 'Đông Nam', TAY_NAM: 'Tây Nam'
  }
  return map[dir] || dir || '--'
}

export function formatFreshness(status) {
  const map = { GREEN: 'Mới cập nhật', YELLOW: 'Cần xác nhận', RED: 'Dữ liệu cũ' }
  return map[status] || status
}

export function formatDistanceToNow(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH} giờ trước`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 30) return `${diffD} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

export function formatDate(dateStr) {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const DISTRICTS_HANOI = [
  'Ba Đình', 'Hoàn Kiếm', 'Đống Đa', 'Hai Bà Trưng',
  'Tây Hồ', 'Cầu Giấy', 'Thanh Xuân', 'Hoàng Mai',
  'Long Biên', 'Hà Đông', 'Nam Từ Liêm', 'Bắc Từ Liêm',
  'Gia Lâm', 'Đông Anh', 'Sóc Sơn', 'Thanh Trì',
  'Mê Linh', 'Hoài Đức', 'Đan Phượng', 'Thạch Thất'
]

export const PROPERTY_TYPES = [
  { value: 'HOUSE', label: 'Nhà phố' },
  { value: 'APARTMENT', label: 'Chung cư' },
  { value: 'LAND', label: 'Đất' },
  { value: 'SHOPHOUSE', label: 'Shophouse' },
  { value: 'VILLA', label: 'Biệt thự' },
]

export const TRANSACTION_TYPES = [
  { value: 'SALE', label: 'Bán' },
  { value: 'RENT', label: 'Cho thuê' },
]

export const STATUSES = [
  { value: 'AVAILABLE', label: 'Còn trống' },
  { value: 'RESERVED', label: 'Đang giữ chỗ' },
  { value: 'SOLD', label: 'Đã bán' },
  { value: 'RENTED', label: 'Đã thuê' },
]

export const DIRECTIONS = [
  { value: 'DONG', label: 'Đông' }, { value: 'TAY', label: 'Tây' },
  { value: 'NAM', label: 'Nam' }, { value: 'BAC', label: 'Bắc' },
  { value: 'DONG_BAC', label: 'Đông Bắc' }, { value: 'TAY_BAC', label: 'Tây Bắc' },
  { value: 'DONG_NAM', label: 'Đông Nam' }, { value: 'TAY_NAM', label: 'Tây Nam' },
]
