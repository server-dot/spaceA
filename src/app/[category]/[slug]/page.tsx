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
import ArticleTypeBadge from '@/components/article/ArticleTypeBadge'
import TagChips from '@/components/article/TagChips'
import ArticleJsonLd from '@/components/seo/ArticleJsonLd'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import HowToJsonLd from '@/components/seo/HowToJsonLd'
import { EDITORIAL_EMAIL, EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import { resolveArticleType } from '@/lib/article-type'
import { decodeRouteParam } from '@/lib/route-params'
import { parseArticleContent, HOWTO_SECTION_ID, FAQ_SECTION_ID } from '@/lib/content-parsers'

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

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
}

function readingMinutes(html: string) {
  const textLength = html.replace(/<[^>]*>/g, '').length
  return Math.max(1, Math.round(textLength / 400))
}

export async function generateStaticParams() {
  const data = await fetchQuery<AllSlugsData>(GET_ALL_POST_SLUGS)
  return (data?.posts?.nodes ?? []).flatMap((post) =>
    post.categories.nodes
      .filter((cat) => !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug))
      .map((cat) => ({
        category: cat.slug,
        slug: post.slug,
      }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeRouteParam(rawSlug)
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
  const { category: rawCategorySlug, slug: rawSlug } = await params
  const categorySlug = decodeRouteParam(rawCategorySlug)
  const slug = decodeRouteParam(rawSlug)
  if (EXCLUDED_CATEGORY_SLUGS.includes(categorySlug)) notFound()

  const data = await fetchQuery<ArticleData>(GET_ARTICLE, { slug })

  const post = data?.post
  if (!post) notFound()

  const category = post.categories.nodes[0]
  const articleType = resolveArticleType(post.articleTypes)
  const isKnowledge = articleType.slug === 'knowledge'

  const breadcrumbs = [
    { label: '首頁', href: '/' },
    ...(category ? [{ label: category.name, href: `/${categorySlug}` }] : []),
    { label: articleType.name, href: `/${categorySlug}?type=${articleType.slug}`, pill: true },
    { label: post.title, href: `/${categorySlug}/${slug}` },
  ]

  const relatedData = category
    ? await fetchQuery<CategoryPostsData>(GET_CATEGORY, { slug: category.slug, first: 4 })
    : null
  const related = (relatedData?.category?.posts?.nodes ?? []).filter((p) => p.slug !== slug).slice(0, 3)

  const updated = post.modified && post.modified !== post.date
  // 結論/常見問題/TOC 兩種類型都套用；HowTo 判斷標準跟「這篇怎麼寫出來的」只給知識分享——
  // 推薦文的 <ol> 通常是排名清單不是操作步驟，硬套 HowTo 會誤用結構化資料
  const parsed = parseArticleContent(post.content, {
    extractHowTo: isKnowledge,
    extractProvenance: isKnowledge,
  })

  return (
    <>
      <ArticleJsonLd post={post} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      {parsed.faq && <FaqJsonLd items={parsed.faq} />}
      {parsed.howTo && <HowToJsonLd name={parsed.howTo.sectionTitle} steps={parsed.howTo.steps} />}

      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pt-7">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-14 pt-6 pb-20 items-start">
            <article>
              <ArticleTypeBadge
                category={category}
                categoryHref={category ? `/${categorySlug}` : undefined}
                type={articleType}
              />
              {post.tags.nodes.length > 0 && (
                <div className="mt-2.5">
                  <TagChips tags={post.tags.nodes} size="sm" />
                </div>
              )}

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-3 text-balance">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-[17px] leading-loose text-paper-secondary mt-5 max-w-[44em] text-balance">
                  {stripHtml(post.excerpt)}
                </p>
              )}

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

              {!isKnowledge && (
                <p className="text-xs leading-loose text-paper-muted mt-4 px-4 py-3 bg-paper-surface rounded-lg">
                  本文彙整飼主社群、電商評論與公開資訊，並由編輯部核對後撰寫。文中不含業配，部分連結為聯盟連結，不影響推薦內容。價格與供貨請以通路頁面為準。
                </p>
              )}

              {parsed.conclusion && (
                <div className="mt-6 bg-brand-100 rounded-2xl px-7 py-6">
                  <h2 className="text-xs tracking-wider text-brand-600 font-bold">先看結論</h2>
                  <p className="text-[15px] leading-loose mt-3.5 text-balance">{parsed.conclusion.body}</p>
                  {parsed.conclusion.takeaways.length > 0 && (
                    <ul className="grid gap-2.5 mt-4">
                      {parsed.conclusion.takeaways.map((t, i) => (
                        <li key={i} className="grid grid-cols-[18px_1fr] gap-2.5 text-sm leading-relaxed text-paper-ink">
                          <span className="text-brand-600 font-bold">·</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

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

              {parsed.toc.length > 0 && (
                <nav
                  aria-label="本篇目錄"
                  className="mt-7 bg-[#F7F9FC] border-l-4 border-[#2B5CE6] rounded-lg px-6 py-5"
                >
                  <p className="font-bold text-[#2B5CE6] mb-2.5">本篇目錄</p>
                  <ol className="list-decimal pl-5 grid gap-1.5 marker:text-[#2B5CE6] marker:font-bold">
                    {parsed.toc.map((item) => (
                      <li key={item.id} className="text-sm leading-relaxed">
                        <a href={`#${item.id}`} className="text-paper-ink no-underline hover:text-[#2B5CE6] transition-colors">
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              {parsed.howTo && (
                <section id={HOWTO_SECTION_ID} className="mt-11">
                  <h2 className="font-serif text-2xl font-bold leading-snug tracking-tight text-paper-ink">
                    {parsed.howTo.sectionTitle}
                  </h2>
                  <ol className="grid mt-6 border-t border-paper-border">
                    {parsed.howTo.steps.map((step, i) => (
                      <li key={i} className="grid grid-cols-[34px_1fr] gap-5 py-6 border-b border-paper-border">
                        <span className="w-[34px] h-[34px] rounded-full bg-paper-surface grid place-items-center text-sm font-bold text-paper-secondary shrink-0">
                          {i + 1}
                        </span>
                        <div>
                          <h3 className="font-serif text-lg font-bold leading-relaxed text-paper-ink">
                            {step.name}
                          </h3>
                          <p className="text-[15px] leading-loose text-paper-secondary mt-2">{step.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              <div className="mt-9">
                <ArticleBody content={parsed.bodyHtml} />
              </div>

              {parsed.faq && (
                <section id={FAQ_SECTION_ID} className="mt-11">
                  <h2 className="font-serif text-2xl font-bold leading-snug tracking-tight text-paper-ink">
                    常見問題
                  </h2>
                  <div className="grid mt-5 border-t border-paper-border">
                    {parsed.faq.map((f, i) => (
                      <div key={i} className="py-6 border-b border-paper-border">
                        <h3 className="text-[17px] font-bold leading-relaxed text-paper-ink">{f.question}</h3>
                        <p className="text-[15px] leading-loose text-paper-secondary mt-2.5">{f.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {isKnowledge && (
                <section className="mt-11 bg-white border border-paper-border rounded-2xl px-7 py-6">
                  <h2 className="text-xs tracking-wider text-paper-muted font-bold">這篇怎麼寫出來的</h2>
                  {parsed.provenance && (
                    <div className="grid gap-3 mt-4">
                      {parsed.provenance.map((p, i) => (
                        <p key={i} className="text-sm leading-relaxed text-paper-secondary">
                          {p}
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-4 pt-4 border-t border-paper-border">
                    本篇為知識分享，不含合作或聯盟連結。若未來加入，會在文章開頭揭露。
                    <Link href="/about" className="text-brand-600 font-bold ml-1.5">
                      編輯方針
                    </Link>
                  </p>
                </section>
              )}

              {isKnowledge && related.length > 0 && category && (
                <section className="mt-11">
                  <h2 className="text-xs tracking-wider text-paper-muted font-bold">延伸閱讀</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {related.map((p) => {
                      const cat = p.categories.nodes[0]
                      const pType = resolveArticleType(p.articleTypes)
                      return (
                        <Link
                          key={p.slug}
                          href={`/${cat?.slug ?? category.slug}/${p.slug}`}
                          className="block bg-white border border-paper-border rounded-2xl overflow-hidden hover:border-brand-600 transition-colors"
                        >
                          {p.featuredImage?.node?.sourceUrl && (
                            <div className="relative w-full aspect-[16/9]">
                              <Image
                                src={p.featuredImage.node.sourceUrl}
                                alt={p.featuredImage.node.altText || p.title}
                                fill
                                sizes="(max-width: 640px) 100vw, 300px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <ArticleTypeBadge category={cat} type={pType} size="sm" />
                            <b className="block font-serif text-base font-bold leading-relaxed mt-2 text-paper-ink">
                              {p.title}
                            </b>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )}

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

            {isKnowledge ? (
              <aside className="lg:sticky lg:top-24 grid gap-5">
                {parsed.howTo && (
                  <div className="bg-white border border-paper-border rounded-2xl p-6">
                    <div className="text-xs tracking-wider text-paper-muted font-bold">
                      {parsed.howTo.sectionTitle}
                    </div>
                    <ol className="grid gap-2.5 mt-3.5">
                      {parsed.howTo.steps.map((step, i) => (
                        <li key={i} className="grid grid-cols-[20px_1fr] gap-2.5 text-[13px] leading-relaxed text-paper-secondary">
                          <span className="text-paper-muted font-bold">{i + 1}</span>
                          <span>{step.name}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                <div className="bg-paper-surface rounded-2xl p-6">
                  <div className="text-xs tracking-wider text-paper-secondary font-bold">關於知識分享</div>
                  <p className="text-[13px] leading-loose text-paper-secondary mt-3">
                    知識分享提供判斷方法與照護知識，不指定特定商品。想直接看整理好的選擇，請看推薦文。
                  </p>
                  {category && (
                    <Link
                      href={`/${category.slug}?type=recommendation`}
                      className="inline-block text-[13px] font-bold text-brand-600 mt-3.5"
                    >
                      看推薦文列表
                    </Link>
                  )}
                </div>
              </aside>
            ) : (
              related.length > 0 &&
              category && (
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
              )
            )}
          </div>
        </div>
      </div>
    </>
  )
}
