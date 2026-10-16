import { Hono } from 'hono'
import type { Product } from '../lib/db'
import { listPosts, listProducts } from '../lib/db'
import { formatPrice, mediaUrl } from '../lib/format'

const app = new Hono<{ Bindings: CloudflareBindings }>()

const ProductCard = ({ product }: { product: Product }) => (
  <article class="card">
    {product.image_key && <img src={mediaUrl(product.image_key)} alt={product.name} loading="lazy" />}
    <h3>{product.name}</h3>
    <p>{product.summary}</p>
    <strong>{formatPrice(product.price)}</strong>
  </article>
)

app.get('/', async (c) => {
  const [posts, products] = await Promise.all([listPosts(c.env.DB, 3), listProducts(c.env.DB)])
  return c.render(
    <>
      <section class="hero">
        <h1>{c.env.SITE_NAME}</h1>
        <p>Thông tin và sản phẩm về mật ong và dược liệu Việt Nam.</p>
        <a class="btn" href="/lien-he">
          Liên hệ đặt hàng
        </a>
      </section>

      <h2>Sản phẩm</h2>
      <div class="grid">
        {products.slice(0, 3).map((p) => (
          <ProductCard product={p} />
        ))}
      </div>

      <h2>Bài viết mới</h2>
      <ul class="post-list">
        {posts.map((p) => (
          <li>
            <a href={`/bai-viet/${p.slug}`}>{p.title}</a>
          </li>
        ))}
      </ul>
    </>,
    { description: 'Kiến thức và sản phẩm về mật ong và dược liệu Việt Nam.' }
  )
})

app.get('/gioi-thieu', (c) =>
  c.render(
    <>
      <h1>Giới thiệu</h1>
      <p>Viết câu chuyện thương hiệu, nguồn gốc các sản phẩm mật ong và dược liệu tại đây.</p>
    </>,
    { title: 'Giới thiệu' }
  )
)

app.get('/san-pham', async (c) => {
  const products = await listProducts(c.env.DB)
  return c.render(
    <>
      <h1>Sản phẩm</h1>
      <div class="grid">
        {products.map((p) => (
          <ProductCard product={p} />
        ))}
      </div>
    </>,
    { title: 'Sản phẩm' }
  )
})

export default app
