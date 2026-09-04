import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import PopularRankingJsonLd from '@/components/seo/PopularRankingJsonLd'
import PopularRankingClient from './PopularRankingClient'
import { POPULAR_PAGE_DESCRIPTION, type RankedArticle } from './data'
import { GET_LATEST_POSTS } from '@/lib/graphql/queries/popular'
import { GET_ALL_CATEGORIES, GET_NAVIGATION } from '@/lib/graphql/queries/navigation'
import { fetchQuery } from '@/lib/graphql/client'
import { EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import { formatDate, stripHtml } from '@/lib/format'
import { WPPostCard, WPCategory } from '@/types/wordpress'

export const revalidate = 3600

const BREADCRUMBS = [
  { label: '首頁', href: '/' },
  { label: '熱門排行', href: '/popular' },
]

interface LatestPostsData {
  posts: { nodes: WPPostCard[] }
}

interface NavigationData {
  categories: { nodes: WPCategory[] }
}

export const metadata: Metadata = {
  title: '熱門排行',
  description: POPULAR_PAGE_DESCRIPTION,
  alternates: { canonical: '/popular' },
  openGraph: {
    title: '熱門排行',
    description: POPULAR_PAGE_DESCRIPTION,
  },
}

export default async function PopularPage() {
  const [postsData, allCatsData, countedCatsData] = await Promise.all([
    fetchQuery<LatestPostsData>(GET_LATEST_POSTS, { first: 30 }),
    fetchQuery<NavigationData>(GET_ALL_CATEGORIES),
    // WPGraphQL 的 count 欄位在 hideEmpty:false 時永遠回傳 null（WPGraphQL 本身的怪癖），
    // 所以有文章數的分類要另外用 hideEmpty:true 查一次才拿得到真正的數字，兩邊用 slug 合併
    fetchQuery<NavigationData>(GET_NAVIGATION),
  ])

  const posts = (postsData?.posts?.nodes ?? []).filter((post) => {
    const categorySlug = post.categories.nodes[0]?.slug
    return categorySlug && !EXCLUDED_CATEGORY_SLUGS.includes(categorySlug)
  })

  const articles: RankedArticle[] = posts.slice(0, 10).map((post) => {
    const category = post.categories.nodes[0]
    const image = post.featuredImage?.node
      ? { url: post.featuredImage.node.sourceUrl, alt: post.featuredImage.node.altText || post.title }
      : null
    return {
      cat: category?.name ?? '未分類',
      catSlug: category?.slug ?? '',
      date: formatDate(post.date),
      dateISO: post.date,
      title: post.title,
      excerpt: post.excerpt ? stripHtml(post.excerpt) : '',
      href: `/${category?.slug}/${post.slug}`,
      image,
    }
  })

  const countBySlug = new Map(
    (countedCatsData?.categories?.nodes ?? []).map((cat) => [cat.slug, cat.count ?? 0])
  )
  const categories = (allCatsData?.categories?.nodes ?? [])
    .filter((cat) => !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug))
    .map((cat) => ({ ...cat, count: countBySlug.get(cat.slug) ?? 0 }))
    .sort((a, b) => b.count - a.count)

  const dateModified = articles[0]?.dateISO ?? new Date().toISOString()

  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <PopularRankingJsonLd
        items={articles}
        description={POPULAR_PAGE_DESCRIPTION}
        dateModified={dateModified}
      />
      <PopularRankingClient articles={articles} categories={categories} />
    </>
  )
}
