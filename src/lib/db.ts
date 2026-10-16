export type Post = {
  id: number
  slug: string
  title: string
  excerpt: string
  content_md: string
  cover_key: string | null
  published_at: string | null
}

export type Product = {
  id: number
  slug: string
  name: string
  summary: string
  description_md: string
  price: number | null
  image_key: string | null
}

export async function listPosts(db: D1Database, limit = 20): Promise<Post[]> {
  const { results } = await db
    .prepare(
      `SELECT id, slug, title, excerpt, content_md, cover_key, published_at
       FROM posts WHERE published = 1
       ORDER BY published_at DESC LIMIT ?`
    )
    .bind(limit)
    .all<Post>()
  return results
}

export function getPost(db: D1Database, slug: string): Promise<Post | null> {
  return db
    .prepare(
      `SELECT id, slug, title, excerpt, content_md, cover_key, published_at
       FROM posts WHERE slug = ? AND published = 1`
    )
    .bind(slug)
    .first<Post>()
}

export async function listProducts(db: D1Database): Promise<Product[]> {
  const { results } = await db
    .prepare(
      `SELECT id, slug, name, summary, description_md, price, image_key
       FROM products WHERE active = 1 ORDER BY sort_order, id`
    )
    .all<Product>()
  return results
}

export async function createContact(
  db: D1Database,
  data: { name: string; phone: string; message: string }
): Promise<void> {
  await db
    .prepare('INSERT INTO contacts (name, phone, message) VALUES (?, ?, ?)')
    .bind(data.name, data.phone, data.message)
    .run()
}
