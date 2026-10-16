-- Dữ liệu mẫu cho môi trường local
INSERT INTO posts (slug, title, excerpt, content_md, published, published_at) VALUES
('mat-ong-duoc-lieu-la-gi', 'Mật ong dược liệu là gì?',
 'Tìm hiểu mật ong dược liệu và điểm khác biệt so với mật ong thông thường.',
 '## Mật ong dược liệu

Đây là bài viết mẫu. Hãy thay nội dung này bằng bài viết thật.

- Ý thứ nhất
- Ý thứ hai',
 1, datetime('now'));

INSERT INTO products (slug, name, summary, price, sort_order) VALUES
('mat-ong-hoa-ca-phe', 'Mật ong hoa cà phê', 'Sản phẩm mẫu – thay bằng mô tả thật.', 250000, 1),
('mat-ong-rung', 'Mật ong rừng', 'Sản phẩm mẫu – giá liên hệ.', NULL, 2);
