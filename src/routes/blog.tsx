import { Hono } from 'hono'
import { raw } from 'hono/html'
import { marked } from 'marked'
import { getPost, listPosts } from '../lib/db'
import { formatDate, mediaUrl } from '../lib/format'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', async (c) => {
  const posts = await listPosts(c.env.DB, 50)
  return c.render(
    <>
      <h1>Bài viết</h1>
      {posts.map((p) => (
        <article class="post-item">
          <h2>
            <a href={`/bai-viet/${p.slug}`}>{p.title}</a>
          </h2>
          <time>{formatDate(p.published_at)}</time>
          <p>{p.excerpt}</p>
        </article>
      ))}
    </>,
    { title: 'Bài viết' }
  )
})

app.get('/:slug', async (c) => {
  const post = await getPost(c.env.DB, c.req.param('slug'))
  if (!post) return c.notFound()

  // Nội dung do quản trị viên viết nên được tin cậy; nếu sau này cho người dùng
  // nhập Markdown thì cần lọc HTML trước khi render.
  const html = await marked.parse(post.content_md)
  return c.render(
    <article class="post">
      <h1>{post.title}</h1>
      <time>{formatDate(post.published_at)}</time>
      {post.cover_key && <img src={mediaUrl(post.cover_key)} alt={post.title} />}
      <div class="prose">{raw(html)}</div>
    </article>,
    { title: post.title, description: post.excerpt }
  )
})

export default app
