const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

export const formatPrice = (price: number | null) => (price == null ? 'Liên hệ' : vnd.format(price))

// D1 lưu datetime('now') dạng "YYYY-MM-DD HH:MM:SS" theo UTC
export const formatDate = (value: string | null) =>
  value
    ? new Date(value.replace(' ', 'T') + 'Z').toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : ''

export const mediaUrl = (key: string) => `/media/${key.split('/').map(encodeURIComponent).join('/')}`
