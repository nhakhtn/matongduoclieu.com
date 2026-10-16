import { Hono } from 'hono'
import type { Context } from 'hono'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { listContacts } from '../lib/db'
import { formatDate } from '../lib/format'

type Env = { Bindings: CloudflareBindings }

const app = new Hono<Env>()

const COOKIE = 'qt_session'
const SESSION_DAYS = 7
const MAX_FAILS = 10
const LOCK_SECONDS = 15 * 60

// trim(): giá trị nhập qua pipe trên Windows có thể kèm dấu xuống dòng
const adminPassword = (c: Context<Env>) => c.env.ADMIN_PASSWORD?.trim() || null

// So sánh thời gian không đổi để không lộ thông tin qua tốc độ phản hồi
const safeEqual = (a: string, b: string) => {
  const x = new TextEncoder().encode(a)
  const y = new TextEncoder().encode(b)
  let diff = x.length ^ y.length
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0)
  return diff === 0
}

const failKey = (c: Context<Env>) => `login-fail:${c.req.header('cf-connecting-ip') ?? 'unknown'}`

// Cookie được ký bằng mật khẩu: đổi mật khẩu là mọi phiên cũ hết hiệu lực
async function isLoggedIn(c: Context<Env>, password: string) {
  const value = await getSignedCookie(c, password, COOKIE)
  return typeof value === 'string' && Number(value) > Date.now()
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
  const password = adminPassword(c)
  if (password && (await isLoggedIn(c, password))) return c.redirect('/quan-tri/lien-he')
  return c.render(<LoginForm error={password ? undefined : 'Chưa cấu hình mật khẩu quản trị.'} />, {
    title: 'Đăng nhập quản trị',
    noindex: true,
  })
})

app.post('/dang-nhap', async (c) => {
  const password = adminPassword(c)
  const render = (error: string, status: 401 | 429 | 503) => {
    c.status(status)
    return c.render(<LoginForm error={error} />, { title: 'Đăng nhập quản trị', noindex: true })
  }
  if (!password) return render('Chưa cấu hình mật khẩu quản trị.', 503)

  const key = failKey(c)
  const fails = Number((await c.env.CACHE.get(key)) ?? 0)
  if (fails >= MAX_FAILS) return render('Sai mật khẩu quá nhiều lần. Vui lòng thử lại sau 15 phút.', 429)

  const form = await c.req.parseBody()
  if (!safeEqual(String(form.password ?? ''), password)) {
    await c.env.CACHE.put(key, String(fails + 1), { expirationTtl: LOCK_SECONDS })
    return render('Mật khẩu không đúng.', 401)
  }

  await c.env.CACHE.delete(key)
  await setSignedCookie(c, COOKIE, String(Date.now() + SESSION_DAYS * 86400_000), password, {
    path: '/quan-tri',
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: SESSION_DAYS * 86400,
  })
  return c.redirect('/quan-tri/lien-he', 303)
})

app.post('/dang-xuat', (c) => {
  deleteCookie(c, COOKIE, { path: '/quan-tri', secure: true })
  return c.redirect('/quan-tri/dang-nhap', 303)
})

// Các trang còn lại yêu cầu đã đăng nhập
app.use('*', async (c, next) => {
  const password = adminPassword(c)
  if (!password || !(await isLoggedIn(c, password))) return c.redirect('/quan-tri/dang-nhap')
  await next()
})

app.get('/', (c) => c.redirect('/quan-tri/lien-he'))

app.get('/lien-he', async (c) => {
  const contacts = await listContacts(c.env.DB, 200)
  return c.render(
    <>
      <div class="admin-bar">
        <h1>Lời nhắn liên hệ</h1>
        <form method="post" action="/quan-tri/dang-xuat">
          <button class="btn btn-outline" type="submit">
            Đăng xuất
          </button>
        </form>
      </div>
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
