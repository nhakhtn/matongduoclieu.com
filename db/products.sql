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
 'mat-ong', 2, 1),
('mat-ong-hoa-nhan-hnt-200g',
 'Mật ong hoa nhãn nguyên chất 200g – HNT Natural Product',
 'Mật ong hoa nhãn từ Khoái Châu, Hưng Yên, lọ thuỷ tinh 200g. Mật hoa nhãn tự nhiên ít đóng đường. Gian hàng Shopee Mall.',
 58120,
 'https://down-vn.img.susercontent.com/file/ff14c146a01c5b1ff4622e89a51ed0c7@resize_w600_nl',
 'https://s.shopee.vn/6L5HgBL2uL',
 'mat-ong', 3, 1),
('que-vo-kho-yen-bai-500g',
 'Quế vỏ khô Yên Bái 500g',
 'Vỏ quế Yên Bái phơi nắng tự nhiên, gói 500g. Dùng làm gia vị nấu ăn, pha trà quế.',
 50000,
 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m47rdc6zfnrb95@resize_w600_nl',
 'https://s.shopee.vn/1qcsK6TLHP',
 'duoc-lieu', 10, 1),
('que-cay-cao-vo-anh-duong',
 'Quế cây cạo vỏ (quế điếu) – Dược Liệu Ánh Dương',
 'Thanh quế đã cạo vỏ ngoài, khô và thơm, dùng nấu ăn, pha trà, trang trí. Có gói 50g, 100g, 200g, 250g; giá hiển thị là gói 50g.',
 18000,
 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-luuukm16o6qt75@resize_w600_nl',
 'https://s.shopee.vn/2qVPWBwjKA',
 'duoc-lieu', 11, 0),
('que-thanh-cao-vo-an-an-foods',
 'Quế thanh cạo vỏ – AN AN FOODS',
 'Quế thanh đã cạo vỏ ngoài, phơi khô, thơm nồng ngọt ấm. Dùng nấu phở, bò kho, pha trà quế, làm bánh. Túi zip 100g, 250g, 500g; giá hiển thị là túi 100g.',
 25000,
 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mh4n54b2fq4s9d@resize_w600_nl',
 'https://s.shopee.vn/6fi85dXYa8',
 'duoc-lieu', 11, 1),
('sam-cat-lam-thai-lat-anh-duong',
 'Hồng sâm Cát Lâm thái lát – Dược Liệu Ánh Dương',
 'Hồng sâm (Panax ginseng) vùng Cát Lâm, Trung Quốc, thái lát sẵn, không tẩm đường. Có gói 50g, 100g, 200g, 250g; giá hiển thị là gói 50g.',
 92120,
 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mn5sgmlen18gf2@resize_w600_nl',
 'https://s.shopee.vn/6L5HhDzjs6',
 'duoc-lieu', 20, 1)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name, summary = excluded.summary, price = excluded.price,
  image_url = excluded.image_url, buy_url = excluded.buy_url,
  category = excluded.category, sort_order = excluded.sort_order, active = excluded.active;

-- Mật ong rừng tràm U Minh (OginBee): thêm ngày 19/10/2026
INSERT INTO products (slug, name, summary, price, image_url, buy_url, category, sort_order, active) VALUES
('mat-ong-rung-u-minh-oginbee-500ml',
 'Mật ong rừng tràm U Minh 500ml – OginBee',
 'Mật ong hoa tràm rừng U Minh Hạ (Cà Mau), lấy từ kèo ong theo lối gác kèo truyền thống. Chai 500ml, có chai thuỷ tinh hoặc chai nhựa. Mật không hạ độ ẩm nên hơi loãng, màu vàng hổ phách.',
 414797,
 'https://down-vn.img.susercontent.com/file/1edd8bc6d5ca6e67e7447f36f8a7d908@resize_w600_nl',
 'https://s.shopee.vn/50ZwynXbnx',
 'mat-ong', 4, 1)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name, summary = excluded.summary, price = excluded.price,
  image_url = excluded.image_url, buy_url = excluded.buy_url,
  category = excluded.category, sort_order = excluded.sort_order, active = excluded.active;

-- Đông trùng hạ thảo sấy thăng hoa (Dược thảo Thái Tuyết): thêm ngày 26/10/2026
INSERT INTO products (slug, name, summary, price, image_url, buy_url, category, sort_order, active) VALUES
('dong-trung-ha-thao-say-thang-hoa-thai-tuyet-40g',
 'Đông trùng hạ thảo sấy thăng hoa 40g – Dược thảo Thái Tuyết',
 'Cordyceps militaris nuôi trên nhộng tằm và gạo lứt, sấy thăng hoa, nguyên sợi. Lọ 40g. Sản phẩm OCOP 4 sao của Hà Nội (theo giấy chứng nhận shop công bố).',
 189150,
 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mnn1rp3rkrnp88@resize_w600_nl',
 'https://s.shopee.vn/4LKRge63A0',
 'duoc-lieu', 5, 1)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name, summary = excluded.summary, price = excluded.price,
  image_url = excluded.image_url, buy_url = excluded.buy_url,
  category = excluded.category, sort_order = excluded.sort_order, active = excluded.active;

-- Linh chi đỏ Đà Lạt thái lát (Dalat Cordyceps): thêm ngày 30/10/2026
INSERT INTO products (slug, name, summary, price, image_url, buy_url, category, sort_order, active) VALUES
('linh-chi-do-da-lat-thai-lat-dalat-cordyceps',
 'Nấm linh chi đỏ Đà Lạt thái lát – Dalat Cordyceps',
 'Linh chi đỏ trồng ở Lâm Đồng, thái lát sẵn để sắc nước uống, có hai loại hồng chi và xích chi, gói 250g hoặc 500g. Vị đắng, sắc 2–5 g mỗi ngày, có thể thêm chút mật ong cho dễ uống.',
 352600,
 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mrfozd6appmvc5@resize_w600_nl',
 'https://s.shopee.vn/4VdyBcah01',
 'duoc-lieu', 6, 1)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name, summary = excluded.summary, price = excluded.price,
  image_url = excluded.image_url, buy_url = excluded.buy_url,
  category = excluded.category, sort_order = excluded.sort_order, active = excluded.active;

-- Khách thấy ngay bản mới (xem src/lib/page-cache.ts)
INSERT INTO settings (key, value) VALUES ('cache_version', '1')
  ON CONFLICT(key) DO UPDATE SET value = CAST(CAST(value AS INTEGER) + 1 AS TEXT), updated_at = datetime('now');
