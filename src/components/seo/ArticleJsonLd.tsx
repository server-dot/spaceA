import { EDITOR_SAME_AS, ORG_SAME_AS, SITE_NAME, SITE_URL } from '@/lib/constants'
import { resolveArticleType } from '@/lib/article-type'
import { LANG_TAG, articleHref, articleTypeLabel, langOfCategorySlug, langPrefix, ui } from '@/lib/i18n'
import { countWords, resolveSummary } from '@/lib/format'
import { ReferenceItem, deriveMetaDescription } from '@/lib/content-parsers'
import { WPPost } from '@/types/wordpress'
import socialCrops from '@/lib/social-crops.json'

interface ArticleJsonLdProps {
  post: WPPost
  /** 「參考資料」章的外部來源（parseArticleContent 的 references），有就輸出 citation */
  references?: ReferenceItem[] | null
  /** 前言第一段有標到 `.article-lead` 才輸出 speakable，選擇器對不到元素會被 Rich Results Test 報錯 */
  hasLead?: boolean
}

export default function ArticleJsonLd({ post, references, hasLead }: ArticleJsonLdProps) {
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
    // WPGraphQL 的 date／modified 是站台時區（Asia/Taipei）但不帶時區，Rich Results Test 會警告
    datePublished: withTaipeiOffset(post.date),
    dateModified: withTaipeiOffset(post.modified),
    wordCount: countWords(post.content, lang),
    image: articleImages(image?.sourceUrl, imageWidth, imageHeight),
    // WordPress 的作者帳號是 admin，文章頁顯示的編者是阿康，兩邊要一致才有 E-E-A-T 意義
    author: {
      '@type': 'Person',
      name: ui(lang).editorName,
      jobTitle: ui(lang).editorRole,
      url: `${SITE_URL}${langPrefix(lang)}/about`,
      sameAs: EDITOR_SAME_AS.length > 0 ? EDITOR_SAME_AS : undefined,
      worksFor: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      sameAs: ORG_SAME_AS.length > 0 ? ORG_SAME_AS : undefined,
    },
    // 參考資料章的來源列成 citation：AI 引擎判斷「這篇有沒有查證」最直接的機器可讀訊號
    citation:
      references && references.length > 0
        ? references.map((r) => ({ '@type': 'CreativeWork', name: r.name, url: r.url }))
        : undefined,
    // 標題＋前言第一段（含 <strong> 的可引用結論）給語音助理／AI 摘要直接取用
    speakable: hasLead
      ? { '@type': 'SpeakableSpecification', cssSelector: ['article h1', '.article-lead'] }
      : undefined,
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

/**
 * Google 的縮圖框接近正方形，只給 16:9 的封面會上下留白（搜尋結果就是一條橫的）。
 * 官方建議同一篇提供 16x9／4x3／1x1 三種比例讓它自己挑版位，
 * 4:3 與 1:1 是 scripts/make_social_crops.py 從第一張卡片圖裁出來的，對照表存在 social-crops.json。
 * 沒跑過那支腳本的文章查不到表，就只輸出封面，行為跟以前一樣。
 */
function articleImages(cover?: string, width?: number, height?: number) {
  if (!cover) return undefined
  const main =
    width && height
      ? { '@type': 'ImageObject', url: cover, width, height }
      : { '@type': 'ImageObject', url: cover }
  const extra = (socialCrops as Record<string, { '4x3'?: string; '1x1'?: string }>)[cover]
  if (!extra) return main
  return [
    main,
    ...(extra['4x3'] ? [{ '@type': 'ImageObject', url: extra['4x3'], width: 1200, height: 900 }] : []),
    ...(extra['1x1'] ? [{ '@type': 'ImageObject', url: extra['1x1'], width: 1200, height: 1200 }] : []),
  ]
}

/** 沒有時區的 ISO 字串補上 +08:00；已經帶 Z 或偏移量的原樣回傳 */
function withTaipeiOffset(iso: string) {
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(iso) ? iso : `${iso}+08:00`
}
