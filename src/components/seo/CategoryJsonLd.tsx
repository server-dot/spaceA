import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { LANG_TAG, articleHref, categoryHref, ui, type Lang } from '@/lib/i18n'
import { WPPostCard } from '@/types/wordpress'

interface CategoryJsonLdProps {
  lang: Lang
  name: string
  /** WordPress 分類 slug（英文版帶 -en） */
  slug: string
  description?: string
  posts: WPPostCard[]
}

export default function CategoryJsonLd({ lang, name, slug, description, posts }: CategoryJsonLdProps) {
  const t = ui(lang)
  const url = `${SITE_URL}${categoryHref(lang, slug)}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url,
        name: t.categoryCollection(name),
        description: description || t.categoryCollectionDesc(name),
        inLanguage: LANG_TAG[lang],
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      },
      {
        '@type': 'ItemList',
        name: t.categoryList(name),
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: posts.length,
        itemListElement: posts.map((post, index) => {
          const categorySlug = post.categories.nodes[0]?.slug ?? slug
          return {
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}${articleHref(lang, categorySlug, post.slug)}`,
            name: post.title,
          }
        }),
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
