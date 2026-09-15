import type { Metadata } from 'next'
import { GET_SEARCH_POSTS } from '@/lib/graphql/queries/search'
import { fetchQuery } from '@/lib/graphql/client'
import ArticleGrid from '@/components/article/ArticleGrid'
import { WPPostCard } from '@/types/wordpress'
import { EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import { langOfCategorySlug, ui, type Lang } from '@/lib/i18n'

export interface SearchRouteProps {
  searchParams: Promise<{ q?: string }>
}

interface SearchData {
  posts: { nodes: WPPostCard[] }
}

export function searchMetadata(lang: Lang): Metadata {
  return { title: ui(lang).search, robots: { index: false } }
}

/** 搜尋頁本體，中英文各自的 page.tsx 只是薄殼。WP 搜尋是中英文混在一起回來的，依語言過濾 */
export default async function SearchView({ lang, searchParams }: SearchRouteProps & { lang: Lang }) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const t = ui(lang)

  const data = query ? await fetchQuery<SearchData>(GET_SEARCH_POSTS, { query, first: 48 }) : null

  const posts = (data?.posts?.nodes ?? [])
    .filter((post) => {
      const categorySlug = post.categories.nodes[0]?.slug
      return categorySlug && !EXCLUDED_CATEGORY_SLUGS.includes(categorySlug) && langOfCategorySlug(categorySlug) === lang
    })
    .slice(0, 24)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {query ? t.searchResultsFor(query) : t.search}
        </h1>
        {query && <p className="text-gray-500 mt-1">{t.searchCount(posts.length)}</p>}
      </div>

      {!query ? (
        <p className="text-gray-400">{t.searchPrompt}</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">{t.searchEmpty}</p>
      ) : (
        <ArticleGrid lang={lang} posts={posts} />
      )}
    </div>
  )
}
