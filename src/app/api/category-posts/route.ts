import { NextRequest, NextResponse } from 'next/server'
import { GET_CATEGORY } from '@/lib/graphql/queries/category'
import { fetchQuery } from '@/lib/graphql/client'
import { POSTS_PER_PAGE, EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import { WPPostCard } from '@/types/wordpress'

interface CategoryPostsData {
  category: {
    posts: {
      pageInfo: { hasNextPage: boolean; endCursor: string }
      nodes: WPPostCard[]
    }
  } | null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const after = searchParams.get('after') ?? undefined

  if (!slug || EXCLUDED_CATEGORY_SLUGS.includes(slug)) {
    return NextResponse.json({ message: '缺少分類 slug' }, { status: 400 })
  }

  const data = await fetchQuery<CategoryPostsData>(GET_CATEGORY, {
    slug,
    first: POSTS_PER_PAGE,
    after,
  })

  const posts = data?.category?.posts?.nodes ?? []
  const pageInfo = data?.category?.posts?.pageInfo ?? { hasNextPage: false, endCursor: '' }

  return NextResponse.json({ posts, pageInfo })
}
