// Đăng/cập nhật bài viết từ file Markdown có front matter.
//
//   npm run post:local   -- content/posts/mat-ong.md   (D1 local)
//   npm run post:publish -- content/posts/mat-ong.md   (D1 thật + xoá cache KV)
//
// Front matter (giữa hai dòng ---): slug, title, excerpt, category, cover, author
import { execSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const DB = 'matongduoclieu-db'
const CATEGORIES = ['mat-ong', 'duoc-lieu']

const args = process.argv.slice(2)
const file = args.find((a) => !a.startsWith('--'))
const remote = args.includes('--remote')
if (!file) {
  console.error('Usage: node scripts/publish-post.mjs <file.md> [--remote]')
  process.exit(1)
}

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
const content = match[2].trim()

for (const key of ['slug', 'title', 'excerpt', 'category']) {
  if (!meta[key]) throw new Error(`${file}: thiếu "${key}" trong front matter`)
}
if (!CATEGORIES.includes(meta.category)) throw new Error(`category phải là một trong: ${CATEGORIES.join(', ')}`)

const q = (s) => (s ? `'${s.replaceAll("'", "''")}'` : 'NULL')
const sql = `INSERT INTO posts (slug, title, excerpt, content_md, category, cover_key, author, published, published_at)
VALUES (${q(meta.slug)}, ${q(meta.title)}, ${q(meta.excerpt)}, ${q(content)}, ${q(meta.category)}, ${q(meta.cover)}, ${q(meta.author)}, 1, datetime('now'))
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  excerpt = excluded.excerpt,
  content_md = excluded.content_md,
  category = excluded.category,
  cover_key = excluded.cover_key,
  author = excluded.author,
  updated_at = datetime('now');
`

const sqlFile = join(mkdtempSync(join(tmpdir(), 'post-')), 'post.sql')
writeFileSync(sqlFile, sql)

const run = (cmd) => execSync(cmd, { stdio: ['ignore', 'pipe', 'inherit'] }).toString()

run(`npx wrangler d1 execute ${DB} ${remote ? '--remote' : '--local'} --file="${sqlFile}"`)
console.log(`✔ Đã đăng "${meta.title}" lên D1 ${remote ? 'thật' : 'local'}`)

if (remote) {
  // Xoá cache HTML các trang có hiển thị bài này
  const kvId = readFileSync('wrangler.jsonc', 'utf8').match(/"binding":\s*"CACHE",\s*"id":\s*"([^"]+)"/)?.[1]
  const paths = ['/', '/bai-viet', `/bai-viet/${meta.slug}`, `/chu-de/${meta.category}`]
  for (const path of paths) {
    run(`npx wrangler kv key delete "page:${path}" --namespace-id ${kvId} --remote`)
  }
  console.log(`✔ Đã xoá cache: ${paths.join(', ')}`)
}
