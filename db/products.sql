-- Sản phẩm Shopee affiliate. Chạy lại an toàn (cập nhật theo slug):
--   npx wrangler d1 execute matongduoclieu-db --remote --file=db/products.sql
INSERT INTO products (slug, name, summary, price, image_url, buy_url, category, sort_order, active) VALUES
('mat-ong-hoa-tiem-pho-nui-1000ml',
 'Mật ong hoa nguyên chất 1000ml – Tiệm Phố Núi',
 'Mật ong hoa nguyên chất từ Gia Lai, chai 1 lít. Có 4 loại: hoa cà phê, hoa chôm chôm, hoa nhãn, hoa vải. Gian hàng Shopee Mall.',
 149000,
 'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m9xy0imjdtsq82@resize_w600_nl',
 'https://s.shopee.vn/1qcr5HVhNJ',
 'mat-ong', 1, 1),
('mat-ong-hoa-vai-san-vlog-1l',
 'Mật ong hoa vải nguyên chất 1 lít – San Vlog',
 'Mật ong hoa vải Bắc Giang lấy trực tiếp tại vườn, đã hạ thuỷ phần nên sánh đặc. Màu vàng óng, thơm nhẹ, vị ngọt thanh.',
 225000,
 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mijpw80m6jur61@resize_w600_nl',
 'https://s.shopee.vn/5q8zr2FAhm',
 'mat-ong', 2, 1)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name, summary = excluded.summary, price = excluded.price,
  image_url = excluded.image_url, buy_url = excluded.buy_url,
  category = excluded.category, sort_order = excluded.sort_order, active = excluded.active;
