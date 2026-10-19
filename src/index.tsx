import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import { CATEGORIES } from './lib/categories'
import { listPosts, recordProductClick } from './lib/db'
import { isoDate } from './lib/seo'
import { renderer } from './renderer'
import admin from './routes/admin'
import blog from './routes/blog'
import contact from './routes/contact'
import media from './routes/media'
import pages from './routes/pages'
import topics from './routes/topics'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Chuẩn hoá về một địa chỉ duy nhất: https + tên miền chính (không www).
// Giao thức của khách lấy từ header CF-Visitor do Cloudflare gắn; wrangler dev
// không có header này nên không bị chuyển hướng.
app.use(async (c, next) => {
  const url = new URL(c.req.url)
  const canonical = new URL(c.env.SITE_URL)
  const isHttp = c.req.header('cf-visitor')?.includes('"scheme":"http"') ?? false
  if (url.hostname === `www.${canonical.hostname}` || (url.hostname === canonical.hostname && isHttp)) {
    url.protocol = canonical.protocol
    url.hostname = canonical.hostname
    return c.redirect(url.toString(), 301)
  }
  await next()
})

app.use(secureHeaders())

// /gioi-thieu/ → /gioi-thieu (một số ứng dụng tự thêm dấu / cuối đường dẫn)
app.use(async (c, next) => {
  const url = new URL(c.req.url)
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '')
    return c.redirect(url.toString(), 301)
  }
  await next()
})
app.route('/media', media)

// Link mua sản phẩm: đếm lượt bấm rồi chuyển sang Shopee
app.get('/mua/:slug', async (c) => {
  const url = await recordProductClick(c.env.DB, c.req.param('slug'))
  if (!url) return c.redirect('/san-pham', 302)
  c.header('X-Robots-Tag', 'noindex, nofollow')
  return c.redirect(url, 302)
})

app.get('/favicon.ico', (c) => c.redirect('/favicon.svg', 301))

app.get('/sitemap.xml', async (c) => {
  const base = c.env.SITE_URL
  const posts = await listPosts(c.env.DB, 5000)
  const entries: { path: string; lastmod?: string }[] = [
    { path: '/' },
    ...CATEGORIES.map((cat) => ({ path: `/chu-de/${cat.slug}` })),
    { path: '/bai-viet' },
    { path: '/san-pham' },
    { path: '/gioi-thieu' },
    { path: '/chinh-sach-bien-tap' },
    { path: '/mien-tru-trach-nhiem' },
    { path: '/lien-he' },
    ...posts.map((p) => ({ path: `/bai-viet/${p.slug}`, lastmod: isoDate(p.updated_at) })),
  ]
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries
      .map((e) => `  <url><loc>${base}${e.path}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`)
      .join('\n') +
    '\n</urlset>'
  return c.body(body, 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

app.use('*', renderer)

app.route('/', pages)
app.route('/bai-viet', blog)
app.route('/chu-de', topics)
app.route('/lien-he', contact)
app.route('/quan-tri', admin)

app.notFound((c) => {
  c.status(404)
  return c.render(
    <>
      <h1>Không tìm thấy trang</h1>
      <p>
        <a href="/">Về trang chủ</a>
      </p>
    </>,
    { title: 'Không tìm thấy', noindex: true }
  )
})

export default app
