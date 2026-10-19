import type { PageLink, PostCategory } from './lib/db'

// Dữ liệu dùng chung cho mọi trang HTML (menu, footer), nạp một lần mỗi request
export type SiteNav = {
  postCategories: PostCategory[]
  pages: PageLink[]
}

export type AppEnv = {
  Bindings: CloudflareBindings
  Variables: { nav: SiteNav }
}
