import { jsxRenderer } from 'hono/jsx-renderer'
import { Layout } from './components/Layout'

declare module 'hono' {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props?: { title?: string; description?: string }
    ): Response | Promise<Response>
  }
}

export const renderer = jsxRenderer<{ Bindings: CloudflareBindings }>(
  ({ children, title, description }, c) => (
    <Layout siteName={c.env.SITE_NAME} title={title} description={description}>
      {children}
    </Layout>
  ),
  { docType: true }
)
