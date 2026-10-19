// Xuất repo mẫu "minhtri-blog-cloudflare" từ mã nguồn của site này.
//   npm run template:export                     (ghi ra ../minhtri-blog-cloudflare)
//   npm run template:export -- <thư mục đích>
//
// Lấy mọi file đang được git theo dõi, bỏ nội dung riêng của site (bài viết, sản phẩm, kế hoạch),
// rồi chép đè các file trong template/ (cấu hình, dữ liệu mẫu, README).
// Thư mục .git của repo mẫu được giữ nguyên; file cũ không còn trong bản xuất sẽ bị xoá.
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const TARGET = resolve(ROOT, process.argv[2] ?? '../minhtri-blog-cloudflare')

// Nội dung riêng của matongduoclieu.com: không đưa vào repo mẫu
const EXCLUDE = [/^content\//, /^docs\//, /^template\//, /^db\/products\.sql$/, /^scripts\/export-template\.mjs$/]

const tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean)
const files = tracked.filter((f) => !EXCLUDE.some((re) => re.test(f)))

// Xoá file cũ trong repo mẫu (trừ .git, node_modules) để bản xuất luôn khớp
mkdirSync(TARGET, { recursive: true })
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    if (name === '.git' || name === 'node_modules' || name === '.wrangler') return []
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
for (const f of walk(TARGET)) rmSync(f)

for (const f of files) {
  mkdirSync(dirname(join(TARGET, f)), { recursive: true })
  cpSync(join(ROOT, f), join(TARGET, f))
}

// Chép đè các file riêng của bản mẫu
const templateDir = join(ROOT, 'template')
for (const f of walk(templateDir)) {
  const rel = relative(templateDir, f)
  mkdirSync(dirname(join(TARGET, rel)), { recursive: true })
  cpSync(f, join(TARGET, rel))
}

// package.json: tên gói + mô tả biến cho nút "Deploy to Cloudflare"
const pkgPath = join(TARGET, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
pkg.name = 'minhtri-blog-cloudflare'
pkg.description = 'Blog tiếng Việt chạy miễn phí trên Cloudflare Workers (Hono, D1, R2)'
pkg.repository = 'github:nhakhtn/minhtri-blog-cloudflare'
pkg.cloudflare = {
  bindings: {
    SETUP_TOKEN: {
      description:
        'Mã cài đặt: dùng một lần để đặt mật khẩu quản trị khi mở `/quan-tri` lần đầu. Chọn chuỗi khó đoán và **ghi nhớ lại**.',
    },
    SITE_NAME: { description: 'Tên blog (đổi được sau trong Quản trị → Cài đặt site).' },
  },
}
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
const lockPath = join(TARGET, 'package-lock.json')
const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
lock.name = pkg.name
if (lock.packages?.['']) lock.packages[''].name = pkg.name
writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n')

// Tạo lại kiểu biến môi trường (worker-configuration.d.ts) theo wrangler.jsonc của bản mẫu
const devVars = join(TARGET, '.dev.vars')
const tempDevVars = !existsSync(devVars)
if (tempDevVars) cpSync(join(TARGET, '.dev.vars.example'), devVars)
execSync(`node "${join(ROOT, 'node_modules/wrangler/bin/wrangler.js')}" types --env-interface CloudflareBindings`, {
  cwd: TARGET,
  stdio: 'ignore',
})
if (tempDevVars) rmSync(devVars)

// Kiểm tra: không còn sót thông tin riêng của site gốc
const leaks = walk(TARGET).filter((f) => {
  if (!/\.(ts|tsx|js|mjs|json|jsonc|sql|md|svg|css|txt|example)$/.test(f) || f.endsWith('package-lock.json')) return false
  const text = readFileSync(f, 'utf8')
  return /matongduoclieu-db|0787767083|nhakhtn@gmail|anh\.matongduoclieu|1622e0c1|e8e2201d/.test(text)
})
if (leaks.length) {
  console.error('Còn sót thông tin riêng trong:\n' + leaks.map((f) => '  ' + relative(TARGET, f)).join('\n'))
  process.exit(1)
}
console.log(`✔ Đã xuất ${files.length} file vào ${TARGET}${existsSync(join(TARGET, '.git')) ? ' (giữ nguyên .git)' : ''}`)
