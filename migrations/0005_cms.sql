-- Quản trị nội dung: chuyên mục bài viết, danh mục sản phẩm, trang tĩnh.
-- posts.category và products.category lưu slug của chuyên mục/danh mục tương ứng.

CREATE TABLE post_categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO post_categories (slug, name, description, sort_order) VALUES
('mat-ong', 'Mật ong', 'Kiến thức về mật ong: lịch sử, văn hoá, các loại mật vùng miền, cách chọn và dùng mật ong đúng cách.', 1),
('duoc-lieu', 'Dược liệu', 'Tìm hiểu các vị dược liệu quý như nhân sâm, nhung hươu, quế, linh chi: nguồn gốc, công dụng theo Đông y và lưu ý khi dùng.', 2);

CREATE TABLE product_categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO product_categories (slug, name, sort_order) VALUES
('mat-ong', 'Mật ong', 1),
('duoc-lieu', 'Dược liệu', 2);

-- Trang tĩnh: /<slug>. content_html được render khi lưu từ trang quản trị
-- (hoặc lần xem đầu tiên nếu còn trống).
CREATE TABLE pages (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  content_md     TEXT NOT NULL DEFAULT '',
  content_html   TEXT,
  published      INTEGER NOT NULL DEFAULT 1,
  show_in_menu   INTEGER NOT NULL DEFAULT 0,
  show_in_footer INTEGER NOT NULL DEFAULT 0,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO pages (slug, title, description, show_in_menu, show_in_footer, sort_order, content_md) VALUES
('gioi-thieu', 'Giới thiệu',
 'Giới thiệu về Mật Ong & Dược Liệu: trang thông tin và sản phẩm về mật ong và dược liệu Việt Nam.',
 1, 0, 1,
'**Mật Ong & Dược Liệu** là trang thông tin về hai mảng gắn bó với đời sống người Việt từ hàng nghìn năm: **mật ong** và **dược liệu**, như nhân sâm, nhung hươu, quế, linh chi.

Chúng tôi muốn mang đến những bài viết sâu, dễ đọc và có nguồn tham khảo rõ ràng: từ lịch sử, văn hoá, cách nuôi trồng, thu hái, đến công dụng theo y học cổ truyền và những gì khoa học hiện đại đã kiểm chứng.

<h2 id="tac-gia">Người sáng lập</h2>

Trang do **Nguyễn Đoàn Đức Nhã** sáng lập và trực tiếp biên tập nội dung. Mỗi bài viết đều được nghiên cứu từ nhiều nguồn, đối chiếu thông tin và ghi rõ tài liệu tham khảo để bạn đọc có thể tự kiểm chứng.

## Nguồn tham khảo về Đông y

Các nội dung liên quan đến y học cổ truyền được tham khảo từ [Hội Đông y Việt Nam](https://hoidongy.org.vn/) cùng các sách chuyên ngành như *Những cây thuốc và vị thuốc Việt Nam* của GS. Đỗ Tất Lợi. Xem chi tiết tại [Chính sách biên tập](/chinh-sach-bien-tap).

## Về sản phẩm

Chúng tôi không trực tiếp sản xuất hay bán hàng. Các sản phẩm giới thiệu trên trang được chọn lọc từ các gian hàng trên **Shopee**; khi bấm "Mua trên Shopee", bạn sẽ đặt hàng và thanh toán trực tiếp với gian hàng đó trên Shopee. Một số liên kết trên trang là liên kết tiếp thị Shopee: khi bạn mua qua liên kết này, chúng tôi có thể nhận hoa hồng mà giá bạn trả không thay đổi.

## Liên hệ

- Điện thoại / Zalo: [0787 767 083](tel:0787767083)
- Email: [nhakhtn@gmail.com](mailto:nhakhtn@gmail.com)'),
('chinh-sach-bien-tap', 'Chính sách biên tập',
 'Cách chúng tôi nghiên cứu, biên soạn và kiểm tra nội dung về mật ong và dược liệu.',
 0, 1, 2,
'Chúng tôi đặt độ chính xác lên hàng đầu, vì nội dung về sức khoẻ ảnh hưởng trực tiếp tới người đọc. Nội dung do [Nguyễn Đoàn Đức Nhã](/gioi-thieu#tac-gia) biên tập.

## Nguồn tham khảo

- Nội dung Đông y (tính vị, quy kinh, công năng, bài thuốc) tham khảo từ [Hội Đông y Việt Nam](https://hoidongy.org.vn/).
- Sách chuyên ngành về dược liệu và y học cổ truyền, như *Những cây thuốc và vị thuốc Việt Nam* của GS. Đỗ Tất Lợi.
- Nghiên cứu khoa học đã bình duyệt và các tổng quan hệ thống (ví dụ Cochrane).
- Khuyến cáo của cơ quan y tế và cơ quan quản lý nhà nước.
- Báo chí chính thống cho thông tin về vùng nguyên liệu, nghề truyền thống.

## Nguyên tắc

- Mỗi bài có danh sách nguồn tham khảo ở cuối.
- Phân biệt rõ kinh nghiệm dân gian, lý luận Đông y và kết quả đã được khoa học hiện đại kiểm chứng.
- Không quảng cáo sản phẩm có tác dụng chữa bệnh; luôn nêu các trường hợp cần thận trọng.
- Bài viết được rà soát và cập nhật khi có thông tin mới; ngày cập nhật được ghi trên bài.

## Báo lỗi

Nếu phát hiện thông tin chưa chính xác, xin vui lòng báo cho chúng tôi qua trang [Liên hệ](/lien-he).'),
('mien-tru-trach-nhiem', 'Miễn trừ trách nhiệm',
 'Miễn trừ trách nhiệm y khoa và công khai liên kết tiếp thị.',
 0, 1, 3,
'## Thông tin y khoa

Nội dung trên Mật Ong & Dược Liệu chỉ nhằm mục đích cung cấp thông tin tham khảo, không phải lời khuyên y khoa và không thay thế cho việc chẩn đoán, điều trị của bác sĩ hoặc thầy thuốc. Hãy hỏi ý kiến người có chuyên môn trước khi dùng mật ong hoặc dược liệu để hỗ trợ sức khoẻ, đặc biệt khi bạn đang mang thai, cho con bú, có bệnh mạn tính hoặc đang dùng thuốc.

Thực phẩm và dược liệu không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.

## Liên kết tiếp thị

Một số liên kết trên trang là liên kết tiếp thị Shopee: khi bạn mua qua liên kết này, chúng tôi có thể nhận hoa hồng mà giá bạn trả không thay đổi.');
