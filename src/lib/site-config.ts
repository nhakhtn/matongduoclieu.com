import { mediaUrl } from './format'

// Cấu hình site sửa được trong /quan-tri/cai-dat, lưu ở bảng settings với key "site.<tên>".
// Chỉ đọc các key "site.*" để không bao giờ lẫn mã băm mật khẩu / khoá phiên ra trang công khai.
export type SiteConfig = {
  name: string
  favicon_key: string
  home_description: string
  hero_eyebrow: string
  hero_title: string
  hero_lead: string
  hero_image_key: string
  hero_image_alt: string
  home_products: string
  products_enabled: string
  footer_md: string
  footer_html: string
  footer_contact: string
  copyright: string
}

export const DEFAULT_SITE_CONFIG: Omit<SiteConfig, 'name'> = {
  favicon_key: '',
  home_description:
    'Kiến thức chuyên sâu và sản phẩm về mật ong và dược liệu Việt Nam: nhân sâm, nhung hươu, quế, linh chi…',
  hero_eyebrow: 'Lịch sử · Văn hoá · Đông y · Khoa học',
  hero_title: '',
  hero_lead:
    'Những câu chuyện chuyên sâu về mật ong và các vị dược liệu quý của Việt Nam: từ nguồn gốc, văn hoá, đến cách dùng đúng theo y học cổ truyền và khoa học hiện đại.',
  hero_image_key: 'posts/mat-ong/02-comb.webp',
  hero_image_alt: 'Cầu ong với các lỗ tổ chứa mật đã được bịt nắp sáp',
  home_products: '4',
  products_enabled: '1',
  footer_md: 'Thông tin và sản phẩm về mật ong và dược liệu Việt Nam.',
  footer_html: '<p>Thông tin và sản phẩm về mật ong và dược liệu Việt Nam.</p>\n',
  footer_contact: '1',
  copyright: '© {năm} {tên}. Nội dung chỉ mang tính tham khảo, không thay thế tư vấn y khoa.',
}

export const SITE_CONFIG_KEYS = ['name', ...Object.keys(DEFAULT_SITE_CONFIG)] as (keyof SiteConfig)[]

/** Đọc cấu hình; key chưa lưu thì dùng mặc định (tên site mặc định lấy từ biến SITE_NAME) */
export async function getSiteConfig(db: D1Database, fallbackName: string): Promise<SiteConfig> {
  const { results } = await db
    .prepare("SELECT key, value FROM settings WHERE key LIKE 'site.%'")
    .all<{ key: string; value: string }>()
  const config: SiteConfig = { ...DEFAULT_SITE_CONFIG, name: fallbackName }
  for (const row of results) {
    const k = row.key.slice(5) as keyof SiteConfig
    if (SITE_CONFIG_KEYS.includes(k)) config[k] = row.value
  }
  if (!config.name) config.name = fallbackName
  return config
}

export const faviconUrl = (config: Pick<SiteConfig, 'favicon_key'>) =>
  config.favicon_key ? mediaUrl(config.favicon_key) : '/favicon.svg'

export const productsEnabled = (config: Pick<SiteConfig, 'products_enabled'>) => config.products_enabled !== '0'

/** Thay {năm} và {tên} trong dòng copyright */
export const copyrightText = (config: SiteConfig) =>
  config.copyright.replaceAll('{năm}', String(new Date().getFullYear())).replaceAll('{tên}', config.name)
