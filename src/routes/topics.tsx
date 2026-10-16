import { Hono } from 'hono'
import { PostGrid } from '../components/Cards'
import { getCategory } from '../lib/categories'
import { listPosts } from '../lib/db'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// /chu-de/:slug: danh sách bài viết theo chuyên mục
app.get('/:slug', async (c) => {
  const category = getCategory(c.req.param('slug'))
  if (!category) return c.notFound()

  const posts = await listPosts(c.env.DB, 100, category.slug)
  return c.render(
    <>
      <h1>{category.name}</h1>
      <p class="lead">{category.description}</p>
      <PostGrid posts={posts} />
    </>,
    {
      title: category.name,
      description: category.description,
      breadcrumbs: [
        { name: 'Trang chủ', path: '/' },
        { name: category.name, path: `/chu-de/${category.slug}` },
      ],
    }
  )
})

export default app
