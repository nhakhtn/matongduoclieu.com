import type { Child } from 'hono/jsx'

type Props = {
  siteName: string
  title?: string
  description?: string
  children?: Child
}

const nav = [
  { href: '/', label: 'Trang chủ' },
  { href: '/gioi-thieu', label: 'Giới thiệu' },
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/bai-viet', label: 'Bài viết' },
  { href: '/lien-he', label: 'Liên hệ' },
]

export const Layout = ({ siteName, title, description, children }: Props) => (
  <html lang="vi">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title ? `${title} | ${siteName}` : siteName}</title>
      {description && <meta name="description" content={description} />}
      <link rel="stylesheet" href="/css/style.css" />
    </head>
    <body>
      <header class="site-header">
        <div class="container">
          <a href="/" class="logo">
            {siteName}
          </a>
          <nav>
            {nav.map((item) => (
              <a href={item.href}>{item.label}</a>
            ))}
          </nav>
        </div>
      </header>
      <main class="container">{children}</main>
      <footer class="site-footer">
        <div class="container">
          © {new Date().getFullYear()} {siteName}
        </div>
      </footer>
    </body>
  </html>
)
