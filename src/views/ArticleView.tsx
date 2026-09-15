import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GET_ARTICLE, GET_ALL_POST_SLUGS, GET_POST_TRANSLATIONS } from '@/lib/graphql/queries/article'
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
import { SITE_NAME, EDITORIAL_EMAIL, EXCLUDED_CATEGORY_SLUGS, EDITOR_AVATAR_URL } from '@/lib/constants'
import { resolveArticleType } from '@/lib/article-type'
import { decodeRouteParam } from '@/lib/route-params'
import {
  LANGS,
  LANG_TAG,
  OG_LOCALE,
  articleHref,
  articleTypeLabel,
  categoryHref,
  homeHref,
  langOfCategorySlug,
  toRouteSlug,
  toWpSlug,
  ui,
  type Lang,
} from '@/lib/i18n'
import {
  parseArticleContent,
  deriveMetaDescription,
  HOWTO_SECTION_ID,
  FAQ_SECTION_ID,
} from '@/lib/content-parsers'
import { countWords, formatDate, isSpaceSeparated, resolveSummary, isAutoExcerpt, stripWpSiteSuffix } from '@/lib/format'

export interface ArticleRouteProps {
  params: Promise<{ category: string; slug: string }>
}

interface ArticleData {
  post: WPPost | null
}

interface PostTranslationsData {
  en: { slug: string } | null
  ja: { slug: string } | null
  ko: { slug: string } | null
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

// 中日照字元數估、英韓照單字數估（見 format.ts 的 countWords）
function readingMinutes(html: string, lang: Lang) {
  const n = countWords(html, lang)
  return Math.max(1, Math.round(n / (isSpaceSeparated(lang) ? 200 : 400)))
}

/**
 * 文章頁的 generateStaticParams／generateMetadata／頁面本體，中英文各自的 page.tsx 只是薄殼。
 * 網址上的 slug 是「路由 slug」（不帶 -en），查 WordPress 前先用 toWpSlug 換成該語言的 slug。
 */
export async function articleStaticParams(lang: Lang) {
  const data = await fetchQuery<AllSlugsData>(GET_ALL_POST_SLUGS)
  return (data?.posts?.nodes ?? []).flatMap((post) =>
    post.categories.nodes
      .filter((cat) => !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug) && langOfCategorySlug(cat.slug) === lang)
      .map((cat) => ({
        category: toRouteSlug(cat.slug),
        slug: toRouteSlug(post.slug),
      }))
  )
}

/**
 * 這篇文章有哪些語言版本。中文是來源一定有，其餘三個語言查 WordPress 有沒有對應 slug。
 * 有對照才輸出 hreflang，沒翻的語言不能指向一個 404。
 */
async function availableLangs(routeSlug: string): Promise<Lang[]> {
  const data = await fetchQuery<PostTranslationsData>(GET_POST_TRANSLATIONS, {
    en: toWpSlug('en', routeSlug),
    ja: toWpSlug('ja', routeSlug),
    ko: toWpSlug('ko', routeSlug),
  })
  return LANGS.filter((l) => l === 'zh' || Boolean(data?.[l as 'en' | 'ja' | 'ko']))
}

export async function generateArticleMetadata(lang: Lang, { params }: ArticleRouteProps): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeRouteParam(rawSlug)
  const data = await fetchQuery<ArticleData>(GET_ARTICLE, { slug: toWpSlug(lang, slug) })
  const post = data?.post
  if (!post) return {}

  const categorySlug = post.categories.nodes[0]?.slug ?? ''
  const path = articleHref(lang, categorySlug, post.slug)
  const langs = await availableLangs(slug)
  const zhPath = articleHref('zh', categorySlug, post.slug)
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
    alternates: {
      canonical: path,
      // 只列出真的翻好的語言；x-default 給中文（主站）
      ...(langs.length > 1 && {
        languages: {
          ...Object.fromEntries(langs.map((l) => [LANG_TAG[l], articleHref(l, categorySlug, post.slug)])),
          'x-default': zhPath,
        },
      }),
    },
    openGraph: {
      // 子頁的 openGraph 會整組蓋掉 layout 的，siteName/locale/url 要自己帶
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang],
      url: path,
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

export default async function ArticleView({ lang, params }: ArticleRouteProps & { lang: Lang }) {
  const { category: rawCategorySlug, slug: rawSlug } = await params
  const categorySlug = decodeRouteParam(rawCategorySlug)
  const slug = decodeRouteParam(rawSlug)
  if (EXCLUDED_CATEGORY_SLUGS.includes(categorySlug)) notFound()

  const t = ui(lang)
  const wpSlug = toWpSlug(lang, slug)
  const data = await fetchQuery<ArticleData>(GET_ARTICLE, { slug: wpSlug })

  const post = data?.post
  if (!post) notFound()

  const category = post.categories.nodes[0]
  // 網址的分類跟文章實際分類對不上（例如用中文分類網址看英文文章）一律 404，避免同一篇有兩個網址
  if (!category || category.slug !== toWpSlug(lang, categorySlug)) notFound()
  const articleType = resolveArticleType(post.articleTypes)
  const typeForBadge = { ...articleType, name: articleTypeLabel(lang, articleType) }
  const isKnowledge = articleType.slug === 'knowledge'
  const catHref = categoryHref(lang, category.slug)
  const selfHref = articleHref(lang, category.slug, post.slug)

  const breadcrumbs = [
    { label: t.home, href: homeHref(lang) },
    { label: category.name, href: catHref },
    { label: post.title, href: selfHref },
  ]

  const relatedData = await fetchQuery<CategoryPostsData>(GET_CATEGORY, { slug: category.slug, first: 4 })
  const related = (relatedData?.category?.posts?.nodes ?? []).filter((p) => p.slug !== wpSlug).slice(0, 3)

  const navData = await fetchQuery<{ categories: { nodes: Array<{ name: string; slug: string }> } }>(
    GET_ALL_CATEGORIES
  )
  const otherCategories = (navData?.categories?.nodes ?? []).filter(
    (c) => !EXCLUDED_CATEGORY_SLUGS.includes(c.slug) && langOfCategorySlug(c.slug) === lang && c.slug !== category.slug
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
    faqLabel: t.faq,
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
            <Breadcrumbs items={breadcrumbs} label={t.breadcrumbs} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-14 pt-6 pb-20 items-start">
            <article>
              <ArticleTypeBadge category={category} categoryHref={catHref} type={typeForBadge} />
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
                    <Image src={EDITOR_AVATAR_URL} alt={t.editorName} fill sizes="28px" className="object-cover" />
                  </span>
                  <b className="font-bold text-paper-ink">{t.editorName}</b>
                </span>
                <span className="text-paper-border">·</span>
                <span>
                  {t.published} <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
                </span>
                {updated && (
                  <>
                    <span className="text-paper-border">·</span>
                    <span>
                      {t.updated} <time dateTime={post.modified}>{formatDate(post.modified, lang)}</time>
                    </span>
                  </>
                )}
                <span className="text-paper-border">·</span>
                <span className="text-paper-muted">{t.readingTime(readingMinutes(post.content, lang))}</span>
              </div>

              {!isKnowledge && (
                <p className="text-xs leading-loose text-paper-muted mt-4 px-4 py-3 bg-paper-card border border-paper-border rounded-lg">
                  {t.disclosure}
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
                    {t.conclusionFirst}
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
                  {t.editorIntro}
                </h2>
                {/* 頭像 88px，右邊第一行是姓名＋職稱膠囊，第二行才是自介 */}
                <div className="flex gap-5 items-center mt-3.5">
                  <span className="relative w-[88px] h-[88px] rounded-full overflow-hidden shrink-0 bg-paper-surface">
                    <Image src={EDITOR_AVATAR_URL} alt={t.editorName} fill sizes="88px" className="object-cover" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <b className="text-[17px] font-bold text-paper-ink">{t.editorName}</b>
                      <span className="rounded-full bg-brand-50 text-brand-700 text-xs px-2.5 py-1">
                        {t.editorRole}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-paper-secondary mt-2">{t.editorBio}</p>
                  </div>
                </div>
              </section>

              {parsed.toc.length > 0 && (
                <nav
                  aria-label={t.toc}
                  className="mt-7 bg-paper-card border border-paper-border border-l-4 border-l-brand-600 rounded-lg px-6 py-5"
                >
                  <p className="font-bold text-brand-600 mb-3">{t.toc}</p>
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
                    {t.faq}
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
                        <p className="pb-6 pl-7 text-base leading-loose text-paper-ink/85">{f.answer}</p>
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
                  <h2 className="text-xs tracking-wider text-paper-muted font-bold">{t.provenance}</h2>
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
                    {t.knowledgeDisclosure}
                    <Link href="/about" className="text-brand-600 font-bold ml-1.5">
                      {t.editorialPolicy}
                    </Link>
                  </p>
                </section>
              )}

              {isKnowledge && related.length > 0 && category && (
                <section className="mt-11">
                  <h2 className="text-xs tracking-wider text-paper-muted font-bold">{t.readMore}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {related.map((p) => {
                      const cat = p.categories.nodes[0]
                      const pType = resolveArticleType(p.articleTypes)
                      return (
                        <Link
                          key={p.slug}
                          href={articleHref(lang, cat?.slug ?? category.slug, p.slug)}
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
                            <ArticleTypeBadge category={cat} type={{ ...pType, name: articleTypeLabel(lang, pType) }} size="sm" />
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
                  <Image src={EDITOR_AVATAR_URL} alt={t.editorName} fill sizes="44px" className="object-cover" />
                </span>
                <div>
                  <b className="text-[17px] font-bold text-paper-ink">{t.editorName}</b>
                  <p className="text-sm leading-loose text-paper-secondary mt-2">
                    {t.editorFooter}{lang === 'en' ? ' ' : ''}
                    <a href={`mailto:${EDITORIAL_EMAIL}`} className="text-brand-600 font-bold">
                      {t.contactUs}
                    </a>
                    {lang === 'en' ? '.' : '。'}
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
                  <div className="text-xs tracking-wider text-paper-secondary font-bold">{t.aboutKnowledge}</div>
                  <p className="text-[13px] leading-loose text-paper-secondary mt-3">{t.aboutKnowledgeBody}</p>
                  <Link
                    href={`${catHref}?type=recommendation`}
                    className="inline-block text-[13px] font-bold text-brand-600 mt-3.5"
                  >
                    {t.seeRecommendations}
                  </Link>
                </div>
              </aside>
            ) : (
              (related.length > 0 || otherCategories.length > 0) && (
                <aside className="lg:sticky lg:top-24 grid gap-5">
                  {related.length > 0 && (
                    <div className="bg-paper-card border border-paper-border rounded-2xl p-6">
                      <div className="text-xs tracking-wider text-paper-muted font-bold">{t.sameCategory}</div>
                      <ul className="grid gap-4 mt-4">
                        {related.map((p) => {
                          const cat = p.categories.nodes[0]
                          const tagName = p.tags.nodes[0]?.name
                          return (
                            <li key={p.slug}>
                              <Link href={articleHref(lang, cat?.slug ?? category.slug, p.slug)} className="grid gap-1.5">
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
                        href={catHref}
                        className="block text-center mt-5 bg-brand-50 text-brand-600 font-bold text-[13px] py-2.5 rounded-lg hover:bg-brand-100 transition-colors"
                      >
                        {t.seeMoreOf(category.name)}
                      </Link>
                    </div>
                  )}
                  {otherCategories.length > 0 && (
                    <div className="bg-paper-card border border-paper-border rounded-2xl p-6">
                      <div className="text-xs tracking-wider text-paper-muted font-bold">{t.otherTopics}</div>
                      <ul className="grid gap-3 mt-4 text-sm">
                        {otherCategories.map((c) => (
                          <li key={c.slug}>
                            <Link href={categoryHref(lang, c.slug)} className="text-paper-body hover:text-brand-600 transition-colors">
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
