import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import { kvPageCache } from './lib/cache'
import { listPosts } from './lib/db'
import { renderer } from './renderer'
import blog from './routes/blog'
import contact from './routes/contact'
import media from './routes/media'
import pages from './routes/pages'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use(secureHeaders())
app.route('/media', media)

app.use('*', renderer)
for (const path of ['/', '/san-pham', '/bai-viet', '/bai-viet/*']) {
  app.use(path, kvPageCache())
}

app.route('/', pages)
app.route('/bai-viet', blog)
app.route('/lien-he', contact)

app.get('/sitemap.xml', async (c) => {
  const base = c.env.SITE_URL
  const posts = await listPosts(c.env.DB, 1000)
  const paths = ['/', '/gioi-thieu', '/san-pham', '/bai-viet', '/lien-he', ...posts.map((p) => `/bai-viet/${p.slug}`)]
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paths.map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n') +
    '\n</urlset>'
  return c.body(body, 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

app.notFound((c) => {
  c.status(404)
  return c.render(
    <>
      <h1>Không tìm thấy trang</h1>
      <p>
        <a href="/">Về trang chủ</a>
      </p>
    </>,
    { title: 'Không tìm thấy' }
  )
})

export default app
