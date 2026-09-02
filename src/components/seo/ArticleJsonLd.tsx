import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { resolveArticleType } from '@/lib/article-type'
import { WPPost } from '@/types/wordpress'

interface ArticleJsonLdProps {
  post: WPPost
}

// 中文沒有空白斷詞，字數用「去標籤後的字元數」估算，比照多數中文 CMS 的 wordCount 慣例
function estimateWordCount(html: string): number {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, '').length
}

export default function ArticleJsonLd({ post }: ArticleJsonLdProps) {
  const categorySlug = post.categories.nodes[0]?.slug ?? 'uncategorized'
  const url = `${SITE_URL}/${categorySlug}/${post.slug}`
  const articleType = resolveArticleType(post.articleTypes)
  const image = post.featuredImage?.node
  const imageWidth = image?.mediaDetails?.width
  const imageHeight = image?.mediaDetails?.height

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seo?.metaDesc || post.excerpt,
    articleSection: articleType.name,
    url,
    inLanguage: 'zh-TW',
    datePublished: post.date,
    dateModified: post.modified,
    wordCount: estimateWordCount(post.content),
    image: image?.sourceUrl
      ? imageWidth && imageHeight
        ? { '@type': 'ImageObject', url: image.sourceUrl, width: imageWidth, height: imageHeight }
        : [image.sourceUrl]
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
    isPartOf: {
      '@type': 'WebSite',
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
