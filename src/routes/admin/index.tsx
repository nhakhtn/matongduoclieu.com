import { Hono } from 'hono'
import type { Context } from 'hono'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { getSetting, hashPassword, newSessionKey, setSettings, verifyPassword } from '../../lib/auth'
import { listContacts } from '../../lib/db'
import { formatDate } from '../../lib/format'
import pagesAdmin from './pages'
import postCategoriesAdmin from './post-categories'
import postsAdmin from './posts'
import productCategoriesAdmin from './product-categories'
import productsAdmin from './products'
import { AdminShell } from './ui'

type Env = { Bindings: CloudflareBindings }

const app = new Hono<Env>()

const COOKIE = 'qt_session'
const SESSION_DAYS = 7
const MAX_FAILS = 10
const LOCK_SECONDS = 15 * 60
const MIN_LENGTH = 10

const failKey = (c: Context<Env>) => `login-fail:${c.req.header('cf-connecting-ip') ?? 'unknown'}`

// Khoá ký cookie nằm trong DB và được tạo lại khi đổi mật khẩu,
// nên đổi mật khẩu là mọi phiên cũ hết hiệu lực
async function isLoggedIn(c: Context<Env>) {
  const sessionKey = await getSetting(c.env.DB, 'session_key')
  if (!sessionKey) return false
  const value = await getSignedCookie(c, sessionKey, COOKIE)
  return typeof value === 'string' && Number(value) > Date.now()
}

async function startSession(c: Context<Env>, sessionKey: string) {
  await setSignedCookie(c, COOKIE, String(Date.now() + SESSION_DAYS * 86400_000), sessionKey, {
    path: '/quan-tri',
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: SESSION_DAYS * 86400,
  })
}

app.use('*', async (c, next) => {
  c.header('X-Robots-Tag', 'noindex, nofollow')
  c.header('Cache-Control', 'no-store')
  await next()
})

const LoginForm = ({ error }: { error?: string }) => (
  <section class="login-box">
    <h1>Đăng nhập quản trị</h1>
    {error && <p class="notice error">{error}</p>}
    <form method="post" action="/quan-tri/dang-nhap" class="form">
      <label>
        Mật khẩu
        <input type="password" name="password" required autofocus autocomplete="current-password" />
      </label>
      <button class="btn" type="submit">
        Đăng nhập
      </button>
    </form>
  </section>
)

app.get('/dang-nhap', async (c) => {
  if (await isLoggedIn(c)) return c.redirect('/quan-tri/bai-viet')
  const configured = await getSetting(c.env.DB, 'admin_password_hash')
  return c.render(<LoginForm error={configured ? undefined : 'Chưa cấu hình mật khẩu quản trị.'} />, {
    title: 'Đăng nhập quản trị',
    noindex: true,
  })
})

app.post('/dang-nhap', async (c) => {
  const render = (error: string, status: 401 | 429 | 503) => {
    c.status(status)
    return c.render(<LoginForm error={error} />, { title: 'Đăng nhập quản trị', noindex: true })
  }
  const [hash, sessionKey] = await Promise.all([
    getSetting(c.env.DB, 'admin_password_hash'),
    getSetting(c.env.DB, 'session_key'),
  ])
  if (!hash || !sessionKey) return render('Chưa cấu hình mật khẩu quản trị.', 503)

  const key = failKey(c)
  const fails = Number((await c.env.CACHE.get(key)) ?? 0)
  if (fails >= MAX_FAILS) return render('Sai mật khẩu quá nhiều lần. Vui lòng thử lại sau 15 phút.', 429)

  const form = await c.req.parseBody()
  if (!(await verifyPassword(String(form.password ?? ''), hash))) {
    await c.env.CACHE.put(key, String(fails + 1), { expirationTtl: LOCK_SECONDS })
    return render('Mật khẩu không đúng.', 401)
  }

  await c.env.CACHE.delete(key)
  await startSession(c, sessionKey)
  return c.redirect('/quan-tri/bai-viet', 303)
})

app.post('/dang-xuat', (c) => {
  deleteCookie(c, COOKIE, { path: '/quan-tri', secure: true })
  return c.redirect('/quan-tri/dang-nhap', 303)
})

// Các trang còn lại yêu cầu đã đăng nhập
app.use('*', async (c, next) => {
  if (!(await isLoggedIn(c))) return c.redirect('/quan-tri/dang-nhap')
  await next()
})

app.get('/', (c) => c.redirect('/quan-tri/bai-viet'))

app.get('/lien-he', async (c) => {
  const contacts = await listContacts(c.env.DB, 200)
  return c.render(
    <AdminShell title="Lời nhắn liên hệ" active="/quan-tri/lien-he">
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
    </AdminShell>,
    { title: 'Quản trị: Liên hệ', noindex: true }
  )
})

const PasswordPage = ({ error, ok }: { error?: string; ok?: boolean }) => (
  <AdminShell title="Đổi mật khẩu" active="/quan-tri/doi-mat-khau">
    <section class="admin-form">
      {ok && <p class="notice success">Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.</p>}
      {error && <p class="notice error">{error}</p>}
      <form method="post" action="/quan-tri/doi-mat-khau" class="form">
        <label>
          Mật khẩu hiện tại
          <input type="password" name="current" required autocomplete="current-password" />
        </label>
        <label>
          Mật khẩu mới (ít nhất {MIN_LENGTH} ký tự)
          <input type="password" name="next" required minlength={MIN_LENGTH} autocomplete="new-password" />
        </label>
        <label>
          Nhập lại mật khẩu mới
          <input type="password" name="confirm" required minlength={MIN_LENGTH} autocomplete="new-password" />
        </label>
        <button class="btn" type="submit">
          Đổi mật khẩu
        </button>
      </form>
    </section>
  </AdminShell>
)

app.get('/doi-mat-khau', (c) =>
  c.render(<PasswordPage ok={c.req.query('ok') === '1'} />, { title: 'Đổi mật khẩu', noindex: true })
)

app.post('/doi-mat-khau', async (c) => {
  const render = (error: string) => {
    c.status(400)
    return c.render(<PasswordPage error={error} />, { title: 'Đổi mật khẩu', noindex: true })
  }
  const form = await c.req.parseBody()
  const current = String(form.current ?? '')
  const next = String(form.next ?? '')
  const hash = await getSetting(c.env.DB, 'admin_password_hash')

  if (!hash || !(await verifyPassword(current, hash))) return render('Mật khẩu hiện tại không đúng.')
  if (next.length < MIN_LENGTH) return render(`Mật khẩu mới phải có ít nhất ${MIN_LENGTH} ký tự.`)
  if (next !== String(form.confirm ?? '')) return render('Hai lần nhập mật khẩu mới không khớp.')

  const sessionKey = newSessionKey()
  await setSettings(c.env.DB, { admin_password_hash: await hashPassword(next), session_key: sessionKey })
  await startSession(c, sessionKey) // giữ đăng nhập trên thiết bị đang dùng
  return c.redirect('/quan-tri/doi-mat-khau?ok=1', 303)
})

app.route('/bai-viet', postsAdmin)
app.route('/chuyen-muc', postCategoriesAdmin)
app.route('/san-pham', productsAdmin)
app.route('/danh-muc-san-pham', productCategoriesAdmin)
app.route('/trang', pagesAdmin)

export default app
