import type { MiddlewareHandler } from 'hono'

type Env = { Bindings: CloudflareBindings }

/**
 * Cache HTML của các trang GET vào KV. Sau khi sửa nội dung trong D1, xoá key
 * `page:<path>` (hoặc chờ hết TTL) để trang được render lại.
 */
export const kvPageCache = (ttlSeconds = 300): MiddlewareHandler<Env> => async (c, next) => {
  if (c.req.method !== 'GET') return next()

  const key = `page:${new URL(c.req.url).pathname}`
  const cached = await c.env.CACHE.get(key)
  if (cached !== null) {
    return c.html(cached, 200, { 'X-Cache': 'HIT' })
  }

  await next()

  if (c.res.status === 200 && c.res.headers.get('Content-Type')?.startsWith('text/html')) {
    const body = await c.res.clone().text()
    c.executionCtx.waitUntil(c.env.CACHE.put(key, body, { expirationTtl: ttlSeconds }))
    c.res.headers.set('X-Cache', 'MISS')
  }
}
