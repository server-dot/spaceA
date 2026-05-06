import type { Metadata } from 'next'
import { GET_SEARCH_POSTS } from '@/lib/graphql/queries/search'
import { fetchQuery } from '@/lib/graphql/client'
import ArticleGrid from '@/components/article/ArticleGrid'
import { WPPostCard } from '@/types/wordpress'

interface Props {
  searchParams: Promise<{ q?: string }>
}

interface SearchData {
  posts: { nodes: WPPostCard[] }
}

export function generateMetadata(): Metadata {
  return { title: '搜尋', robots: { index: false } }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const data = query
    ? await fetchQuery<SearchData>(GET_SEARCH_POSTS, { query, first: 24 })
    : null

  const posts = data?.posts?.nodes ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {query ? `「${query}」的搜尋結果` : '搜尋'}
        </h1>
        {query && (
          <p className="text-gray-500 mt-1">共找到 {posts.length} 篇文章</p>
        )}
      </div>

      {!query ? (
        <p className="text-gray-400">請輸入關鍵字搜尋</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">找不到相關文章，試試其他關鍵字</p>
      ) : (
        <ArticleGrid posts={posts} />
      )}
    </div>
  )
}
