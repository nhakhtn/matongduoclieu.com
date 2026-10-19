// Trang quản trị: tải ảnh lên R2 (thu nhỏ + WebP ngay trên trình duyệt) và nút sao chép.
(() => {
  const MAX_WIDTH = 1600
  const QUALITY = 0.82

  // Thu nhỏ ảnh về rộng tối đa MAX_WIDTH và mã hoá WebP (JPEG nếu trình duyệt không hỗ trợ WebP).
  // GIF giữ nguyên để không mất hiệu ứng động.
  async function prepareImage(file) {
    if (file.type === 'image/gif') return { blob: file, width: '', height: '' }
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_WIDTH / bitmap.width)
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()
    let blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', QUALITY))
    if (!blob || blob.type !== 'image/webp') blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.85))
    return { blob, width: String(width), height: String(height) }
  }

  async function upload(file) {
    const { blob, width, height } = await prepareImage(file)
    const data = new FormData()
    data.append('file', blob, file.name)
    data.append('name', file.name)
    data.append('width', width)
    data.append('height', height)
    const res = await fetch('/quan-tri/anh/tai-len', { method: 'POST', body: data, credentials: 'same-origin' })
    const json = await res.json().catch(() => ({ error: `Lỗi máy chủ (${res.status})` }))
    if (!res.ok || json.error) throw new Error(json.error || `Lỗi ${res.status}`)
    return json
  }

  // Chèn đoạn văn bản vào textarea tại vị trí con trỏ
  function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart ?? textarea.value.length
    const end = textarea.selectionEnd ?? start
    const before = textarea.value.slice(0, start)
    const block = (before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '') + text + '\n\n'
    textarea.setRangeText(block, start, end, 'end')
    textarea.focus()
  }

  // <div class="upload-widget" data-mode="key|url|markdown|library" data-target="tên ô input">
  for (const widget of document.querySelectorAll('.upload-widget')) {
    const input = widget.querySelector('input[type=file]')
    const status = widget.querySelector('.upload-status')
    const mode = widget.dataset.mode
    const target = widget.dataset.target && document.querySelector(`[name="${widget.dataset.target}"]`)
    const preview = widget.querySelector('.upload-preview')

    input.addEventListener('change', async () => {
      const files = [...input.files]
      if (!files.length) return
      input.disabled = true
      try {
        for (const [i, file] of files.entries()) {
          status.textContent = `Đang xử lý ${files.length > 1 ? `${i + 1}/${files.length}: ` : ''}${file.name}...`
          const result = await upload(file)
          if (mode === 'key' && target) target.value = result.key
          if (mode === 'url' && target) target.value = result.url
          if (mode === 'markdown' && target) insertAtCursor(target, result.snippet)
          if (preview) {
            preview.src = result.url
            preview.hidden = false
          }
        }
        status.textContent = mode === 'markdown' ? 'Đã chèn ảnh vào nội dung. Nhớ sửa chú thích.' : 'Đã tải lên.'
        if (mode === 'library') location.reload()
      } catch (err) {
        status.textContent = `Lỗi: ${err.message}`
      } finally {
        input.disabled = false
        input.value = ''
      }
    })
  }

  // Nút sao chép (thư viện ảnh)
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]')
    if (!btn) return
    await navigator.clipboard.writeText(btn.dataset.copy)
    const label = btn.textContent
    btn.textContent = 'Đã chép!'
    setTimeout(() => (btn.textContent = label), 1500)
  })

  // Xem trước ảnh bìa khi gõ key tay
  for (const field of document.querySelectorAll('[data-preview-for]')) {
    const img = document.getElementById(field.dataset.previewFor)
    field.addEventListener('change', () => {
      const v = field.value.trim()
      img.hidden = !v
      if (v) img.src = /^https?:\/\//.test(v) ? v : `/media/${v.split('/').map(encodeURIComponent).join('/')}`
    })
  }
})()
