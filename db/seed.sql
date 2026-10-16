-- Dữ liệu mẫu cho môi trường local
INSERT INTO posts (slug, title, excerpt, content_md, published, published_at) VALUES
('bai-viet-mau', 'Bài viết mẫu',
 'Bài viết mẫu dùng khi chạy local.',
 '## Bài viết mẫu

Đây là bài viết mẫu. Hãy thay nội dung này bằng bài viết thật.

- Ý thứ nhất
- Ý thứ hai',
 1, datetime('now'));

INSERT INTO products (slug, name, summary, price, sort_order, buy_url) VALUES
('mat-ong-hoa-ca-phe', 'Mật ong hoa cà phê', 'Sản phẩm mẫu – thay bằng mô tả thật.', 250000, 1, 'https://shopee.vn/'),
('mat-ong-rung', 'Mật ong rừng', 'Sản phẩm mẫu – giá liên hệ.', NULL, 2, NULL);
