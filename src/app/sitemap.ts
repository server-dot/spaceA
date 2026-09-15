import type { MetadataRoute } from 'next'
import { fetchQuery } from '@/lib/graphql/client'
import { GET_SITEMAP_DATA } from '@/lib/graphql/queries/sitemap'
import { SITE_URL, EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import {
  LANGS,
  LANG_TAG,
  articleHref,
  categoryHref,
  langOfCategorySlug,
  langPrefix,
  toRouteSlug,
  type Lang,
} from '@/lib/i18n'

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

/**
 * 同一份內容在各語言的網址互掛 hreflang（Google 的 sitemap 寫法：每個網址各列一次，
 * 各自帶完整的 alternates）。只列真的存在的語言，沒翻的不能指向 404。
 */
function alternatesFor(langs: Lang[], hrefOf: (lang: Lang) => string) {
  if (langs.length < 2) return undefined
  return {
    languages: {
      ...Object.fromEntries(langs.map((l) => [LANG_TAG[l], hrefOf(l)])),
      'x-default': hrefOf('zh'),
    },
  }
}

/** 把同一篇內容的各語言版本依「去掉語言後綴的 slug」歸成一組 */
function groupByRouteSlug(slugs: string[]) {
  const map = new Map<string, Set<Lang>>()
  for (const slug of slugs) {
    const key = toRouteSlug(slug)
    if (!map.has(key)) map.set(key, new Set())
    map.get(key)!.add(langOfCategorySlug(slug))
  }
  return map
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await fetchQuery<SitemapData>(GET_SITEMAP_DATA)

  const allPosts = (data?.posts?.nodes ?? []).filter((post) => {
    const categorySlug = post.categories.nodes[0]?.slug
    return categorySlug && !EXCLUDED_CATEGORY_SLUGS.includes(categorySlug)
  })
  // 文章的語言看它自己的 slug 後綴，但分組要用文章 slug（分類 slug 只決定網址第一段）
  const postLangs = groupByRouteSlug(allPosts.map((p) => p.slug))
  const posts: MetadataRoute.Sitemap = allPosts.map((post) => {
    const categorySlug = post.categories.nodes[0].slug
    const lang = langOfCategorySlug(post.slug)
    const langs = LANGS.filter((l) => postLangs.get(toRouteSlug(post.slug))?.has(l))
    return {
      url: `${SITE_URL}${articleHref(lang, categorySlug, post.slug)}`,
      lastModified: new Date(post.modified),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: alternatesFor(langs, (l) => `${SITE_URL}${articleHref(l, categorySlug, post.slug)}`),
    }
  })

  const allCategories = (data?.categories?.nodes ?? []).filter(
    (cat) => !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug)
  )
  const categoryLangs = groupByRouteSlug(allCategories.map((c) => c.slug))
  const categories: MetadataRoute.Sitemap = allCategories.map((cat) => {
    const lang = langOfCategorySlug(cat.slug)
    const langs = LANGS.filter((l) => categoryLangs.get(toRouteSlug(cat.slug))?.has(l))
    return {
      url: `${SITE_URL}${categoryHref(lang, cat.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
      alternates: alternatesFor(langs, (l) => `${SITE_URL}${categoryHref(l, cat.slug)}`),
    }
  })

  // 固定頁面四個語言都有，每個網址各列一次、互掛 hreflang
  const staticDefs: Array<[string, MetadataRoute.Sitemap[number]['changeFrequency'], number]> = [
    ['/', 'daily', 1.0],
    ['/popular', 'weekly', 0.7],
    ['/about', 'monthly', 0.5],
    ['/standards', 'monthly', 0.5],
    ['/contact', 'yearly', 0.3],
    ['/privacy', 'yearly', 0.3],
    ['/terms', 'yearly', 0.3],
  ]
  const urlOf = (lang: Lang, path: string) =>
    path === '/' ? `${SITE_URL}${langPrefix(lang) || '/'}` : `${SITE_URL}${langPrefix(lang)}${path}`
  const staticPages: MetadataRoute.Sitemap = staticDefs.flatMap(([path, changeFrequency, priority]) => {
    const alternates = alternatesFor(LANGS, (l) => urlOf(l, path))
    // 中文是主站給原本的權重，其他語言低一階
    return LANGS.map((lang) => ({
      url: urlOf(lang, path),
      lastModified: new Date(),
      changeFrequency,
      priority: lang === 'zh' ? priority : Math.max(0.1, priority - 0.1),
      alternates,
    }))
  })

  return [...staticPages, ...categories, ...posts]
}
