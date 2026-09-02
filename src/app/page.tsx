import type { Metadata } from 'next'
import Link from 'next/link'
import { GET_HOMEPAGE_BLOCKS } from '@/lib/graphql/queries/homepage'
import { fetchQuery } from '@/lib/graphql/client'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import Hero from '@/components/layout/Hero'
import HomeClient, { type HomeCategoryBlock } from './HomeClient'
import { GET_LATEST_POSTS } from '@/lib/graphql/queries/popular'
import { formatDate } from '@/lib/format'
import { WPPostCard } from '@/types/wordpress'

export const revalidate = 3600

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
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

export default async function HomePage() {
  // 抓比較大的上限（涵蓋所有分類），避免 Uncategorized 佔掉名額後，排在後面的真實分類被截斷抓不到
  const [data, latestData] = await Promise.all([
    fetchQuery<HomepageBlocksData>(GET_HOMEPAGE_BLOCKS, {
      first: 20,
      postsPerCategory: 5,
    }),
    fetchQuery<LatestPostsData>(GET_LATEST_POSTS, { first: 10 }),
  ])

  const categories = data?.categories?.nodes ?? []
  const blocks: HomeCategoryBlock[] = categories
    .filter((c) => !EXCLUDED_CATEGORY_SLUGS.includes(c.slug) && c.posts.nodes.length > 0)
    .map((c) => ({ slug: c.slug, name: c.name, count: c.count, posts: c.posts.nodes }))

  // 「熱門排行」目前還沒有真實閱讀數據，先用最新發布的文章頂替（見 src/app/popular）
  const latestPosts = (latestData?.posts?.nodes ?? []).filter((post) => {
    const categorySlug = post.categories.nodes[0]?.slug
    return categorySlug && !EXCLUDED_CATEGORY_SLUGS.includes(categorySlug)
  })

  const categoryListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'spaceA 文章分類',
    itemListElement: blocks.map((b, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: b.name,
      url: `${SITE_URL}/${b.slug}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryListSchema) }}
      />

      <div className="bg-paper">
        <Hero />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <HomeClient blocks={blocks} />

          <section className="mt-16 bg-white border border-paper-border rounded-[20px] px-9 sm:px-11 pt-10 pb-9">
            <div className="flex items-end justify-between gap-8 flex-wrap pb-7 border-b border-paper-border">
              <div className="max-w-xl">
                <div className="text-xs tracking-wider text-brand-600 font-bold">我們怎麼挑</div>
                <h2 className="font-serif text-[26px] font-bold leading-snug mt-3 text-paper-ink">
                  彙整網路上最真實的聲量，再交給編輯核對
                </h2>
                <p className="text-[15px] leading-loose text-paper-secondary mt-3.5 text-balance">
                  我們不假裝每樣東西都親手用過。spaceA
                  的做法是把公開討論整理起來——論壇、社群、電商評論與專業評測——找出被反覆提到的優點與缺點，再回到官方與通路資料核對，最後標明每則資訊的來源。
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 mt-7">
              {[
                { n: '01', title: '蒐集聲量', body: '彙整論壇、社群與電商評論，記錄每個型號被提到的次數與正負評價比例。' },
                { n: '02', title: '交叉核對', body: '規格與價格一律回到官方與通路頁面確認，不採用單一來源的說法。' },
                { n: '03', title: '標註來源', body: '文中會說明資訊來自實測、使用者回饋或廠商提供，並附上最後更新日期。' },
              ].map((step, i) => (
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
                <h2 className="font-serif text-[22px] font-bold whitespace-nowrap">熱門排行</h2>
                <span className="flex-1 h-px bg-paper-border" />
                <Link
                  href="/popular"
                  className="bg-brand-50 text-brand-600 text-[13px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap hover:bg-brand-100 transition-colors"
                >
                  完整排行
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                {latestPosts.map((post, i) => {
                  const cat = post.categories.nodes[0]
                  const href = `/${cat?.slug}/${post.slug}`
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
                          {cat?.name} · {formatDate(post.date)}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {blocks[0] && (
            <section className="mt-16 mb-16 rounded-[20px] overflow-hidden grid grid-cols-1 sm:grid-cols-2 bg-brand-600 text-white">
              <div className="p-9 sm:p-12 flex flex-col justify-center">
                <div className="text-xs tracking-wider opacity-70">編輯精選專題</div>
                <h3 className="font-serif text-[26px] sm:text-3xl font-bold leading-snug mt-3.5">
                  更多{blocks[0].name}推薦
                </h3>
                <p className="text-[15px] leading-loose opacity-85 mt-4 text-balance">
                  從怎麼挑到怎麼比，我們把{blocks[0].name}相關的推薦文整理成一條龍的決策流程，看完就知道自己該選哪一個。
                </p>
                <Link
                  href={`/${blocks[0].slug}`}
                  className="inline-block w-fit mt-6 bg-white text-brand-600 font-bold text-sm px-6 py-3 rounded-full hover:bg-brand-50 transition-colors"
                >
                  閱讀專題
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
