import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { GET_HOMEPAGE_BLOCKS } from '@/lib/graphql/queries/homepage'
import { fetchQuery } from '@/lib/graphql/client'
import { SITE_NAME, SITE_URL, EXCLUDED_CATEGORY_SLUGS, EDITOR_NAME, EDITOR_AVATAR_URL } from '@/lib/constants'
import Hero from '@/components/layout/Hero'
import ArticleImageFallback from '@/components/article/ArticleImageFallback'
import HomeClient, { type HomeCategoryBlock } from './HomeClient'
import { GET_LATEST_POSTS } from '@/lib/graphql/queries/popular'
import { formatDate } from '@/lib/format'
import { WPPostCard } from '@/types/wordpress'
import {
  LANG_TAG,
  OG_LOCALE,
  articleHref,
  categoryHref,
  homeHref,
  langOfCategorySlug,
  langPrefix,
  ui,
  staticAlternates,
  type Lang,
} from '@/lib/i18n'

/** 首頁的 metadata／頁面本體，中英文各自的 page.tsx 只是薄殼 */
export function homeMetadata(lang: Lang): Metadata {
  const t = ui(lang)
  const sep = lang === 'en' ? ' | ' : '｜'
  return {
    // 首頁不套 layout 的 `%s | spaceA` 樣板，直接給一個吃得到關鍵字的完整標題
    // （原本只有「spaceA」六個字，搜尋結果看不出這站在做什麼）
    title: {
      absolute: `${SITE_NAME}${sep}${t.siteTagline}`,
    },
    description: t.siteDescription,
    alternates: staticAlternates(lang, '/'),
    // openGraph 在子頁面是整組覆蓋掉 layout 的，所以 image/type/siteName 要一起帶
    openGraph: {
      type: 'website',
      locale: OG_LOCALE[lang],
      siteName: SITE_NAME,
      url: homeHref(lang),
      title: `${SITE_NAME}${sep}${t.siteTagline}`,
      description: t.siteDescription,
      images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
    },
  }
}

interface HomepageBlocksData {
  categories: {
    nodes: Array<{
      name: string
      slug: string
      count: number | null
      posts: { nodes: HomeCategoryBlock['posts'] }
    }>
  }
}

interface LatestPostsData {
  posts: { nodes: WPPostCard[] }
}

export default async function HomeView({ lang }: { lang: Lang }) {
  const t = ui(lang)
  const isLang = (slug: string) => !EXCLUDED_CATEGORY_SLUGS.includes(slug) && langOfCategorySlug(slug) === lang
  // 抓比較大的上限（涵蓋所有分類，中英文分類都在同一個 WP），避免 Uncategorized 佔掉名額後，排在後面的真實分類被截斷抓不到
  const [data, latestData] = await Promise.all([
    fetchQuery<HomepageBlocksData>(GET_HOMEPAGE_BLOCKS, {
      first: 40,
      postsPerCategory: 5,
    }),
    // 最新文章四種語言混在一起回來（翻譯批次發布後其他語言會擠掉中文），多抓一點再依語言過濾
    fetchQuery<LatestPostsData>(GET_LATEST_POSTS, { first: 60 }),
  ])

  const categories = data?.categories?.nodes ?? []
  const blocks: HomeCategoryBlock[] = categories
    .filter((c) => isLang(c.slug) && c.posts.nodes.length > 0)
    .map((c) => ({ slug: c.slug, name: c.name, count: c.count, posts: c.posts.nodes }))

  // 選主題 chip 只列有文章的分類（0 篇的不顯示），直接用 blocks 那次查詢的結果
  const topics = categories
    .filter((c) => isLang(c.slug) && (c.count ?? 0) > 0)
    .map((c) => ({ slug: c.slug, name: c.name, count: c.count ?? 0 }))
    .sort((a, b) => b.count - a.count)

  // 「熱門排行」目前還沒有真實閱讀數據，先用最新發布的文章頂替（見 src/app/popular）
  const latestPosts = (latestData?.posts?.nodes ?? [])
    .filter((post) => {
      const categorySlug = post.categories.nodes[0]?.slug
      return categorySlug && isLang(categorySlug)
    })
    .slice(0, 10)

  const categoryListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.categoryListName,
    itemListElement: blocks.map((b, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: b.name,
      url: `${SITE_URL}${categoryHref(lang, b.slug)}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryListSchema) }}
      />

      <div className="bg-paper">
        <Hero lang={lang} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <HomeClient lang={lang} blocks={blocks} topics={topics} />

          <section className="mt-16 bg-paper-card border border-paper-border rounded-[20px] px-9 sm:px-11 pt-10 pb-9">
            <div className="flex items-end justify-between gap-8 flex-wrap pb-7 border-b border-paper-border">
              <div className="max-w-xl">
                <div className="text-xs tracking-wider text-brand-600 font-bold">{t.howWePick}</div>
                <h2 className="font-serif text-[26px] font-bold leading-snug mt-3 text-paper-ink">
                  {t.howWePickTitle}
                </h2>
                <p className="text-[15px] leading-loose text-paper-secondary mt-3.5 text-balance">{t.howWePickBody}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 mt-7">
              {t.steps.map((step, i) => (
                <div key={step.n} className={`sm:px-8 ${i > 0 ? 'sm:border-l sm:border-paper-border' : 'sm:pr-8'}`}>
                  <div className="flex items-baseline gap-2.5">
                    <b className="font-serif text-sm font-bold text-brand-600 tracking-wider">{step.n}</b>
                    <b className="text-base font-bold text-paper-ink">{step.title}</b>
                  </div>
                  <p className="text-sm leading-loose text-paper-secondary mt-2.5">{step.body}</p>
                </div>
              ))}
            </div>
          </section>

          {latestPosts.length > 0 && (
            <section>
              <div className="flex items-center gap-3.5 pt-10 pb-5">
                <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                <h2 className="font-serif text-[22px] font-bold whitespace-nowrap">{t.popular}</h2>
                <span className="flex-1 h-px bg-paper-border" />
                {/* 熱門排行頁只有中文 */}
                {lang === 'zh' && (
                  <Link
                    href="/popular"
                    className="bg-brand-50 text-brand-600 text-[13px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap hover:bg-brand-100 transition-colors"
                  >
                    {t.fullRanking}
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                {latestPosts.map((post, i) => {
                  const cat = post.categories.nodes[0]
                  const href = articleHref(lang, cat?.slug ?? '', post.slug)
                  return (
                    <Link
                      key={post.slug}
                      href={href}
                      className="grid grid-cols-[34px_1fr] gap-3.5 items-baseline py-3.5 border-b border-paper-border"
                    >
                      <b
                        className={`font-serif text-lg font-bold ${i < 3 ? 'text-brand-600' : 'text-paper-muted'}`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </b>
                      <div>
                        <h3 className="text-[15px] font-medium leading-relaxed hover:text-brand-600 transition-colors">
                          {post.title}
                        </h3>
                        <span className="block text-xs text-paper-muted mt-1.5">
                          {cat?.name} · {formatDate(post.date, lang)}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* 專家・達人區（版型參考 mybest）：封面＋標題＋作者頭像／職稱／名字，下方一條加入團隊。
              目前站上只有阿康一位署名編輯，卡片先拿最新文章、作者寫死；等有外部寫手再改吃 WP author 欄位 */}
          {latestPosts.length > 0 && (
            <section className="mt-16">
              <div className="text-xs tracking-wider text-brand-600 font-bold">{t.join.kicker}</div>
              <h2 className="font-serif text-[26px] font-bold leading-snug mt-2 text-paper-ink">{t.join.title}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 mt-7">
                {latestPosts.slice(0, 4).map((post) => {
                  const cat = post.categories.nodes[0]
                  const href = articleHref(lang, cat?.slug ?? '', post.slug)
                  return (
                    <Link key={post.slug} href={href} className="group block">
                      <div className="relative aspect-[2/1] rounded-lg overflow-hidden bg-gray-100">
                        {post.featuredImage?.node ? (
                          <Image
                            src={post.featuredImage.node.sourceUrl}
                            alt={post.featuredImage.node.altText || post.title}
                            fill
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <ArticleImageFallback size={32} />
                        )}
                      </div>
                      <h3 className="text-[15px] font-bold leading-snug text-paper-ink line-clamp-2 mt-3 group-hover:text-brand-600 transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2.5 mt-3">
                        <Image
                          src={EDITOR_AVATAR_URL}
                          alt={EDITOR_NAME}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 leading-tight">
                          <div className="text-[11px] text-paper-muted">{t.editorRole}</div>
                          <div className="text-[13px] font-bold text-paper-ink truncate">{EDITOR_NAME}</div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
              <div className="mt-10 rounded-[20px] bg-brand-50 border border-brand-100 px-8 sm:px-11 py-9 grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-8 md:gap-12 items-center">
                <div>
                  <div className="text-xs tracking-wider text-brand-600 font-bold">{t.join.kicker}</div>
                  <h3 className="font-serif text-2xl font-bold leading-snug mt-2 text-paper-ink">{t.join.joinTitle}</h3>
                  <p className="text-[15px] leading-loose text-paper-secondary mt-3 text-balance">{t.join.body}</p>
                  <Link
                    href={lang === 'zh' ? '/join' : `${langPrefix(lang)}/contact?topic=join#form`}
                    className="inline-block w-fit mt-6 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors"
                  >
                    {t.join.cta}
                  </Link>
                </div>
                <ul className="grid gap-3 list-none">
                  {t.join.perks.map((perk, i) => (
                    <li key={perk.title} className="flex gap-4 items-start bg-white/80 rounded-xl px-5 py-4 border border-brand-100">
                      <b className="font-serif text-sm font-bold text-brand-600 tracking-wider mt-0.5">0{i + 1}</b>
                      <div>
                        <b className="block text-[15px] font-bold text-paper-ink">{perk.title}</b>
                        <p className="text-sm leading-relaxed text-paper-secondary mt-1">{perk.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {blocks[0] && (
            <section className="mt-16 mb-16 rounded-[20px] overflow-hidden grid grid-cols-1 sm:grid-cols-2 bg-brand-600 text-white">
              <div className="p-9 sm:p-12 flex flex-col justify-center">
                <div className="text-xs tracking-wider opacity-70">{t.featuredTopic}</div>
                <h3 className="font-serif text-[26px] sm:text-3xl font-bold leading-snug mt-3.5">
                  {t.moreOf(blocks[0].name)}
                </h3>
                <p className="text-[15px] leading-loose opacity-85 mt-4 text-balance">{t.featuredBody(blocks[0].name)}</p>
                <Link
                  href={categoryHref(lang, blocks[0].slug)}
                  className="inline-block w-fit mt-6 bg-white text-brand-600 font-bold text-sm px-6 py-3 rounded-full hover:bg-brand-50 transition-colors"
                >
                  {t.readTopic}
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
