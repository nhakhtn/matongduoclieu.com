// Secret không khai báo trong wrangler.jsonc (đặt bằng `wrangler secret put ADMIN_PASSWORD`)
interface CloudflareBindings {
  ADMIN_PASSWORD?: string
}
