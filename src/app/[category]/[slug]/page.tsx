import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { GET_ARTICLE, GET_ALL_POST_SLUGS } from '@/lib/graphql/queries/article'
import { fetchQuery } from '@/lib/graphql/client'
import { WPPost } from '@/types/wordpress'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ArticleBody from '@/components/article/ArticleBody'
import ArticleMeta from '@/components/article/ArticleMeta'
import ArticleJsonLd from '@/components/seo/ArticleJsonLd'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

interface ArticleData {
  post: WPPost | null
}

interface AllSlugsData {
  posts: {
    nodes: Array<{
      slug: string
      categories: { nodes: Array<{ slug: string }> }
    }>
  }
}

export async function generateStaticParams() {
  const data = await fetchQuery<AllSlugsData>(GET_ALL_POST_SLUGS)
  return (data?.posts?.nodes ?? []).flatMap((post) =>
    post.categories.nodes.map((cat) => ({
      category: cat.slug,
      slug: post.slug,
    }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await fetchQuery<ArticleData>(GET_ARTICLE, { slug })
  const post = data?.post
  if (!post) return {}

  const categorySlug = post.categories.nodes[0]?.slug ?? ''
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.metaDesc || '',
    alternates: { canonical: `/${categorySlug}/${post.slug}` },
    openGraph: {
      title: post.seo?.opengraphTitle || post.title,
      description: post.seo?.opengraphDescription || '',
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
      images: post.seo?.opengraphImage?.sourceUrl
        ? [{ url: post.seo.opengraphImage.sourceUrl }]
        : post.featuredImage?.node?.sourceUrl
          ? [{ url: post.featuredImage.node.sourceUrl }]
          : undefined,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { category: categorySlug, slug } = await params
  const data = await fetchQuery<ArticleData>(GET_ARTICLE, { slug })

  const post = data?.post
  if (!post) notFound()

  const category = post.categories.nodes[0]
  const breadcrumbs = [
    { label: '首頁', href: '/' },
    ...(category ? [{ label: category.name, href: `/${categorySlug}` }] : []),
    { label: post.title, href: `/${categorySlug}/${slug}` },
  ]

  return (
    <>
      <ArticleJsonLd post={post} />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 space-y-4">
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="text-3xl font-bold text-gray-900 leading-tight text-balance">
            {post.title}
          </h1>
          <ArticleMeta post={post} />
        </div>

        {post.featuredImage?.node?.sourceUrl && (
          <div className="mb-10 rounded-xl overflow-hidden">
            <Image
              src={post.featuredImage.node.sourceUrl}
              alt={post.featuredImage.node.altText || post.title}
              width={post.featuredImage.node.mediaDetails?.width ?? 1200}
              height={post.featuredImage.node.mediaDetails?.height ?? 630}
              className="w-full"
              priority
            />
          </div>
        )}

        <ArticleBody content={post.content} />
      </div>
    </>
  )
}
