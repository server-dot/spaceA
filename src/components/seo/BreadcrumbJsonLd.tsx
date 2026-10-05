import { SITE_URL } from '@/lib/constants'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[]
  /** 給文章頁的 WebPage.breadcrumb 指過來用 */
  id?: string
}

export default function BreadcrumbJsonLd({ items, id }: BreadcrumbJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    ...(id ? { '@id': id } : {}),
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
