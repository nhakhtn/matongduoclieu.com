import { Hono } from 'hono'
import { FeaturedPost, PostList, ProductGrid } from '../components/Cards'
import { listPosts, listProductCategories, listProducts } from '../lib/db'
import { mediaUrl } from '../lib/format'
import { productsEnabled } from '../lib/site-config'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

const AFFILIATE_NOTE =
  'Một số liên kết trên trang là liên kết tiếp thị Shopee: khi bạn mua qua liên kết này, chúng tôi có thể nhận hoa hồng mà giá bạn trả không thay đổi.'

app.get('/', async (c) => {
  const categories = c.get('nav').postCategories
  const site = c.get('site')
  const productCount = productsEnabled(site) ? Math.max(0, Number.parseInt(site.home_products, 10) || 0) : 0
  const [latest, products, ...byCategory] = await Promise.all([
    listPosts(c.env.DB, 1),
    listProducts(c.env.DB),
    ...categories.map((cat) => listPosts(c.env.DB, 5, cat.slug)),
  ])
  const featured = latest[0]
  const [first, second] = categories
  return c.render(
    <>
      <section class="hero">
        <div class="hero-text">
          {site.hero_eyebrow && <p class="eyebrow">{site.hero_eyebrow}</p>}
          <h1>{site.hero_title || site.name}</h1>
          {site.hero_lead && <p class="hero-lead">{site.hero_lead}</p>}
          <div class="hero-actions">
            {first && (
              <a class="btn" href={`/chu-de/${first.slug}`}>
                Tìm hiểu {first.name.toLowerCase()}
              </a>
            )}
            {second && (
              <a class="btn btn-outline" href={`/chu-de/${second.slug}`}>
                Tìm hiểu {second.name.toLowerCase()}
              </a>
            )}
          </div>
        </div>
        {site.hero_image_key && (
          <div class="hero-image">
            <img src={mediaUrl(site.hero_image_key)} alt={site.hero_image_alt} />
          </div>
        )}
      </section>

      {featured && (
        <section>
          <div class="section-head">
            <h2>Bài mới nhất</h2>
          </div>
          <FeaturedPost post={featured} />
        </section>
      )}

      <section class="topic-columns">
        {categories.map((cat, i) => (
          <div class="topic-column">
            <div class="section-head">
              <h2>{cat.name}</h2>
              <a href={`/chu-de/${cat.slug}`}>Xem tất cả ›</a>
            </div>
            <PostList posts={byCategory[i]} />
          </div>
        ))}
      </section>

      {productCount > 0 && products.length > 0 && (
        <section>
          <div class="section-head">
            <h2>Sản phẩm</h2>
            <a href="/san-pham">Xem tất cả ›</a>
          </div>
          <ProductGrid products={products.slice(0, productCount)} />
        </section>
      )}
    </>,
    { description: site.home_description, image: site.hero_image_key ? mediaUrl(site.hero_image_key) : undefined }
  )
})

app.get('/san-pham', async (c) => {
  if (!productsEnabled(c.get('site'))) return c.notFound()
  const [products, categories] = await Promise.all([listProducts(c.env.DB), listProductCategories(c.env.DB)])
  // Nhóm theo danh mục; sản phẩm thuộc danh mục không còn tồn tại xếp vào "Khác"
  const known = new Set(categories.map((cat) => cat.slug))
  const groups = [
    ...categories.map((cat) => ({ name: cat.name, items: products.filter((p) => p.category === cat.slug) })),
    { name: 'Khác', items: products.filter((p) => !known.has(p.category)) },
  ].filter((g) => g.items.length)

  return c.render(
    <>
      <h1>Sản phẩm</h1>
      <p class="lead">Các sản phẩm mật ong và dược liệu được chúng tôi lựa chọn.</p>
      {groups.length ? (
        groups.map((g) => (
          <section class="product-group">
            <h2>{g.name}</h2>
            <ProductGrid products={g.items} />
          </section>
        ))
      ) : (
        <p class="empty">Sản phẩm đang được cập nhật.</p>
      )}
      <p class="disclosure">{AFFILIATE_NOTE}</p>
    </>,
    {
      title: 'Sản phẩm',
      description: 'Sản phẩm mật ong và dược liệu chọn lọc.',
      breadcrumbs: [
        { name: 'Trang chủ', path: '/' },
        { name: 'Sản phẩm', path: '/san-pham' },
      ],
    }
  )
})

export default app
