import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { GET_CATEGORY, GET_ALL_CATEGORIES } from '@/lib/graphql/queries/category'
import { GET_NAVIGATION } from '@/lib/graphql/queries/navigation'
import { fetchQuery } from '@/lib/graphql/client'
import { POSTS_PER_PAGE, EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import CategoryImage from '@/components/layout/CategoryImage'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import CategoryJsonLd from '@/components/seo/CategoryJsonLd'
import CategoryPageClient from './CategoryPageClient'
import { WPPostCard, WPCategory } from '@/types/wordpress'
import { WPSeo } from '@/types/seo'
import { decodeRouteParam } from '@/lib/route-params'

export const revalidate = 3600

interface Props {
  params: Promise<{ category: string }>
}

interface CategoryData {
  category: {
    name: string
    slug: string
    description: string
    seo: WPSeo
    posts: {
      pageInfo: { hasNextPage: boolean; endCursor: string }
      nodes: WPPostCard[]
    }
  } | null
}

interface AllCategoriesData {
  categories: { nodes: WPCategory[] }
}

export async function generateStaticParams() {
  const data = await fetchQuery<AllCategoriesData>(GET_ALL_CATEGORIES)
  return (data?.categories?.nodes ?? [])
    .filter((cat) => !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug))
    .map((cat) => ({ category: cat.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: rawSlug } = await params
  const slug = decodeRouteParam(rawSlug)
  if (EXCLUDED_CATEGORY_SLUGS.includes(slug)) return {}

  const data = await fetchQuery<CategoryData>(GET_CATEGORY, { slug, first: 1 })
  const cat = data?.category
  if (!cat) return {}

  return {
    title: cat.seo?.title || cat.name,
    description: cat.seo?.metaDesc || cat.description || '',
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: cat.seo?.opengraphTitle || cat.name,
      description: cat.seo?.opengraphDescription || cat.description || '',
      images: cat.seo?.opengraphImage?.sourceUrl
        ? [{ url: cat.seo.opengraphImage.sourceUrl }]
        : undefined,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category: rawSlug } = await params
  const slug = decodeRouteParam(rawSlug)
  if (EXCLUDED_CATEGORY_SLUGS.includes(slug)) notFound()

  const [data, navData] = await Promise.all([
    fetchQuery<CategoryData>(GET_CATEGORY, { slug, first: POSTS_PER_PAGE * 2 }),
    fetchQuery<AllCategoriesData>(GET_NAVIGATION),
  ])

  const cat = data?.category
  if (!cat) notFound()

  const posts = cat.posts?.nodes ?? []
  const otherCategories = (navData?.categories?.nodes ?? [])
    .filter((c) => c.slug !== slug && !EXCLUDED_CATEGORY_SLUGS.includes(c.slug))
    .slice(0, 4)
  const breadcrumbs = [
    { label: '首頁', href: '/' },
    { label: cat.name, href: `/${slug}` },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <CategoryJsonLd name={cat.name} slug={slug} description={cat.description} posts={posts} />

      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pt-7">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          <section className="pt-6 pb-7 border-b border-paper-border">
            <div className="max-w-2xl">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink">
                {cat.name}
              </h1>
              {cat.description && (
                <p className="text-[15px] leading-loose text-paper-secondary mt-3 text-balance">
                  {cat.description}
                </p>
              )}
              <p className="text-xs text-paper-muted mt-2.5">共 {posts.length} 篇</p>
            </div>
          </section>

          <Suspense fallback={null}>
            <CategoryPageClient categoryName={slug} posts={posts} />
          </Suspense>

          {otherCategories.length > 0 && (
            <section className="mt-16 bg-white border border-paper-border rounded-2xl p-9">
              <div className="text-xs tracking-wider text-brand-600 font-bold">其他分類</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                {otherCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${c.slug}`}
                    className="flex items-center gap-3.5 p-3.5 border border-paper-border rounded-2xl bg-white hover:border-brand-600 transition-colors"
                  >
                    <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-paper-surface">
                      <CategoryImage slug={c.slug} name={c.name} />
                    </div>
                    <div>
                      <b className="block text-[15px] font-medium text-paper-ink">{c.name}</b>
                      {c.count != null && <span className="text-xs text-paper-muted">{c.count} 篇</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="h-16 sm:h-20" />
        </div>
      </div>
    </>
  )
}
