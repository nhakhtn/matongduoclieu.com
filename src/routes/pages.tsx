import { Hono } from 'hono'
import { PostGrid, ProductGrid } from '../components/Cards'
import { listPosts, listProducts } from '../lib/db'

const app = new Hono<{ Bindings: CloudflareBindings }>()

const AFFILIATE_NOTE =
  'Một số liên kết trên trang là liên kết tiếp thị Shopee: khi bạn mua qua liên kết này, chúng tôi có thể nhận hoa hồng mà giá bạn trả không thay đổi.'

app.get('/', async (c) => {
  const [honey, herbs, products] = await Promise.all([
    listPosts(c.env.DB, 6, 'mat-ong'),
    listPosts(c.env.DB, 6, 'duoc-lieu'),
    listProducts(c.env.DB),
  ])
  return c.render(
    <>
      <section class="hero">
        <h1>{c.env.SITE_NAME}</h1>
        <p>Thông tin và sản phẩm về mật ong và dược liệu Việt Nam.</p>
        <div class="hero-actions">
          <a class="btn" href="/chu-de/mat-ong">Tìm hiểu mật ong</a>
          <a class="btn btn-outline" href="/chu-de/duoc-lieu">Tìm hiểu dược liệu</a>
        </div>
      </section>

      <section>
        <div class="section-head">
          <h2>Mật ong</h2>
          <a href="/chu-de/mat-ong">Xem tất cả ›</a>
        </div>
        <PostGrid posts={honey} />
      </section>

      <section>
        <div class="section-head">
          <h2>Dược liệu</h2>
          <a href="/chu-de/duoc-lieu">Xem tất cả ›</a>
        </div>
        <PostGrid posts={herbs} />
      </section>

      {products.length > 0 && (
        <section>
          <div class="section-head">
            <h2>Sản phẩm</h2>
            <a href="/san-pham">Xem tất cả ›</a>
          </div>
          <ProductGrid products={products.slice(0, 4)} />
        </section>
      )}
    </>,
    { description: 'Kiến thức chuyên sâu và sản phẩm về mật ong và dược liệu Việt Nam: nhân sâm, nhung hươu, quế, linh chi…' }
  )
})

app.get('/san-pham', async (c) => {
  const products = await listProducts(c.env.DB)
  return c.render(
    <>
      <h1>Sản phẩm</h1>
      <p class="lead">Các sản phẩm mật ong và dược liệu được chúng tôi lựa chọn.</p>
      {products.length ? <ProductGrid products={products} /> : <p class="empty">Sản phẩm đang được cập nhật.</p>}
      <p class="disclosure">{AFFILIATE_NOTE}</p>
    </>,
    {
      title: 'Sản phẩm',
      description: 'Sản phẩm mật ong và dược liệu chọn lọc.',
      breadcrumbs: [
        { name: 'Trang chủ', path: '/' },
        { name: 'Sản phẩm', path: '/san-pham' },
      ],
    }
  )
})

app.get('/gioi-thieu', (c) =>
  c.render(
    <article class="prose">
      <h1>Giới thiệu</h1>
      <p>
        <strong>{c.env.SITE_NAME}</strong> là trang thông tin về hai mảng gắn bó với đời sống người Việt từ hàng nghìn
        năm: <strong>mật ong</strong> và <strong>dược liệu</strong>, như nhân sâm, nhung hươu, quế, linh chi.
      </p>
      <p>
        Chúng tôi muốn mang đến những bài viết sâu, dễ đọc và có nguồn tham khảo rõ ràng: từ lịch sử, văn hoá, cách
        nuôi trồng, thu hái, đến công dụng theo y học cổ truyền và những gì khoa học hiện đại đã kiểm chứng.
      </p>
      <h2>Cách chúng tôi làm nội dung</h2>
      <p>
        Mỗi bài viết được tổng hợp từ sách chuyên ngành, nghiên cứu khoa học và nguồn báo chí uy tín, có ghi nguồn ở cuối
        bài. Xem chi tiết tại <a href="/chinh-sach-bien-tap">Chính sách biên tập</a>.
      </p>
      <h2>Liên hệ</h2>
      <p>
        Mọi góp ý về nội dung hoặc hợp tác, vui lòng gửi qua trang <a href="/lien-he">Liên hệ</a>.
      </p>
    </article>,
    {
      title: 'Giới thiệu',
      description: `Giới thiệu về ${c.env.SITE_NAME}: trang thông tin và sản phẩm về mật ong và dược liệu Việt Nam.`,
      breadcrumbs: [
        { name: 'Trang chủ', path: '/' },
        { name: 'Giới thiệu', path: '/gioi-thieu' },
      ],
    }
  )
)

app.get('/chinh-sach-bien-tap', (c) =>
  c.render(
    <article class="prose">
      <h1>Chính sách biên tập</h1>
      <p>Chúng tôi đặt độ chính xác lên hàng đầu, vì nội dung về sức khoẻ ảnh hưởng trực tiếp tới người đọc.</p>
      <h2>Nguồn tham khảo</h2>
      <ul>
        <li>Sách chuyên ngành về dược liệu và y học cổ truyền, như <em>Những cây thuốc và vị thuốc Việt Nam</em> của GS. Đỗ Tất Lợi.</li>
        <li>Nghiên cứu khoa học đã bình duyệt và các tổng quan hệ thống (ví dụ Cochrane).</li>
        <li>Khuyến cáo của cơ quan y tế và cơ quan quản lý nhà nước.</li>
        <li>Báo chí chính thống cho thông tin về vùng nguyên liệu, nghề truyền thống.</li>
      </ul>
      <h2>Nguyên tắc</h2>
      <ul>
        <li>Mỗi bài có danh sách nguồn tham khảo ở cuối.</li>
        <li>Phân biệt rõ kinh nghiệm dân gian, lý luận Đông y và kết quả đã được khoa học hiện đại kiểm chứng.</li>
        <li>Không quảng cáo sản phẩm có tác dụng chữa bệnh; luôn nêu các trường hợp cần thận trọng.</li>
        <li>Bài viết được rà soát và cập nhật khi có thông tin mới; ngày cập nhật được ghi trên bài.</li>
      </ul>
      <h2>Báo lỗi</h2>
      <p>
        Nếu phát hiện thông tin chưa chính xác, xin vui lòng báo cho chúng tôi qua trang <a href="/lien-he">Liên hệ</a>.
      </p>
    </article>,
    {
      title: 'Chính sách biên tập',
      description: 'Cách chúng tôi nghiên cứu, biên soạn và kiểm tra nội dung về mật ong và dược liệu.',
      breadcrumbs: [
        { name: 'Trang chủ', path: '/' },
        { name: 'Chính sách biên tập', path: '/chinh-sach-bien-tap' },
      ],
    }
  )
)

app.get('/mien-tru-trach-nhiem', (c) =>
  c.render(
    <article class="prose">
      <h1>Miễn trừ trách nhiệm</h1>
      <h2>Thông tin y khoa</h2>
      <p>
        Nội dung trên {c.env.SITE_NAME} chỉ nhằm mục đích cung cấp thông tin tham khảo, không phải lời khuyên y khoa và
        không thay thế cho việc chẩn đoán, điều trị của bác sĩ hoặc thầy thuốc. Hãy hỏi ý kiến người có chuyên môn
        trước khi dùng mật ong hoặc dược liệu để hỗ trợ sức khoẻ, đặc biệt khi bạn đang mang thai, cho con bú, có bệnh
        mạn tính hoặc đang dùng thuốc.
      </p>
      <p>Thực phẩm và dược liệu không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.</p>
      <h2>Liên kết tiếp thị</h2>
      <p>{AFFILIATE_NOTE}</p>
    </article>,
    {
      title: 'Miễn trừ trách nhiệm',
      description: 'Miễn trừ trách nhiệm y khoa và công khai liên kết tiếp thị.',
      breadcrumbs: [
        { name: 'Trang chủ', path: '/' },
        { name: 'Miễn trừ trách nhiệm', path: '/mien-tru-trach-nhiem' },
      ],
    }
  )
)

export default app
