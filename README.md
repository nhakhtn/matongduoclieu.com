# matongduoclieu.com

Website thông tin và sản phẩm về mật ong và dược liệu (Mật Ong & Dược Liệu), viết bằng TypeScript chạy trên Cloudflare Workers.

- **Hono + JSX** render HTML phía server (tốt cho SEO)
- **D1**: bài viết, sản phẩm, liên hệ
- **R2**: ảnh (`/media/<key>`)
- **KV**: bộ đếm đăng nhập sai của trang quản trị (không dùng làm cache trang, vì gói miễn phí chỉ cho ~1.000 lượt ghi/ngày)
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

## Trang quản trị

`/quan-tri` (đăng nhập bằng mật khẩu, quên thì đặt lại bằng `npm run admin:password`):

- **Bài viết**: viết, sửa, xoá, lưu nháp / đăng; nội dung Markdown được render HTML khi lưu
- **Chuyên mục bài viết**: tự hiện trên menu và trang chủ
- **Sản phẩm** (link affiliate Shopee, lượt bấm) và **Danh mục sản phẩm**
- **Trang** tĩnh `/<slug>` (Giới thiệu, Chính sách...), chọn hiện ở menu / chân trang
- **Lời nhắn** liên hệ, **Đổi mật khẩu**

**Database là nơi lưu chính.** File trong `content/posts/` là bản lưu trữ; script đăng bài sẽ không ghi đè bài đã được sửa trên trang quản trị (trừ khi thêm `--force`).

## Viết và đăng bài bằng file

Bài viết là file Markdown trong `content/posts/`, đầu file có front matter:

```
---
slug: mat-ong
title: Mật Ong!
excerpt: Mô tả ngắn hiện trên Google và khi chia sẻ
category: mat-ong            # mat-ong | duoc-lieu
cover: posts/mat-ong/01-nectar.webp   # key ảnh trong R2 (tuỳ chọn)
author:                      # tên tác giả (tuỳ chọn)
---
```

```bash
npm run post:local   -- content/posts/mat-ong.md   # thử trên D1 local
npm run post:publish -- content/posts/mat-ong.md   # đăng lên D1 thật
npm run post:publish -- --all                      # đăng lại mọi bài
```

## Ghi chú

- Kế hoạch phát triển và tiến độ: [`docs/ke-hoach.md`](docs/ke-hoach.md).
- Sau khi sửa `wrangler.jsonc`, chạy `npm run cf-typegen` để cập nhật kiểu binding.
- Upload ảnh: `npx wrangler r2 object put matongduoclieu-media/posts/<slug>/anh.webp --file=anh.webp --content-type=image/webp --remote`.
- Sản phẩm Shopee: điền `buy_url` trong bảng `products`; nút mua đi qua `/mua/<slug>` để đếm lượt bấm (cột `clicks`).
- Markdown được render sẵn thành HTML lúc đăng (cột `content_html`) để mỗi request nhẹ CPU (gói Workers miễn phí). Trang không cache nên bài/sản phẩm mới hiện ngay.
- Sản phẩm: sửa `db/products.sql` rồi `npx wrangler d1 execute matongduoclieu-db --remote --file=db/products.sql`.
