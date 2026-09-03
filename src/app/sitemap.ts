import type { MetadataRoute } from 'next'
import { fetchQuery } from '@/lib/graphql/client'
import { GET_SITEMAP_DATA } from '@/lib/graphql/queries/sitemap'
import { SITE_URL, EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'

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

  const posts: MetadataRoute.Sitemap = (data?.posts?.nodes ?? [])
    .filter((post) => {
      const categorySlug = post.categories.nodes[0]?.slug
      return categorySlug && !EXCLUDED_CATEGORY_SLUGS.includes(categorySlug)
    })
    .map((post) => {
      const categorySlug = post.categories.nodes[0].slug
      return {
        url: `${SITE_URL}/${categorySlug}/${post.slug}`,
        lastModified: new Date(post.modified),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    })

  const categories: MetadataRoute.Sitemap = (data?.categories?.nodes ?? [])
    .filter((cat) => !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug))
    .map((cat) => ({
      url: `${SITE_URL}/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/popular`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/standards`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...staticPages,
    ...categories,
    ...posts,
  ]
}
