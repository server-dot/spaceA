import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import PopularRankingJsonLd from '@/components/seo/PopularRankingJsonLd'
import PopularRankingClient from './PopularRankingClient'
import { type RankedArticle } from './popular-data'
import { GET_LATEST_POSTS } from '@/lib/graphql/queries/popular'
import { GET_NAVIGATION } from '@/lib/graphql/queries/navigation'
import { fetchQuery } from '@/lib/graphql/client'
import { SITE_NAME, EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import { formatDate, resolveSummary } from '@/lib/format'
import { WPPostCard, WPCategory } from '@/types/wordpress'
import { LANG_TAG, OG_LOCALE, articleHref, homeHref, langOfCategorySlug, langPrefix, ui, type Lang, staticAlternates } from '@/lib/i18n'

interface LatestPostsData {
  posts: { nodes: WPPostCard[] }
}

interface NavigationData {
  categories: { nodes: WPCategory[] }
}

/** 熱門排行頁的 metadata／頁面本體，中英文各自的 page.tsx 只是薄殼 */
export function popularMetadata(lang: Lang): Metadata {
  const t = ui(lang)
  const path = `${langPrefix(lang)}/popular`
  return {
    title: t.popularTitle,
    description: t.popularDescription,
    alternates: staticAlternates(lang, '/popular'),
    // 子頁的 openGraph 會整組蓋掉 layout 的，圖片與 siteName 要自己帶，不然分享出去沒有預覽圖
    openGraph: {
      type: 'website',
      locale: OG_LOCALE[lang],
      siteName: SITE_NAME,
      title: t.popularTitle,
      description: t.popularDescription,
      images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
    },
  }
}

export default async function PopularView({ lang }: { lang: Lang }) {
  const t = ui(lang)
  const isLang = (slug: string) => !EXCLUDED_CATEGORY_SLUGS.includes(slug) && langOfCategorySlug(slug) === lang
  const breadcrumbs = [
    { label: t.home, href: homeHref(lang) },
    { label: t.popularTitle, href: `${langPrefix(lang)}/popular` },
  ]
  const [postsData, catsData] = await Promise.all([
    // 中英文文章混在一起回來，多抓一點再依語言過濾
    fetchQuery<LatestPostsData>(GET_LATEST_POSTS, { first: 60 }),
    // 「換個主題看」只列有文章的分類（0 篇的不顯示）
    fetchQuery<NavigationData>(GET_NAVIGATION),
  ])

  const posts = (postsData?.posts?.nodes ?? []).filter((post) => {
    const categorySlug = post.categories.nodes[0]?.slug
    return categorySlug && isLang(categorySlug)
  })

  const articles: RankedArticle[] = posts.slice(0, 10).map((post) => {
    const category = post.categories.nodes[0]
    const image = post.featuredImage?.node
      ? { url: post.featuredImage.node.sourceUrl, alt: post.featuredImage.node.altText || post.title }
      : null
    return {
      cat: category?.name ?? t.uncategorized,
      catSlug: category?.slug ?? '',
      date: formatDate(post.date, lang),
      dateISO: post.date,
      title: post.title,
      excerpt: resolveSummary(post.excerpt),
      href: articleHref(lang, category?.slug ?? '', post.slug),
      image,
    }
  })

  const categories = (catsData?.categories?.nodes ?? [])
    .filter((cat) => isLang(cat.slug) && (cat.count ?? 0) > 0)
    .map((cat) => ({ ...cat, count: cat.count ?? 0 }))
    .sort((a, b) => b.count - a.count)

  const dateModified = articles[0]?.dateISO ?? new Date().toISOString()

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PopularRankingJsonLd lang={lang} items={articles} description={t.popularDescription} dateModified={dateModified} />
      <PopularRankingClient lang={lang} articles={articles} categories={categories} />
    </>
  )
}
