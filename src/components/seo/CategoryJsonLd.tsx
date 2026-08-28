import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { WPPostCard } from '@/types/wordpress'

interface CategoryJsonLdProps {
  name: string
  slug: string
  description?: string
  posts: WPPostCard[]
}

export default function CategoryJsonLd({ name, slug, description, posts }: CategoryJsonLdProps) {
  const url = `${SITE_URL}/${slug}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url,
        name: `${name}推薦文章`,
        description: description || `${SITE_NAME} ${name}分類的推薦文章列表`,
        inLanguage: 'zh-TW',
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      },
      {
        '@type': 'ItemList',
        name: `${name}文章列表`,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: posts.length,
        itemListElement: posts.map((post, index) => {
          const categorySlug = post.categories.nodes[0]?.slug ?? slug
          return {
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/${categorySlug}/${post.slug}`,
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
