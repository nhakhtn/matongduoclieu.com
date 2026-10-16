import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { listContacts } from '../lib/db'
import { formatDate } from '../lib/format'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Đăng nhập bằng tài khoản "admin" và mật khẩu lưu trong secret ADMIN_PASSWORD
app.use('*', async (c, next) => {
  c.header('X-Robots-Tag', 'noindex, nofollow')
  c.header('Cache-Control', 'no-store')
  // trim(): giá trị nhập qua pipe trên Windows có thể kèm dấu xuống dòng
  const password = c.env.ADMIN_PASSWORD?.trim()
  if (!password) return c.text('Chưa cấu hình mật khẩu quản trị (ADMIN_PASSWORD).', 503)
  return basicAuth({ username: 'admin', password, realm: 'Quan tri' })(c, next)
})

app.get('/', (c) => c.redirect('/quan-tri/lien-he'))

app.get('/lien-he', async (c) => {
  const contacts = await listContacts(c.env.DB, 200)
  return c.render(
    <>
      <h1>Lời nhắn liên hệ</h1>
      <p class="lead">{contacts.length ? `${contacts.length} lời nhắn gần nhất.` : 'Chưa có lời nhắn nào.'}</p>
      <div class="contact-table">
        {contacts.map((m) => (
          <article class="card contact-item">
            <div class="contact-head">
              <strong>{m.name}</strong>
              <time datetime={m.created_at}>{formatDate(m.created_at)} {m.created_at.slice(11, 16)} UTC</time>
            </div>
            <p>
              <a href={`tel:${m.phone}`}>{m.phone}</a> ·{' '}
              <a href={`https://zalo.me/${m.phone}`} target="_blank" rel="noopener">
                Zalo
              </a>
            </p>
            {m.message && <p class="contact-message">{m.message}</p>}
          </article>
        ))}
      </div>
    </>,
    { title: 'Quản trị: Liên hệ', noindex: true }
  )
})

export default app
