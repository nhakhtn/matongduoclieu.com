# Kế hoạch phát triển matongduoclieu.com

**Mục tiêu:** trở thành nguồn thông tin tiếng Việt đáng tin cậy về **mật ong và dược liệu** (sâm, nhung hươu, quế…), thu hút khách từ Google, rồi dẫn khách sang khoảng 10 sản phẩm trên Shopee ở trang Sản phẩm.

**Nguyên tắc:** Google xếp nội dung sức khoẻ vào nhóm YMYL ("Your Money or Your Life"), nên chỉ thắng được nếu nội dung **sâu, chính xác, có nguồn, có người chịu trách nhiệm**. Ưu tiên chất lượng hơn số lượng, nhưng phải đều đặn.

Trạng thái: ✅ xong · 🔄 đang làm · ✅ chưa làm · 🙋 cần bạn cung cấp

---

## Giai đoạn 1: Nền kỹ thuật SEO

| # | Việc | Trạng thái |
|---|---|---|
| 1.1 | Thẻ `canonical`, Open Graph, Twitter card (chia sẻ Facebook/Zalo có ảnh và tiêu đề) | ✅ |
| 1.2 | Dữ liệu cấu trúc JSON-LD: `WebSite`, `Organization`, `Article`, `BreadcrumbList` | ✅ |
| 1.3 | Chuyển hướng 301: `http` → `https`, `www` → tên miền chính | ✅ |
| 1.4 | Ảnh WebP có `width`/`height` (nhẹ hơn, không giật bố cục) | ✅ |
| 1.5 | Favicon, `lastmod` trong sitemap | ✅ |
| 1.6 | Chuyên mục **Mật ong** / **Dược liệu**: trang `/chu-de/...`, breadcrumb | ✅ |
| 1.7 | Bảng sản phẩm có link Shopee, link mua đi qua `/mua/:slug` để đếm lượt bấm | ✅ |
| 1.8 | Hỗ trợ thẻ xác minh Google Search Console | ✅ |

## Giai đoạn 2: Độ tin cậy (E-E-A-T)

| # | Việc | Trạng thái |
|---|---|---|
| 2.1 | Trang **Giới thiệu** thật: ai đứng sau site, câu chuyện, nguồn hàng | ✅ |
| 2.2 | Tên tác giả, người duyệt chuyên môn (nếu có) hiển thị ở mỗi bài | ✅ |
| 2.3 | Trang **Chính sách biên tập**: cách nghiên cứu, nguồn tham khảo, cập nhật | ✅ |
| 2.4 | Trang **Miễn trừ trách nhiệm y khoa** và **Công khai liên kết tiếp thị** (Shopee affiliate) | ✅ |
| 2.5 | Thông tin liên hệ rõ ràng (số điện thoại/Zalo, email, địa chỉ nếu có) | ✅ |

## Giai đoạn 3: Nội dung

Mô hình **cụm chủ đề**: mỗi chủ đề lớn có một bài trụ cột dài và sâu, xung quanh là các bài vệ tinh trả lời câu hỏi cụ thể, tất cả liên kết qua lại với nhau.

**Nguồn Đông y:** mọi nội dung y học cổ truyền tham khảo từ [Hội Đông y Việt Nam](https://hoidongy.org.vn/), kết hợp sách chuyên ngành (Đỗ Tất Lợi). **Tác giả:** Nguyễn Đoàn Đức Nhã.

**Nhịp độ đề xuất:** 2–3 bài mỗi tuần. Mỗi bài đều qua quy trình: nghiên cứu nguồn → viết → ảnh có giấy phép → xuất bản → liên kết nội bộ.

### Cụm Mật ong (trụ cột: "Mật Ong!" ✅)
- Mật ong bạc hà Hà Giang: chỉ dẫn địa lý Mèo Vạc, mùa hoa, cách nhận biết
- Mật ong U Minh và nghề gác kèo ong (nhãn hiệu tập thể "Mật ong U Minh Hạ")
- Mật ong hoa nhãn, hoa cà phê, hoa vải: khác nhau thế nào
- Vì sao mật ong kết tinh? Kết tinh có phải mật giả?
- Các mẹo thử mật ong thật giả: mẹo nào đúng, mẹo nào sai (góc nhìn khoa học)
- Mật ong và trẻ dưới 1 tuổi
- Mật ong cho người tiểu đường
- Sữa ong chúa, phấn hoa, keo ong: là gì, khác gì mật ong

### Cụm Dược liệu (mỗi vị một bài trụ cột)
- **Nhân sâm**: sâm Ngọc Linh, sâm Hàn Quốc, sâm Mỹ, phân biệt và cách dùng
- **Nhung hươu**: lịch sử, cách thu hoạch, bào chế, lưu ý
- **Quế**: quế Trà Bồng, quế Yên Bái, quế Thanh; quế Cassia và quế Ceylon
- Đông trùng hạ thảo, linh chi, tam thất, hà thủ ô đỏ, cam thảo, gừng, nghệ, táo đỏ, kỷ tử
- Bài nối hai cụm: "Mật ong trong bào chế dược liệu" (luyện mật làm hoàn, chích mật), "Sâm ngâm mật ong", "Gừng mật ong"…

## Giai đoạn 4: Sản phẩm Shopee

| # | Việc | Trạng thái |
|---|---|---|
| 4.1 | Chọn khoảng 10 sản phẩm, lấy link affiliate Shopee (nguồn hàng: Shopee) | 🙋 |
| 4.2 | Thẻ sản phẩm: ảnh, mô tả ngắn, giá tham khảo, nút "Mua trên Shopee" (link `rel="sponsored nofollow"`) | ✅ |
| 4.3 | Gắn sản phẩm liên quan vào cuối từng bài viết | ✅ |
| 4.4 | Thống kê lượt bấm mua theo sản phẩm | 🔄 Đã đếm lượt bấm trong D1, chưa có trang xem thống kê |

## Giai đoạn 5: Đưa lên Google và đo lường

| # | Việc | Trạng thái |
|---|---|---|
| 5.1 | Xác minh site trong Google Search Console, gửi sitemap | 🙋 |
| 5.2 | Theo dõi từ khoá, số lần hiển thị và lượt bấm từ Google mỗi tháng | ⬜ |
| 5.3 | Fanpage, nhóm Zalo, chia sẻ bài viết để có người đọc và backlink đầu tiên | 🙋 |

## Kỳ vọng thời gian

- **Tháng 1–2:** Google bắt đầu lập chỉ mục; từ khoá ngách (gác kèo ong, cam thảo chích mật…) có thể xuất hiện.
- **Tháng 3–6:** cụm chủ đề đủ dày (khoảng 30–50 bài) thì thứ hạng ổn định hơn.
- **Từ khoá lớn** ("mật ong", "nhân sâm") cạnh tranh với Long Châu, Vinmec: cần từ một năm trở lên và backlink.
