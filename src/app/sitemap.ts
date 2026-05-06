import type { MetadataRoute } from 'next'
import { fetchQuery } from '@/lib/graphql/client'
import { GET_SITEMAP_DATA } from '@/lib/graphql/queries/sitemap'
import { SITE_URL } from '@/lib/constants'

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await fetchQuery<SitemapData>(GET_SITEMAP_DATA)

  const posts: MetadataRoute.Sitemap = (data?.posts?.nodes ?? []).map((post) => {
    const categorySlug = post.categories.nodes[0]?.slug ?? 'uncategorized'
    return {
      url: `${SITE_URL}/${categorySlug}/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: 'weekly',
      priority: 0.7,
    }
  })

  const categories: MetadataRoute.Sitemap = (data?.categories?.nodes ?? []).map((cat) => ({
    url: `${SITE_URL}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...categories,
    ...posts,
  ]
}
