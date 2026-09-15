import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { resolveArticleType } from '@/lib/article-type'
import { LANG_TAG, articleHref, articleTypeLabel, langOfCategorySlug, ui } from '@/lib/i18n'
import { countWords, resolveSummary } from '@/lib/format'
import { deriveMetaDescription } from '@/lib/content-parsers'
import { WPPost } from '@/types/wordpress'

interface ArticleJsonLdProps {
  post: WPPost
}

export default function ArticleJsonLd({ post }: ArticleJsonLdProps) {
  const categorySlug = post.categories.nodes[0]?.slug ?? 'uncategorized'
  const lang = langOfCategorySlug(categorySlug)
  const url = `${SITE_URL}${articleHref(lang, categorySlug, post.slug)}`
  const articleType = resolveArticleType(post.articleTypes)
  const image = post.featuredImage?.node
  const imageWidth = image?.mediaDetails?.width
  const imageHeight = image?.mediaDetails?.height

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    // 跟 <meta name="description"> 走同一套：直接吃 post.excerpt 會把 HTML 標籤與
    // WordPress 的截斷符號（[&hellip;]）原封不動送進結構化資料
    description: resolveSummary(post.excerpt, post.seo?.metaDesc) || deriveMetaDescription(post.content),
    articleSection: articleTypeLabel(lang, articleType),
    url,
    inLanguage: LANG_TAG[lang],
    datePublished: post.date,
    dateModified: post.modified,
    wordCount: countWords(post.content, lang),
    image: image?.sourceUrl
      ? imageWidth && imageHeight
        ? { '@type': 'ImageObject', url: image.sourceUrl, width: imageWidth, height: imageHeight }
        : [image.sourceUrl]
      : undefined,
    // WordPress 的作者帳號是 admin，文章頁顯示的編者是阿康，兩邊要一致才有 E-E-A-T 意義
    author: {
      '@type': 'Person',
      name: ui(lang).editorName,
      jobTitle: ui(lang).editorRole,
      worksFor: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
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
