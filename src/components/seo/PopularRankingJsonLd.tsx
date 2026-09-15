import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { RankedArticle } from '@/views/popular-data'
import { LANG_TAG, langPrefix, ui, type Lang } from '@/lib/i18n'

interface PopularRankingJsonLdProps {
  lang: Lang
  items: RankedArticle[]
  description: string
  dateModified: string
}

export default function PopularRankingJsonLd({ lang, items, description, dateModified }: PopularRankingJsonLdProps) {
  const url = `${SITE_URL}${langPrefix(lang)}/popular`
  const name = ui(lang).popularTitle

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url,
        name,
        description,
        inLanguage: LANG_TAG[lang],
        dateModified,
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
      },
      {
        '@type': 'ItemList',
        name,
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
