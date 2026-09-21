'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState, useSyncExternalStore } from 'react'
import { WPPostCard } from '@/types/wordpress'
import { ARTICLE_TYPE_LABELS } from '@/lib/constants'
import { resolveArticleType } from '@/lib/article-type'
import { formatDate, resolveSummary } from '@/lib/format'
import { articleHref, articleTypeLabel, ui, type Lang } from '@/lib/i18n'
import ArticleTypeBadge from '@/components/article/ArticleTypeBadge'
import TagChips from '@/components/article/TagChips'
import Pagination from '@/components/ui/Pagination'
import Reveal from '@/components/ui/Reveal'

interface CategoryPageClientProps {
  lang: Lang
  /** WordPress 分類 slug（英文版帶 -en），載入更多時直接拿去查 */
  categorySlug: string
  posts: WPPostCard[]
  initialPageInfo: { hasNextPage: boolean; endCursor: string }
}

export default function CategoryPageClient({
  lang,
  categorySlug,
  posts: initialPosts,
  initialPageInfo,
}: CategoryPageClientProps) {
  const t = ui(lang)
  const typeBadge = (post: WPPostCard) => {
    const type = resolveArticleType(post.articleTypes)
    return { ...type, name: articleTypeLabel(lang, type) }
  }
  const hrefOf = (post: WPPostCard) => articleHref(lang, post.categories.nodes[0]?.slug ?? categorySlug, post.slug)
  const [posts, setPosts] = useState(initialPosts)
  const [pageInfo, setPageInfo] = useState(initialPageInfo)
  const [loadingMore, setLoadingMore] = useState(false)

  const [tag, setTag] = useState<string | null>(null)
  // ?type= 篩選在掛載後才從網址讀。之前用 useSearchParams，靜態頁會整個退到客戶端渲染：
  // 伺服器 HTML 裡沒有半篇文章（Suspense fallback 是 null），列表在客戶端才長出來，
  // 把下面的「其他分類」往下推，CLS 0.45；爬蟲拿到的分類頁也是空的
  const initialType = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get('type'),
    () => null
  )
  const [typeOverride, setType] = useState<string | null | undefined>(undefined)
  const type = typeOverride !== undefined ? typeOverride : initialType && initialType in ARTICLE_TYPE_LABELS ? initialType : null

  async function handleLoadMore() {
    if (!pageInfo.hasNextPage || loadingMore) return
    setLoadingMore(true)
    try {
      const params = new URLSearchParams({
        slug: categorySlug,
        after: pageInfo.endCursor,
      })
      const res = await fetch(`/api/category-posts?${params.toString()}`)
      if (!res.ok) throw new Error(`load more failed with ${res.status}`)
      const data = await res.json()
      setPosts((prev) => [...prev, ...((data.posts as WPPostCard[]) ?? [])])
      setPageInfo(data.pageInfo ?? { hasNextPage: false, endCursor: '' })
    } catch (err) {
      console.error('[CategoryPageClient] 載入更多文章失敗', err)
    } finally {
      setLoadingMore(false)
    }
  }

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    posts.forEach((post) => {
      const slug = resolveArticleType(post.articleTypes).slug
      counts[slug] = (counts[slug] ?? 0) + 1
    })
    return counts
  }, [posts])

  // tag 篩選清單的來源要吃「文章類型」篩選結果，不能永遠用全部 posts 算——
  // 不然選了某類型後，清單裡還會留著那個類型底下根本沒有文章的 tag
  const byType = type ? posts.filter((post) => resolveArticleType(post.articleTypes).slug === type) : posts

  const tags = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>()
    byType.forEach((post) => {
      post.tags.nodes.forEach((t) => {
        const entry = counts.get(t.slug)
        counts.set(t.slug, { name: t.name, count: (entry?.count ?? 0) + 1 })
      })
    })
    return Array.from(counts.entries()).map(([slug, v]) => ({
      slug,
      name: v.name,
      count: v.count,
    }))
  }, [byType])

  // 切換類型後，若目前選的 tag 在新類型底下已經沒有文章，一併清掉篩選
  const activeTagValid = tag ? tags.some((t) => t.slug === tag) : true
  const effectiveTag = activeTagValid ? tag : null

  const filtered = effectiveTag ? byType.filter((post) => post.tags.nodes.some((t) => t.slug === effectiveTag)) : byType
  const [firstPost, ...others] = filtered
  // 類型不是「全部」時，不顯示「編輯精選」大版位，該篇併入下方文章格一起排
  const feature = type ? undefined : firstPost
  const rest = type ? filtered : others

  return (
    <>
      {Object.keys(typeCounts).length > 1 && (
        <div className="flex items-center gap-3 flex-wrap pt-[26px]">
          <span className="text-xs text-paper-muted tracking-wider">{t.articleTypeLabel}</span>
          {[
            { slug: null, label: t.all, count: posts.length },
            ...Object.keys(ARTICLE_TYPE_LABELS).map((slug) => ({
              slug,
              label: t.articleTypes[slug],
              count: typeCounts[slug] ?? 0,
            })),
          ]
            .filter((opt) => opt.slug === null || opt.count > 0)
            .map((opt) => {
              const active = type === opt.slug
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setType(active ? null : opt.slug)}
                  className={`flex items-baseline gap-2 rounded-full px-[18px] py-[9px] text-sm transition-colors ${
                    active
                      ? 'bg-brand-600 border border-brand-600 text-white font-bold'
                      : 'bg-paper-card border border-paper-border text-paper-ink font-medium'
                  }`}
                >
                  {opt.label}
                  <span className={`text-xs font-normal ${active ? 'text-white/75' : 'text-paper-muted'}`}>
                    {t.postCountShort(opt.count)}
                  </span>
                </button>
              )
            })}
          <span className="text-xs text-paper-muted">
            {t.typeSummary(
              Object.keys(ARTICLE_TYPE_LABELS)
                .map((slug) => t.typeCount(typeCounts[slug] ?? 0, t.articleTypes[slug]))
                .join(lang === 'en' ? ', ' : '、')
            )}
          </span>
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex items-center gap-2.5 flex-wrap pt-6">
          <span className="text-xs text-paper-muted tracking-wider mr-0.5">{t.tagFilter}</span>
          {tags.map((t) => {
            const active = effectiveTag === t.slug
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => setTag(active ? null : t.slug)}
                className={`flex items-baseline gap-1.5 rounded-full px-4 py-1.5 text-[13px] transition-colors ${
                  active
                    ? 'bg-brand-600 border border-brand-600 text-white font-bold'
                    : 'bg-paper-card border border-paper-border text-paper-secondary hover:border-paper-muted'
                }`}
              >
                {t.name}
                <span className={`text-[11px] font-normal ${active ? 'text-white/75' : 'text-paper-muted'}`}>
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {(effectiveTag || type) && (
        <div className="flex items-center gap-3.5 pt-5 text-[13px] text-paper-secondary">
          <span>{t.filtering(filtered.length)}</span>
          <button
            type="button"
            onClick={() => {
              setTag(null)
              setType(null)
            }}
            className="text-brand-600 font-bold"
          >
            {t.clearFilter}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-paper-secondary text-[15px]">{t.noPosts}</div>
      ) : (
        <>
          {feature && (
            <Reveal
              as="section"
              className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 items-center pt-8 pb-9 border-b border-paper-border"
            >
              <Link
                href={hrefOf(feature)}
                className="group block relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-paper-surface"
              >
                {feature.featuredImage?.node && (
                  <Image
                    src={feature.featuredImage.node.sourceUrl}
                    alt={feature.featuredImage.node.altText || feature.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
              </Link>
              <div>
                <div className="flex items-center gap-2.5 text-xs flex-wrap">
                  <span className="text-brand-600 font-bold">{t.editorsPick}</span>
                  <ArticleTypeBadge type={typeBadge(feature)} size="sm" />
                  <span className="text-paper-muted">{formatDate(feature.date, lang)}</span>
                </div>
                <h2 className="font-serif text-2xl font-bold leading-snug tracking-tight mt-3">
                  <Link href={hrefOf(feature)} className="hover:text-brand-600 transition-colors">
                    {feature.title}
                  </Link>
                </h2>
                {resolveSummary(feature.excerpt) && (
                  <p className="text-[15px] leading-loose text-paper-secondary mt-3.5">
                    {resolveSummary(feature.excerpt)}
                  </p>
                )}
                {feature.tags.nodes.length > 0 && (
                  <div className="mt-3.5">
                    <TagChips tags={feature.tags.nodes} max={5} />
                  </div>
                )}
              </div>
            </Reveal>
          )}

          {rest.length > 0 && (
            <section className="pt-9">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-9 gap-x-8">
                {rest.map((post, i) => {
                  const category = post.categories.nodes[0]
                  const href = hrefOf(post)
                  // key 帶篩選狀態：切換類型／主題時卡片重新掛載，進場動畫會再跑一次
                  return (
                    <Reveal key={`${type ?? 'all'}-${effectiveTag ?? 'all'}-${post.slug}`} delay={(i % 3) * 90}>
                      <Link href={href} className="block group">
                        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-paper-surface transition-shadow duration-300 group-hover:shadow-[0_14px_32px_rgba(30,25,15,0.12)]">
                          {post.featuredImage?.node && (
                            <Image
                              src={post.featuredImage.node.sourceUrl}
                              alt={post.featuredImage.node.altText || post.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 text-xs mt-3.5 flex-wrap">
                          <ArticleTypeBadge category={category} type={typeBadge(post)} />
                          <span className="text-paper-muted">{formatDate(post.date, lang)}</span>
                        </div>
                        <h3 className="text-lg font-medium leading-relaxed mt-2 group-hover:text-brand-600 transition-colors">
                          {post.title}
                        </h3>
                        {resolveSummary(post.excerpt) && (
                          <p className="text-sm leading-loose text-paper-secondary mt-2.5 line-clamp-2">
                            {resolveSummary(post.excerpt)}
                          </p>
                        )}
                        {post.tags.nodes.length > 0 && (
                          <div className="mt-2.5">
                            <TagChips tags={post.tags.nodes} max={3} />
                          </div>
                        )}
                      </Link>
                    </Reveal>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}

      <Pagination
        hasNextPage={pageInfo.hasNextPage}
        onLoadMore={handleLoadMore}
        loading={loadingMore}
        labels={{ more: t.loadMore, loading: t.loading }}
      />
    </>
  )
}
