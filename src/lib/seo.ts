import type { Post } from './db'
import { mediaUrl } from './format'
import { OWNER } from './site'

export type Crumb = { name: string; path: string }

export const absoluteUrl = (siteUrl: string, path: string) => new URL(path, siteUrl).toString()

// D1 lưu "YYYY-MM-DD HH:MM:SS" theo UTC
export const isoDate = (value: string | null) => (value ? value.replace(' ', 'T') + 'Z' : undefined)

const ownerJsonLd = (siteUrl: string) => ({
  '@type': 'Person',
  '@id': `${siteUrl}/#owner`,
  name: OWNER.name,
  jobTitle: OWNER.role,
  url: absoluteUrl(siteUrl, '/gioi-thieu#tac-gia'),
})

export const organizationJsonLd = (siteUrl: string, siteName: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: siteName,
  url: siteUrl,
  logo: absoluteUrl(siteUrl, '/favicon.svg'),
  email: OWNER.email,
  telephone: OWNER.phoneIntl,
  founder: ownerJsonLd(siteUrl),
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    telephone: OWNER.phoneIntl,
    email: OWNER.email,
    availableLanguage: 'vi',
  },
})

export const websiteJsonLd = (siteUrl: string, siteName: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  name: siteName,
  url: siteUrl,
  inLanguage: 'vi',
  publisher: { '@id': `${siteUrl}/#organization` },
})

export const breadcrumbJsonLd = (siteUrl: string, crumbs: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: absoluteUrl(siteUrl, c.path),
  })),
})

export const articleJsonLd = (siteUrl: string, post: Post) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.excerpt,
  inLanguage: 'vi',
  mainEntityOfPage: absoluteUrl(siteUrl, `/bai-viet/${post.slug}`),
  datePublished: isoDate(post.published_at),
  dateModified: isoDate(post.updated_at),
  image: post.cover_key ? [absoluteUrl(siteUrl, mediaUrl(post.cover_key))] : undefined,
  author: post.author && post.author !== OWNER.name ? { '@type': 'Person', name: post.author } : ownerJsonLd(siteUrl),
  publisher: { '@id': `${siteUrl}/#organization` },
})
