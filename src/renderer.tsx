import { jsxRenderer } from 'hono/jsx-renderer'
import type { SeoProps } from './components/Layout'
import { Layout } from './components/Layout'
import { breadcrumbJsonLd, organizationJsonLd, websiteJsonLd } from './lib/seo'

declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, props?: SeoProps): Response | Promise<Response>
  }
}

export const renderer = jsxRenderer<{ Bindings: CloudflareBindings }>(
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
      >
        {children}
      </Layout>
    )
  },
  { docType: true }
)
