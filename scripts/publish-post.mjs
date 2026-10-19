// Đăng/cập nhật bài viết từ file Markdown có front matter.
//
//   npm run post:local   -- content/posts/mat-ong.md   (D1 local)
//   npm run post:publish -- content/posts/mat-ong.md   (D1 thật)
//   npm run post:publish -- --all                      (đăng lại mọi bài trong content/posts)
//
// Front matter (giữa hai dòng ---): slug, title, excerpt, category, cover, author
// Markdown được render sẵn thành HTML ở đây (cột content_html) để Worker không
// phải parse lúc phục vụ, giữ CPU mỗi request dưới giới hạn gói miễn phí.
import { execSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { marked } from 'marked'

const DB = 'matongduoclieu-db'
const CATEGORIES = ['mat-ong', 'duoc-lieu']
const POSTS_DIR = 'content/posts'

const args = process.argv.slice(2)
const remote = args.includes('--remote')
const files = args.includes('--all')
  ? readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).map((f) => join(POSTS_DIR, f))
  : args.filter((a) => !a.startsWith('--'))
if (!files.length) {
  console.error('Usage: node scripts/publish-post.mjs <file.md>... | --all [--remote]')
  process.exit(1)
}

const q = (s) => (s ? `'${s.replaceAll("'", "''")}'` : 'NULL')

function toSql(file) {
  const raw = readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error(`${file}: thiếu front matter`)

  const meta = Object.fromEntries(
    match[1]
      .split('\n')
      .filter((line) => line.includes(':'))
      .map((line) => {
        const i = line.indexOf(':')
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
      })
  )
  for (const key of ['slug', 'title', 'excerpt', 'category']) {
    if (!meta[key]) throw new Error(`${file}: thiếu "${key}" trong front matter`)
  }
  if (!CATEGORIES.includes(meta.category)) throw new Error(`category phải là một trong: ${CATEGORIES.join(', ')}`)

  const content = match[2].trim()
  const html = marked.parse(content)
  const sql = `INSERT INTO posts (slug, title, excerpt, content_md, content_html, category, cover_key, author, published, published_at)
VALUES (${q(meta.slug)}, ${q(meta.title)}, ${q(meta.excerpt)}, ${q(content)}, ${q(html)}, ${q(meta.category)}, ${q(meta.cover)}, ${q(meta.author)}, 1, datetime('now'))
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  excerpt = excluded.excerpt,
  content_md = excluded.content_md,
  content_html = excluded.content_html,
  category = excluded.category,
  cover_key = excluded.cover_key,
  author = excluded.author,
  -- Chỉ đổi ngày cập nhật khi nội dung thực sự thay đổi
  updated_at = CASE
    WHEN posts.content_md IS NOT excluded.content_md OR posts.title IS NOT excluded.title
      OR posts.excerpt IS NOT excluded.excerpt THEN datetime('now')
    ELSE posts.updated_at END;
`
  return { title: meta.title, sql }
}

// D1 thỉnh thoảng trả lỗi tạm thời: thử lại vài lần
function execute(sqlFile) {
  const cmd = `npx wrangler d1 execute ${DB} ${remote ? '--remote' : '--local'} --file="${sqlFile}"`
  for (let attempt = 1; ; attempt++) {
    try {
      return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] })
    } catch (err) {
      if (attempt >= 3) throw err
      console.warn(`  D1 lỗi, thử lại (${attempt})...`)
    }
  }
}

const dir = mkdtempSync(join(tmpdir(), 'post-'))
for (const file of files) {
  const { title, sql } = toSql(file)
  const sqlFile = join(dir, 'post.sql')
  writeFileSync(sqlFile, sql)
  execute(sqlFile)
  console.log(`✔ Đã đăng "${title}" lên D1 ${remote ? 'thật' : 'local'}`)
}
