import type { Child } from 'hono/jsx'
import { raw } from 'hono/html'
import type { Crumb } from '../lib/seo'

export type SeoProps = {
  title?: string
  description?: string
  /** Đường dẫn hoặc URL tuyệt đối của ảnh chia sẻ */
  image?: string
  type?: 'website' | 'article'
  jsonLd?: object[]
  breadcrumbs?: Crumb[]
  noindex?: boolean
}

type Props = SeoProps & {
  siteName: string
  siteUrl: string
  path: string
  googleVerification?: string
  children?: Child
}

const nav = [
  { href: '/', label: 'Trang chủ' },
  { href: '/chu-de/mat-ong', label: 'Mật ong' },
  { href: '/chu-de/duoc-lieu', label: 'Dược liệu' },
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/gioi-thieu', label: 'Giới thiệu' },
  { href: '/lien-he', label: 'Liên hệ' },
]

const DEFAULT_IMAGE = '/media/posts/mat-ong/01-nectar.webp'

// Chặn chuỗi "</script>" trong JSON làm vỡ thẻ script
const jsonScript = (data: object) =>
  raw(`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`)

export const Breadcrumbs = ({ items }: { items: Crumb[] }) => (
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    {items.map((c, i) =>
      i < items.length - 1 ? (
        <>
          <a href={c.path}>{c.name}</a>
          <span aria-hidden="true"> › </span>
        </>
      ) : (
        <span aria-current="page">{c.name}</span>
      )
    )}
  </nav>
)

export const Layout = (props: Props) => {
  const { siteName, siteUrl, path, title, description, children } = props
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const canonical = new URL(path, siteUrl).toString()
  const image = new URL(props.image ?? DEFAULT_IMAGE, siteUrl).toString()

  return (
    <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{fullTitle}</title>
        {description && <meta name="description" content={description} />}
        {props.noindex && <meta name="robots" content="noindex" />}
        <link rel="canonical" href={canonical} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#c98a12" />

        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="vi_VN" />
        <meta property="og:type" content={props.type ?? 'website'} />
        <meta property="og:title" content={title ?? siteName} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={image} />
        <meta name="twitter:card" content="summary_large_image" />

        {props.googleVerification && <meta name="google-site-verification" content={props.googleVerification} />}
        <link rel="stylesheet" href="/css/style.css" />
        {(props.jsonLd ?? []).map(jsonScript)}
      </head>
      <body>
        <header class="site-header">
          <div class="container">
            <a href="/" class="logo">
              <img src="/favicon.svg" alt="" width="28" height="28" />
              {siteName}
            </a>
            <nav class="main-nav">
              {nav.map((item) => (
                <a href={item.href}>{item.label}</a>
              ))}
            </nav>
          </div>
        </header>
        <main class="container">
          {props.breadcrumbs && <Breadcrumbs items={props.breadcrumbs} />}
          {children}
        </main>
        <footer class="site-footer">
          <div class="container footer-grid">
            <div>
              <strong>{siteName}</strong>
              <p>Thông tin và sản phẩm về mật ong và dược liệu Việt Nam.</p>
            </div>
            <div class="footer-links">
              <a href="/bai-viet">Tất cả bài viết</a>
              <a href="/chinh-sach-bien-tap">Chính sách biên tập</a>
              <a href="/mien-tru-trach-nhiem">Miễn trừ trách nhiệm</a>
              <a href="/lien-he">Liên hệ</a>
            </div>
          </div>
          <div class="container copyright">
            © {new Date().getFullYear()} {siteName}. Nội dung chỉ mang tính tham khảo, không thay thế tư vấn y khoa.
          </div>
        </footer>
      </body>
    </html>
  )
}
