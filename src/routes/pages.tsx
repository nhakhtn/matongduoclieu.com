import { Hono } from 'hono'
import { FeaturedPost, PostList, ProductGrid } from '../components/Cards'
import { listPosts, listProductCategories, listProducts } from '../lib/db'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

const AFFILIATE_NOTE =
  'Một số liên kết trên trang là liên kết tiếp thị Shopee: khi bạn mua qua liên kết này, chúng tôi có thể nhận hoa hồng mà giá bạn trả không thay đổi.'

app.get('/', async (c) => {
  const categories = c.get('nav').postCategories
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
          <p class="eyebrow">Lịch sử · Văn hoá · Đông y · Khoa học</p>
          <h1>{c.env.SITE_NAME}</h1>
          <p class="hero-lead">
            Những câu chuyện chuyên sâu về mật ong và các vị dược liệu quý của Việt Nam: từ nguồn gốc, văn hoá, đến
            cách dùng đúng theo y học cổ truyền và khoa học hiện đại.
          </p>
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
        <div class="hero-image">
          <img src="/media/posts/mat-ong/02-comb.webp" width="1200" height="900" alt="Cầu ong với các lỗ tổ chứa mật đã được bịt nắp sáp" />
        </div>
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

      {products.length > 0 && (
        <section>
          <div class="section-head">
            <h2>Sản phẩm</h2>
            <a href="/san-pham">Xem tất cả ›</a>
          </div>
          <ProductGrid products={products.slice(0, 4)} />
        </section>
      )}
    </>,
    { description: 'Kiến thức chuyên sâu và sản phẩm về mật ong và dược liệu Việt Nam: nhân sâm, nhung hươu, quế, linh chi…' }
  )
})

app.get('/san-pham', async (c) => {
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
