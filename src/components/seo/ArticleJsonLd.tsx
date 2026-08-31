import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { resolveArticleType } from '@/lib/article-type'
import { WPPost } from '@/types/wordpress'

interface ArticleJsonLdProps {
  post: WPPost
}

export default function ArticleJsonLd({ post }: ArticleJsonLdProps) {
  const categorySlug = post.categories.nodes[0]?.slug ?? 'uncategorized'
  const url = `${SITE_URL}/${categorySlug}/${post.slug}`
  const articleType = resolveArticleType(post.articleTypes)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seo?.metaDesc || post.excerpt,
    articleSection: articleType.name,
    url,
    datePublished: post.date,
    dateModified: post.modified,
    image: post.featuredImage?.node?.sourceUrl
      ? [post.featuredImage.node.sourceUrl]
      : undefined,
    author: {
      '@type': 'Person',
      name: post.author?.node?.name ?? SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
