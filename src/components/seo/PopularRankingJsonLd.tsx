import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { RankedArticle } from '@/app/popular/data'

interface PopularRankingJsonLdProps {
  items: RankedArticle[]
  description: string
  dateModified: string
}

export default function PopularRankingJsonLd({
  items,
  description,
  dateModified,
}: PopularRankingJsonLdProps) {
  const url = `${SITE_URL}/popular`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url,
        name: '本週熱門排行',
        description,
        inLanguage: 'zh-TW',
        dateModified,
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
      },
      {
        '@type': 'ItemList',
        name: '本週熱門排行',
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_URL}${item.href}`,
          name: item.title,
        })),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
