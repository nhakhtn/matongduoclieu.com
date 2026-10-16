export type Post = {
  id: number
  slug: string
  title: string
  excerpt: string
  content_md: string
  cover_key: string | null
  category: string
  author: string | null
  published_at: string | null
  updated_at: string
}

export type Product = {
  id: number
  slug: string
  name: string
  summary: string
  description_md: string
  price: number | null
  image_key: string | null
  image_url: string | null
  buy_url: string | null
  category: string
}

const POST_COLUMNS = 'id, slug, title, excerpt, content_md, cover_key, category, author, published_at, updated_at'
const PRODUCT_COLUMNS = 'id, slug, name, summary, description_md, price, image_key, image_url, buy_url, category'

export async function listPosts(db: D1Database, limit = 20, category?: string): Promise<Post[]> {
  const where = category ? 'published = 1 AND category = ?' : 'published = 1'
  const stmt = db.prepare(`SELECT ${POST_COLUMNS} FROM posts WHERE ${where} ORDER BY published_at DESC LIMIT ?`)
  const { results } = await (category ? stmt.bind(category, limit) : stmt.bind(limit)).all<Post>()
  return results
}

export function getPost(db: D1Database, slug: string): Promise<Post | null> {
  return db
    .prepare(`SELECT ${POST_COLUMNS} FROM posts WHERE slug = ? AND published = 1`)
    .bind(slug)
    .first<Post>()
}

export async function listProducts(db: D1Database, category?: string): Promise<Product[]> {
  const where = category ? 'active = 1 AND category = ?' : 'active = 1'
  const stmt = db.prepare(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE ${where} ORDER BY sort_order, id`)
  const { results } = await (category ? stmt.bind(category) : stmt).all<Product>()
  return results
}

/** Tăng lượt bấm và trả về link mua của sản phẩm. */
export async function recordProductClick(db: D1Database, slug: string): Promise<string | null> {
  const row = await db
    .prepare('UPDATE products SET clicks = clicks + 1 WHERE slug = ? AND active = 1 AND buy_url IS NOT NULL RETURNING buy_url')
    .bind(slug)
    .first<{ buy_url: string }>()
  return row?.buy_url ?? null
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
