import type { MiddlewareHandler } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'
import type { SeoProps } from './components/Layout'
import { Layout } from './components/Layout'
import { listNavPages, listPostCategories } from './lib/db'
import { breadcrumbJsonLd, organizationJsonLd, websiteJsonLd } from './lib/seo'
import type { AppEnv } from './types'

declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, props?: SeoProps): Response | Promise<Response>
  }
}

// Nạp chuyên mục và trang tĩnh cho menu/footer
export const loadNav: MiddlewareHandler<AppEnv> = async (c, next) => {
  const [postCategories, pages] = await Promise.all([listPostCategories(c.env.DB), listNavPages(c.env.DB)])
  c.set('nav', { postCategories, pages })
  await next()
}

export const renderer = jsxRenderer<AppEnv>(
  ({ children, ...seo }, c) => {
    const { SITE_URL, SITE_NAME } = c.env
    const jsonLd = [
      organizationJsonLd(SITE_URL, SITE_NAME),
      websiteJsonLd(SITE_URL, SITE_NAME),
      ...(seo.breadcrumbs ? [breadcrumbJsonLd(SITE_URL, seo.breadcrumbs)] : []),
      ...(seo.jsonLd ?? []),
    ]
    return (
      <Layout
        {...seo}
        jsonLd={jsonLd}
        siteName={SITE_NAME}
        siteUrl={SITE_URL}
        path={new URL(c.req.url).pathname}
        googleVerification={c.env.GOOGLE_SITE_VERIFICATION}
        nav={c.get('nav') ?? { postCategories: [], pages: [] }}
      >
        {children}
      </Layout>
    )
  },
  { docType: true }
)
