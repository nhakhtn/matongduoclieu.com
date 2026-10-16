# matongduoclieu.com

Website thông tin và sản phẩm về mật ong và dược liệu (Mật Ong & Dược Liệu), viết bằng TypeScript chạy trên Cloudflare Workers.

- **Hono + JSX** render HTML phía server (tốt cho SEO)
- **D1**: bài viết, sản phẩm, liên hệ
- **R2**: ảnh (`/media/<key>`)
- **KV**: cache HTML trang (TTL 5 phút)
- **Static assets**: `public/` (CSS, robots.txt)

## Cấu trúc

```
src/
  index.tsx           # app chính, đăng ký route + sitemap + 404
  renderer.tsx        # layout chung qua jsxRenderer
  components/Layout.tsx
  routes/
    pages.tsx         # /, /gioi-thieu, /san-pham
    blog.tsx          # /bai-viet, /bai-viet/:slug (Markdown)
    contact.tsx       # /lien-he (form lưu vào D1)
    media.ts          # /media/* đọc ảnh từ R2
  lib/                # truy vấn D1, cache KV, định dạng
migrations/           # migration D1 (chạy cả local và production)
db/seed.sql           # dữ liệu mẫu, chỉ dùng local
public/               # file tĩnh
```

## Chạy local

```bash
npm install
npm run db:migrate:local
npm run db:seed:local
npm run dev            # http://localhost:8787
```

## Deploy lần đầu

```bash
npx wrangler login
npx wrangler d1 create matongduoclieu-db          # dán database_id vào wrangler.jsonc
npx wrangler kv namespace create CACHE             # dán id vào wrangler.jsonc
npx wrangler r2 bucket create matongduoclieu-media
npm run cf-typegen
npm run db:migrate:remote
npm run deploy
```

Sau đó bật `routes` (custom domain) trong `wrangler.jsonc` để gắn tên miền matongduoclieu.com.

## Ghi chú

- Sau khi sửa `wrangler.jsonc`, chạy `npm run cf-typegen` để cập nhật kiểu binding.
- Upload ảnh: `npx wrangler r2 object put matongduoclieu-media/products/abc.jpg --file=abc.jpg --remote`,
  rồi đặt `image_key = 'products/abc.jpg'` trong D1.
- Cache KV: sau khi sửa nội dung, trang tự cập nhật sau tối đa 5 phút (hoặc xoá key `page:<path>`).
