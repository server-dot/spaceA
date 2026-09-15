import type { MetadataRoute } from 'next'
import { fetchQuery } from '@/lib/graphql/client'
import { GET_SITEMAP_DATA } from '@/lib/graphql/queries/sitemap'
import { SITE_URL, EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import { LANG_TAG, articleHref, categoryHref, langOfCategorySlug, toRouteSlug } from '@/lib/i18n'

export const revalidate = 3600

interface SitemapData {
  posts: {
    nodes: Array<{
      slug: string
      modified: string
      categories: { nodes: Array<{ slug: string }> }
    }>
  }
  categories: {
    nodes: Array<{ slug: string }>
  }
}

// 中英文兩種語言的對照頁互掛 hreflang（Google 的 sitemap 寫法：每個網址各列一次，各自帶完整的 alternates）
function languageAlternates(zhUrl: string, enUrl: string | null) {
  if (!enUrl) return undefined
  return { languages: { [LANG_TAG.zh]: zhUrl, [LANG_TAG.en]: enUrl, 'x-default': zhUrl } }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await fetchQuery<SitemapData>(GET_SITEMAP_DATA)

  const allPosts = (data?.posts?.nodes ?? []).filter((post) => {
    const categorySlug = post.categories.nodes[0]?.slug
    return categorySlug && !EXCLUDED_CATEGORY_SLUGS.includes(categorySlug)
  })
  // 英文文章 slug = 中文 slug + -en，用路由 slug 對起來
  const enPostSlugs = new Set(
    allPosts.filter((p) => langOfCategorySlug(p.categories.nodes[0].slug) === 'en').map((p) => toRouteSlug(p.slug))
  )
  const posts: MetadataRoute.Sitemap = allPosts.map((post) => {
    const categorySlug = post.categories.nodes[0].slug
    const lang = langOfCategorySlug(categorySlug)
    const zhUrl = `${SITE_URL}${articleHref('zh', categorySlug, post.slug)}`
    const enUrl = enPostSlugs.has(toRouteSlug(post.slug)) ? `${SITE_URL}${articleHref('en', categorySlug, post.slug)}` : null
    return {
      url: `${SITE_URL}${articleHref(lang, categorySlug, post.slug)}`,
      lastModified: new Date(post.modified),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: languageAlternates(zhUrl, enUrl),
    }
  })

  const allCategories = (data?.categories?.nodes ?? []).filter((cat) => !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug))
  const enCategorySlugs = new Set(
    allCategories.filter((c) => langOfCategorySlug(c.slug) === 'en').map((c) => toRouteSlug(c.slug))
  )
  const categories: MetadataRoute.Sitemap = allCategories.map((cat) => {
    const lang = langOfCategorySlug(cat.slug)
    const zhUrl = `${SITE_URL}${categoryHref('zh', cat.slug)}`
    const enUrl = enCategorySlugs.has(toRouteSlug(cat.slug)) ? `${SITE_URL}${categoryHref('en', cat.slug)}` : null
    return {
      url: `${SITE_URL}${categoryHref(lang, cat.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
      alternates: languageAlternates(zhUrl, enUrl),
    }
  })

  // 固定頁面中英文都有，兩個網址各列一次、互掛 hreflang
  const staticDefs: Array<[string, MetadataRoute.Sitemap[number]['changeFrequency'], number]> = [
    ['/popular', 'weekly', 0.7],
    ['/about', 'monthly', 0.5],
    ['/standards', 'monthly', 0.5],
    ['/contact', 'yearly', 0.3],
    ['/privacy', 'yearly', 0.3],
    ['/terms', 'yearly', 0.3],
  ]
  const staticPages: MetadataRoute.Sitemap = staticDefs.flatMap(([path, changeFrequency, priority]) => {
    const zhUrl = `${SITE_URL}${path}`
    const enUrl = `${SITE_URL}/en${path}`
    const alternates = languageAlternates(zhUrl, enUrl)
    return [
      { url: zhUrl, lastModified: new Date(), changeFrequency, priority, alternates },
      { url: enUrl, lastModified: new Date(), changeFrequency, priority: priority - 0.1, alternates },
    ]
  })

  const homeAlternates = languageAlternates(SITE_URL, `${SITE_URL}/en`)
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: homeAlternates,
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: homeAlternates,
    },
    ...staticPages,
    ...categories,
    ...posts,
  ]
}
