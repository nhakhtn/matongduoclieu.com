// Tạo câu lệnh SQL thêm/cập nhật một bài viết từ file Markdown.
// Dùng: node scripts/post-sql.mjs <slug> <title> <excerpt> <file.md> > post.sql
//       npx wrangler d1 execute matongduoclieu-db --remote --file=post.sql
import { readFileSync } from 'node:fs'

const [slug, title, excerpt, file] = process.argv.slice(2)
if (!slug || !title || !excerpt || !file) {
  console.error('Usage: node scripts/post-sql.mjs <slug> <title> <excerpt> <file.md>')
  process.exit(1)
}

const q = (s) => `'${s.replaceAll("'", "''")}'`
const content = readFileSync(file, 'utf8').replaceAll('\r\n', '\n').trim()

process.stdout.write(`INSERT INTO posts (slug, title, excerpt, content_md, published, published_at)
VALUES (${q(slug)}, ${q(title)}, ${q(excerpt)}, ${q(content)}, 1, datetime('now'))
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  excerpt = excluded.excerpt,
  content_md = excluded.content_md,
  updated_at = datetime('now');
`)
