import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GET_ARTICLE, GET_ALL_POST_SLUGS } from '@/lib/graphql/queries/article'
import { GET_CATEGORY } from '@/lib/graphql/queries/category'
import { GET_ALL_CATEGORIES } from '@/lib/graphql/queries/navigation'
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
import {
  SITE_NAME,
  EDITORIAL_EMAIL,
  EXCLUDED_CATEGORY_SLUGS,
  EDITOR_NAME,
  EDITOR_AVATAR_URL,
  EDITOR_ROLE,
  EDITOR_BIO,
} from '@/lib/constants'
import { resolveArticleType } from '@/lib/article-type'
import { decodeRouteParam } from '@/lib/route-params'
import {
  parseArticleContent,
  deriveMetaDescription,
  HOWTO_SECTION_ID,
  FAQ_SECTION_ID,
} from '@/lib/content-parsers'
import { formatDate, resolveSummary, isAutoExcerpt, stripWpSiteSuffix } from '@/lib/format'

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

function readingMinutes(html: string) {
  const textLength = html.replace(/<[^>]*>/g, '').length
  return Math.max(1, Math.round(textLength / 400))
}

// 文章頁少了這行，部署完內容就凍在 build 當下：WordPress 改了字要等下次部署才會更新。
// 首頁、分類頁、sitemap 都是 3600，這裡跟著一致（之後接上 on-demand webhook 可以再縮短）
export const revalidate = 3600

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
  // Yoast 沒填描述時退回 excerpt（自動截斷的目錄殘骸會被 resolveSummary 判掉），
  // 兩者都空就從內文第一段生一句 — StackTool 生成的推薦文兩個欄位都是空的，
  // 不補這一層的話整頁連 <meta name="description"> 都不會輸出
  const description =
    resolveSummary(post.excerpt, post.seo?.metaDesc) || deriveMetaDescription(post.content)
  // Yoast 的 og 描述也可能直接吃 WordPress 自動摘要（＝目錄殘骸），一樣要判掉
  const ogDescription =
    post.seo?.opengraphDescription && !isAutoExcerpt(post.seo.opengraphDescription)
      ? post.seo.opengraphDescription
      : description
  return {
    title: stripWpSiteSuffix(post.seo?.title) || post.title,
    description,
    alternates: { canonical: `/${categorySlug}/${post.slug}` },
    openGraph: {
      // 子頁的 openGraph 會整組蓋掉 layout 的，siteName/locale/url 要自己帶
      siteName: SITE_NAME,
      locale: 'zh_TW',
      url: `/${categorySlug}/${post.slug}`,
      title: stripWpSiteSuffix(post.seo?.opengraphTitle) || post.title,
      description: ogDescription,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
      images: post.seo?.opengraphImage?.sourceUrl
        ? [{ url: post.seo.opengraphImage.sourceUrl }]
        : post.featuredImage?.node?.sourceUrl
          ? [{ url: post.featuredImage.node.sourceUrl }]
          : [{ url: '/og-default.jpg', width: 1024, height: 318 }],
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
    { label: post.title, href: `/${categorySlug}/${slug}` },
  ]

  const relatedData = category
    ? await fetchQuery<CategoryPostsData>(GET_CATEGORY, { slug: category.slug, first: 4 })
    : null
  const related = (relatedData?.category?.posts?.nodes ?? []).filter((p) => p.slug !== slug).slice(0, 3)

  const navData = await fetchQuery<{ categories: { nodes: Array<{ name: string; slug: string }> } }>(
    GET_ALL_CATEGORIES
  )
  const otherCategories = (navData?.categories?.nodes ?? []).filter(
    (c) => !EXCLUDED_CATEGORY_SLUGS.includes(c.slug) && c.slug !== categorySlug
  )

  // WordPress 自動截的 excerpt 會把開頭的目錄區塊當摘要，改優先吃 Yoast 描述（見 resolveSummary）
  const summary = resolveSummary(post.excerpt, post.seo?.metaDesc)

  const updated = post.modified && post.modified !== post.date
  // 結論/常見問題/TOC 兩種類型都套用；HowTo 判斷標準跟「這篇怎麼寫出來的」只給知識分享——
  // 推薦文的 <ol> 通常是排名清單不是操作步驟，硬套 HowTo 會誤用結構化資料
  const parsed = parseArticleContent(post.content, {
    extractHowTo: isKnowledge,
    extractProvenance: isKnowledge,
    // 推薦文沒有「先看結論」框，抽走總結就等於整段消失
    extractConclusion: isKnowledge,
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

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-3">
                {post.title}
              </h1>

              {summary && (
                <p className="text-[17px] leading-loose text-paper-secondary mt-5">
                  {summary}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-[13px] text-paper-secondary mt-5">
                <span className="flex items-center gap-2">
                  <span className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 bg-paper-surface">
                    <Image src={EDITOR_AVATAR_URL} alt={EDITOR_NAME} fill sizes="28px" className="object-cover" />
                  </span>
                  <b className="font-bold text-paper-ink">{EDITOR_NAME}</b>
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
                <p className="text-xs leading-loose text-paper-muted mt-4 px-4 py-3 bg-paper-card border border-paper-border rounded-lg">
                  本文彙整網路公開討論、電商與訂房平台評論及品牌官方資訊，並由編輯部核對後撰寫。文中不含業配，部分連結為聯盟連結，不影響推薦內容。價格與供貨請以通路頁面為準。
                </p>
              )}

              {/* 白底細框卡＋騎在上緣的「先看結論」掛耳標籤。
                  圓角刻意收到 4px（不用其他卡片的 rounded-2xl），跟內文 h2 橫幅同一個直角家族；
                  重點條列前綴用 ✓，呼應 globals.css 給內文 h2 的 ✓。
                  標籤是絕對定位、往上位移一半，所以卡片上緣要留 pt-8 才不會壓到內文。
                  只給知識分享／選購指南：推薦文的結論叫「總結」且放在文末，抽到前面會跟前言講一樣的話，
                  推薦文改由前言本身承擔前置重點（GEO 用） */}
              {isKnowledge && parsed.conclusion && (
                <div className="relative mt-10 bg-paper-card border border-paper-border rounded px-7 pt-8 pb-2 sm:px-8 shadow-[0_1px_2px_rgba(29,28,26,0.05),0_14px_30px_-18px_rgba(29,28,26,0.28)]">
                  <h2 className="absolute top-0 left-6 -translate-y-1/2 bg-brand-600 text-white text-xs font-bold tracking-[0.14em] rounded-[3px] px-3.5 py-1">
                    先看結論
                  </h2>
                  <p className="text-[15.5px] leading-loose text-paper-body text-balance">
                    {parsed.conclusion.body}
                  </p>
                  {parsed.conclusion.takeaways.length > 0 && (
                    <ul className="grid mt-4">
                      {parsed.conclusion.takeaways.map((t, i) => (
                        <li
                          key={i}
                          className="grid grid-cols-[18px_1fr] gap-3 py-3.5 border-t border-paper-border text-sm leading-relaxed text-paper-body"
                        >
                          <span className="text-brand-600 font-bold">✓</span>
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

              {/* 編者介紹：資料來源是站上的 EDITOR_* 常數，不吃 WordPress 內文——
                  StackTool 生成的文章自帶一塊編者介紹，人設常跟文章主題無關，
                  已在 content-parsers 的 stripUpstreamAuthorBlock 挑掉 */}
              <section className="relative overflow-hidden mt-7 bg-paper-card border border-paper-border rounded-2xl px-6 py-5 bg-gradient-to-bl from-brand-100 via-paper-card via-40% to-paper-card">
                <h2 className="flex items-center gap-2 text-xs tracking-wider text-paper-muted font-bold">
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0" />
                  編者介紹
                </h2>
                {/* 頭像 88px，右邊第一行是姓名＋職稱膠囊，第二行才是自介 */}
                <div className="flex gap-5 items-center mt-3.5">
                  <span className="relative w-[88px] h-[88px] rounded-full overflow-hidden shrink-0 bg-paper-surface">
                    <Image src={EDITOR_AVATAR_URL} alt={EDITOR_NAME} fill sizes="88px" className="object-cover" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <b className="text-[17px] font-bold text-paper-ink">{EDITOR_NAME}</b>
                      <span className="rounded-full bg-brand-50 text-brand-700 text-xs px-2.5 py-1">
                        {EDITOR_ROLE}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-paper-secondary mt-2">{EDITOR_BIO}</p>
                  </div>
                </div>
              </section>

              {parsed.toc.length > 0 && (
                <nav
                  aria-label="本篇目錄"
                  className="mt-7 bg-paper-card border border-paper-border border-l-4 border-l-brand-600 rounded-lg px-6 py-5"
                >
                  <p className="font-bold text-brand-600 mb-3">本篇目錄</p>
                  <ol className="list-decimal pl-5 grid gap-2 marker:text-brand-600 marker:font-bold">
                    {parsed.toc.map((item) => (
                      <li key={item.id} className="text-[15px] leading-relaxed">
                        <a href={`#${item.id}`} className="text-paper-ink no-underline hover:text-brand-600 transition-colors">
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
                  {/* 手風琴用原生 <details>／<summary>，不用 client component 也能收合。
                      第一題預設展開，讓讀者一眼看得出這區是可以點開的。
                      收合狀態下答案不在畫面上，但仍在 DOM 裡，FaqJsonLd 也另外輸出結構化資料，
                      所以不影響 SEO 與 AI 抓取。 */}
                  <div className="grid mt-5 border-t border-paper-border">
                    {parsed.faq.map((f, i) => (
                      <details
                        key={i}
                        open={i === 0}
                        className="group border-b border-paper-border [&_summary::-webkit-details-marker]:hidden"
                      >
                        <summary className="flex cursor-pointer list-none items-start gap-3 py-5 text-[17px] font-bold leading-relaxed text-paper-ink transition-colors hover:text-brand-600">
                          <span
                            aria-hidden
                            className="mt-1 shrink-0 text-brand-600 transition-transform duration-200 group-open:rotate-90"
                          >
                            ▶
                          </span>
                          <span className="flex-1">{f.question}</span>
                        </summary>
                        <p className="pb-6 pl-7 text-[15px] leading-loose text-paper-secondary">{f.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* 總結與參考資料排在常見問題之後（見 parseArticleContent 的 bodyTailHtml） */}
              {parsed.bodyTailHtml && (
                <div className="mt-11">
                  <ArticleBody content={parsed.bodyTailHtml} />
                </div>
              )}

              {isKnowledge && (
                <section className="mt-11 bg-paper-card border border-paper-border rounded-2xl px-7 py-6">
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
                          className="block bg-paper-card border border-paper-border rounded-2xl overflow-hidden hover:border-brand-600 transition-colors"
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
                <span className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-paper-surface">
                  <Image src={EDITOR_AVATAR_URL} alt={EDITOR_NAME} fill sizes="44px" className="object-cover" />
                </span>
                <div>
                  <b className="text-[17px] font-bold text-paper-ink">{EDITOR_NAME}</b>
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
                  <div className="bg-paper-card border border-paper-border rounded-2xl p-6">
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
                <div className="bg-paper-card border border-paper-border rounded-2xl p-6">
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
              (related.length > 0 || otherCategories.length > 0) &&
              category && (
                <aside className="lg:sticky lg:top-24 grid gap-5">
                  {related.length > 0 && (
                    <div className="bg-paper-card border border-paper-border rounded-2xl p-6">
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
                    </div>
                  )}
                  {otherCategories.length > 0 && (
                    <div className="bg-paper-card border border-paper-border rounded-2xl p-6">
                      <div className="text-xs tracking-wider text-paper-muted font-bold">換個主題看</div>
                      <ul className="grid gap-3 mt-4 text-sm">
                        {otherCategories.map((c) => (
                          <li key={c.slug}>
                            <Link href={`/${c.slug}`} className="text-paper-body hover:text-brand-600 transition-colors">
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </aside>
              )
            )}
          </div>
        </div>
      </div>
    </>
  )
}
