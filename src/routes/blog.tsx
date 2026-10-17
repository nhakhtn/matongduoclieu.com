import { Hono } from 'hono'
import { raw } from 'hono/html'
import { marked } from 'marked'
import { PostGrid, ProductGrid } from '../components/Cards'
import { getCategory } from '../lib/categories'
import { getPost, listPosts, listProducts } from '../lib/db'
import { formatDate, mediaUrl } from '../lib/format'
import { articleJsonLd } from '../lib/seo'
import { OWNER } from '../lib/site'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', async (c) => {
  const posts = await listPosts(c.env.DB, 100)
  return c.render(
    <>
      <h1>Tất cả bài viết</h1>
      <PostGrid posts={posts} />
    </>,
    {
      title: 'Bài viết',
      description: 'Tất cả bài viết về mật ong và dược liệu.',
      breadcrumbs: [
        { name: 'Trang chủ', path: '/' },
        { name: 'Bài viết', path: '/bai-viet' },
      ],
    }
  )
})

app.get('/:slug', async (c) => {
  const post = await getPost(c.env.DB, c.req.param('slug'))
  if (!post) return c.notFound()

  const category = getCategory(post.category)
  const [related, products] = await Promise.all([
    listPosts(c.env.DB, 4, post.category),
    listProducts(c.env.DB, post.category),
  ])

  // Nội dung do quản trị viên viết nên được tin cậy; nếu sau này cho người dùng
  // nhập Markdown thì cần lọc HTML trước khi render.
  const html = await marked.parse(post.content_md)
  const updated = formatDate(post.updated_at) !== formatDate(post.published_at)

  return c.render(
    <>
      <article class="post">
        <header class="post-header">
          <h1>{post.title}</h1>
          <p class="post-meta">
            Tác giả:{' '}
            {post.author && post.author !== OWNER.name ? (
              post.author
            ) : (
              <a href="/gioi-thieu#tac-gia">{OWNER.name}</a>
            )}{' '}
            ·
            Đăng ngày <time datetime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
            {updated && <> · Cập nhật {formatDate(post.updated_at)}</>}
          </p>
        </header>
        <div class="prose">{raw(html)}</div>
      </article>

      {products.length > 0 && (
        <section class="related">
          <h2>Sản phẩm liên quan</h2>
          <ProductGrid products={products.slice(0, 3)} />
        </section>
      )}

      {related.filter((p) => p.slug !== post.slug).length > 0 && (
        <section class="related">
          <h2>Bài viết cùng chủ đề</h2>
          <PostGrid posts={related.filter((p) => p.slug !== post.slug).slice(0, 3)} />
        </section>
      )}
    </>,
    {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      section: `/chu-de/${post.category}`,
      image: post.cover_key ? mediaUrl(post.cover_key) : undefined,
      jsonLd: [articleJsonLd(c.env.SITE_URL, post)],
      breadcrumbs: [
        { name: 'Trang chủ', path: '/' },
        ...(category ? [{ name: category.name, path: `/chu-de/${category.slug}` }] : []),
        { name: post.title, path: `/bai-viet/${post.slug}` },
      ],
    }
  )
})

export default app
