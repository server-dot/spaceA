import type { Metadata } from 'next'
import { Suspense } from 'react'
import { GET_HOMEPAGE_POSTS } from '@/lib/graphql/queries/homepage'
import { fetchQuery } from '@/lib/graphql/client'
import { SITE_NAME, SITE_DESCRIPTION, POSTS_PER_PAGE } from '@/lib/constants'
import Hero from '@/components/layout/Hero'
import CategoryGrid from '@/components/layout/CategoryGrid'
import ArticleGrid from '@/components/article/ArticleGrid'
import { WPPostCard } from '@/types/wordpress'

export const revalidate = 3600

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
}

interface HomepageData {
  posts: { nodes: WPPostCard[] }
}

export default async function HomePage() {
  const data = await fetchQuery<HomepageData>(GET_HOMEPAGE_POSTS, {
    first: POSTS_PER_PAGE,
  })

  const posts = data?.posts?.nodes ?? []

  return (
    <>
      <Hero />

      <Suspense fallback={null}>
        <CategoryGrid />
      </Suspense>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">最新文章</h2>
        <ArticleGrid posts={posts} />
      </section>
    </>
  )
}
