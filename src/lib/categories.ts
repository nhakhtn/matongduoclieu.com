export type Category = {
  slug: string
  name: string
  description: string
}

export const CATEGORIES: Category[] = [
  {
    slug: 'mat-ong',
    name: 'Mật ong',
    description: 'Kiến thức về mật ong: lịch sử, văn hoá, các loại mật vùng miền, cách chọn và dùng mật ong đúng cách.',
  },
  {
    slug: 'duoc-lieu',
    name: 'Dược liệu',
    description: 'Tìm hiểu các vị dược liệu quý như nhân sâm, nhung hươu, quế, linh chi: nguồn gốc, công dụng theo Đông y và lưu ý khi dùng.',
  },
]

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug)
