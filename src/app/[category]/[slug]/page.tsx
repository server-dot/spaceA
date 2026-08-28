import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GET_ARTICLE, GET_ALL_POST_SLUGS } from '@/lib/graphql/queries/article'
import { GET_CATEGORY } from '@/lib/graphql/queries/category'
import { fetchQuery } from '@/lib/graphql/client'
import { WPPost, WPPostCard } from '@/types/wordpress'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ArticleBody from '@/components/article/ArticleBody'
import ArticleJsonLd from '@/components/seo/ArticleJsonLd'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import { EDITORIAL_EMAIL } from '@/lib/constants'

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

interface CategoryPostsData {
  category: {
    posts: { nodes: WPPostCard[] }
  } | null
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function readingMinutes(html: string) {
  const textLength = html.replace(/<[^>]*>/g, '').length
  return Math.max(1, Math.round(textLength / 400))
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
  const tag = post.tags?.nodes?.[0]
  const breadcrumbs = [
    { label: '首頁', href: '/' },
    ...(category ? [{ label: category.name, href: `/${categorySlug}` }] : []),
    { label: post.title, href: `/${categorySlug}/${slug}` },
  ]

  const relatedData = category
    ? await fetchQuery<CategoryPostsData>(GET_CATEGORY, { slug: category.slug, first: 4 })
    : null
  const related = (relatedData?.category?.posts?.nodes ?? []).filter((p) => p.slug !== slug).slice(0, 3)

  const updated = post.modified && post.modified !== post.date

  return (
    <>
      <ArticleJsonLd post={post} />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pt-7">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-14 pt-6 pb-20 items-start">
            <article>
              {(category || tag) && (
                <div className="text-xs tracking-wider text-brand-600 font-bold">
                  {category?.name}
                  {category && tag && ' · '}
                  {tag?.name}
                </div>
              )}
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-3 text-balance">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-[13px] text-paper-secondary mt-5">
                <span className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-paper-surface grid place-items-center text-[11px] text-paper-secondary">
                    編
                  </span>
                  <b className="font-bold text-paper-ink">{post.author?.node?.name ?? 'spaceA 編輯部'}</b>
                </span>
                <span className="text-paper-border">·</span>
                <span>
                  發布 <time dateTime={post.date}>{formatDate(post.date)}</time>
                </span>
                {updated && (
                  <>
                    <span className="text-paper-border">·</span>
                    <span>
                      更新 <time dateTime={post.modified}>{formatDate(post.modified)}</time>
                    </span>
                  </>
                )}
                <span className="text-paper-border">·</span>
                <span className="text-paper-muted">閱讀約 {readingMinutes(post.content)} 分鐘</span>
              </div>

              <p className="text-xs leading-loose text-paper-muted mt-4 px-4 py-3 bg-paper-surface rounded-lg">
                本文彙整飼主社群、電商評論與公開資訊，並由編輯部核對後撰寫。文中不含業配，部分連結為聯盟連結，不影響推薦內容。價格與供貨請以通路頁面為準。
              </p>

              {post.featuredImage?.node?.sourceUrl && (
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mt-7">
                  <Image
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.featuredImage.node.altText || post.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 900px"
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div className="mt-9">
                <ArticleBody content={post.content} />
              </div>

              <section className="mt-12 flex gap-4 items-start border-t border-paper-border pt-7">
                <span className="w-11 h-11 rounded-full bg-paper-surface grid place-items-center text-sm text-paper-secondary shrink-0">
                  編
                </span>
                <div>
                  <b className="text-base font-bold text-paper-ink">
                    {post.author?.node?.name ?? 'spaceA 編輯部'}
                  </b>
                  <p className="text-sm leading-loose text-paper-secondary mt-2">
                    我們彙整網路上公開的討論與評論，交叉核對後撰寫推薦，並標註每則資訊的來源與更新日期。發現內容有誤，歡迎
                    <a href={`mailto:${EDITORIAL_EMAIL}`} className="text-brand-600 font-bold">
                      與我們聯絡
                    </a>
                    。
                  </p>
                </div>
              </section>
            </article>

            {related.length > 0 && category && (
              <aside className="lg:sticky lg:top-24 bg-white border border-paper-border rounded-2xl p-6">
                <div className="text-xs tracking-wider text-paper-muted font-bold">同分類文章</div>
                <ul className="grid gap-4 mt-4">
                  {related.map((p) => {
                    const cat = p.categories.nodes[0]
                    const tagName = p.tags.nodes[0]?.name
                    return (
                      <li key={p.slug}>
                        <Link href={`/${cat?.slug ?? category.slug}/${p.slug}`} className="grid gap-1.5">
                          {tagName && (
                            <span className="text-[11px] font-bold text-brand-600 tracking-wider">{tagName}</span>
                          )}
                          <b className="text-sm font-medium leading-relaxed text-paper-ink hover:text-brand-600 transition-colors">
                            {p.title}
                          </b>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                <Link
                  href={`/${category.slug}`}
                  className="block text-center mt-5 bg-brand-50 text-brand-600 font-bold text-[13px] py-2.5 rounded-lg hover:bg-brand-100 transition-colors"
                >
                  看更多{category.name}
                </Link>
              </aside>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
