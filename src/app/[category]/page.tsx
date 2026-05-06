import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GET_CATEGORY, GET_ALL_CATEGORIES } from '@/lib/graphql/queries/category'
import { fetchQuery } from '@/lib/graphql/client'
import { POSTS_PER_PAGE } from '@/lib/constants'
import ArticleGrid from '@/components/article/ArticleGrid'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import { WPPostCard, WPCategory } from '@/types/wordpress'
import { WPSeo } from '@/types/seo'

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
  return (data?.categories?.nodes ?? []).map((cat) => ({ category: cat.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
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
  const { category: slug } = await params
  const data = await fetchQuery<CategoryData>(GET_CATEGORY, {
    slug,
    first: POSTS_PER_PAGE,
  })

  const cat = data?.category
  if (!cat) notFound()

  const posts = cat.posts?.nodes ?? []
  const breadcrumbs = [
    { label: '首頁', href: '/' },
    { label: cat.name, href: `/${slug}` },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 space-y-3">
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="text-2xl font-bold text-gray-900">{cat.name}</h1>
          {cat.description && (
            <p className="text-gray-500">{cat.description}</p>
          )}
        </div>
        <ArticleGrid posts={posts} />
      </div>
    </>
  )
}
