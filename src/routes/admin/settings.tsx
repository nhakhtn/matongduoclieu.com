import { Hono } from 'hono'
import { marked } from 'marked'
import { setSettings } from '../../lib/auth'
import { mediaUrl } from '../../lib/format'
import { OWNER } from '../../lib/site'
import type { SiteConfig } from '../../lib/site-config'
import { faviconUrl, getSiteConfig } from '../../lib/site-config'
import { AdminShell, readForm } from './ui'

const app = new Hono<{ Bindings: CloudflareBindings }>()
const BASE = '/quan-tri/cai-dat'

// Ô chọn ảnh từ R2: ô key + nút tải lên + ảnh xem trước
const ImageField = (props: { name: string; label: string; value: string; preview: string; max?: number; format?: string }) => (
  <>
    <label>
      {props.label}
      <input name={props.name} value={props.value} data-preview-for={`${props.name}-preview`} />
    </label>
    <div
      class="upload-widget"
      data-mode="key"
      data-target={props.name}
      data-max={props.max ? String(props.max) : undefined}
      data-format={props.format}
    >
      <input type="file" accept="image/*" />
      <span class="upload-status muted"></span>
    </div>
    <img id={`${props.name}-preview`} class="admin-thumb-lg upload-preview" src={props.preview} alt="" hidden={!props.preview} />
  </>
)

const SettingsForm = ({ site }: { site: SiteConfig }) => (
  <form method="post" action={BASE} class="form admin-form-wide">
    <fieldset class="admin-fieldset">
      <legend>Thông tin chung</legend>
      <label>
        Tên trang web (hiện ở logo, tiêu đề tab, khi chia sẻ)
        <input name="name" required maxlength={80} value={site.name} />
      </label>
      <ImageField
        name="favicon_key"
        label="Favicon / logo (ảnh vuông; tải lên sẽ tự cắt về 512×512 PNG; để trống dùng biểu tượng mặc định)"
        value={site.favicon_key}
        preview={faviconUrl(site)}
        max={512}
        format="png-square"
      />
    </fieldset>

    <fieldset class="admin-fieldset">
      <legend>Trang chủ</legend>
      <label>
        Dòng chữ nhỏ phía trên tiêu đề
        <input name="hero_eyebrow" maxlength={120} value={site.hero_eyebrow} />
      </label>
      <label>
        Tiêu đề lớn (để trống sẽ dùng tên trang web)
        <input name="hero_title" maxlength={120} value={site.hero_title} />
      </label>
      <label>
        Đoạn giới thiệu
        <textarea name="hero_lead" rows={3} maxlength={500}>
          {site.hero_lead}
        </textarea>
      </label>
      <ImageField
        name="hero_image_key"
        label="Ảnh lớn bên phải (để trống sẽ ẩn ảnh)"
        value={site.hero_image_key}
        preview={site.hero_image_key ? mediaUrl(site.hero_image_key) : ''}
      />
      <label>
        Mô tả ảnh (alt, giúp Google hiểu ảnh)
        <input name="hero_image_alt" maxlength={200} value={site.hero_image_alt} />
      </label>
      <label class="checkbox">
        <input type="checkbox" name="products_enabled" checked={site.products_enabled !== '0'} /> Bật mục Sản phẩm
        (bỏ chọn nếu chỉ viết bài, không làm affiliate: ẩn menu Sản phẩm, trang /san-pham, sản phẩm trong trang chủ và
        cuối bài viết)
      </label>
      <div class="form-row">
        <label>
          Số sản phẩm hiện ở trang chủ (0 để ẩn)
          <input name="home_products" type="number" min={0} max={20} value={site.home_products} />
        </label>
      </div>
      <label>
        Mô tả trang chủ trên Google (khoảng 150 ký tự)
        <textarea name="home_description" rows={2} maxlength={300}>
          {site.home_description}
        </textarea>
      </label>
      <p class="muted">
        Hai nút "Tìm hiểu…" tự lấy 2 chuyên mục đứng đầu (đổi ở <a href="/quan-tri/chuyen-muc">Chuyên mục bài viết</a>).
      </p>
    </fieldset>

    <fieldset class="admin-fieldset">
      <legend>Chân trang (footer)</legend>
      <label>
        Nội dung giới thiệu (Markdown: **đậm**, [chữ](link), xuống dòng trống để tách đoạn)
        <textarea name="footer_md" rows={4} maxlength={2000}>
          {site.footer_md}
        </textarea>
      </label>
      <label class="checkbox">
        <input type="checkbox" name="footer_contact" checked={site.footer_contact === '1'} /> Hiện số điện thoại/Zalo (
        {OWNER.phoneDisplay}) và email
      </label>
      <label>
        Dòng copyright ({'{năm}'} = năm hiện tại, {'{tên}'} = tên trang web)
        <input name="copyright" maxlength={300} value={site.copyright} />
      </label>
    </fieldset>

    <div class="form-actions">
      <button class="btn" type="submit">
        Lưu cài đặt
      </button>
      <a href="/" target="_blank" rel="noopener">
        Xem trang chủ
      </a>
    </div>
  </form>
)

app.get('/', async (c) => {
  const site = await getSiteConfig(c.env.DB, c.env.SITE_NAME)
  return c.render(
    <AdminShell title="Cài đặt site" active={BASE} flash={c.req.query('ok')}>
      <SettingsForm site={site} />
    </AdminShell>,
    { title: 'Quản trị: Cài đặt site', noindex: true }
  )
})

app.post('/', async (c) => {
  const f = await readForm(c.req)
  const footer_md = f.text('footer_md')
  const homeProducts = Math.min(20, Math.max(0, f.int('home_products', 4)))
  const values: Record<string, string> = {
    name: f.s('name'),
    favicon_key: f.s('favicon_key'),
    hero_eyebrow: f.s('hero_eyebrow'),
    hero_title: f.s('hero_title'),
    hero_lead: f.text('hero_lead'),
    hero_image_key: f.s('hero_image_key'),
    hero_image_alt: f.s('hero_image_alt'),
    home_products: String(homeProducts),
    products_enabled: f.bool('products_enabled') ? '1' : '0',
    home_description: f.text('home_description'),
    footer_md,
    footer_html: footer_md ? await marked.parse(footer_md) : '',
    footer_contact: f.bool('footer_contact') ? '1' : '0',
    copyright: f.s('copyright'),
  }
  if (!values.name) {
    c.status(400)
    const site = { ...(await getSiteConfig(c.env.DB, c.env.SITE_NAME)), ...values } as SiteConfig
    return c.render(
      <AdminShell title="Cài đặt site" active={BASE} error="Vui lòng nhập tên trang web.">
        <SettingsForm site={site} />
      </AdminShell>,
      { title: 'Quản trị: Cài đặt site', noindex: true }
    )
  }
  await setSettings(
    c.env.DB,
    Object.fromEntries(Object.entries(values).map(([k, v]) => [`site.${k}`, v]))
  )
  return c.redirect(`${BASE}?ok=saved`, 303)
})

export default app
