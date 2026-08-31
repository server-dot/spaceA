'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { WPPostCard } from '@/types/wordpress'
import { ARTICLE_TYPE_LABELS } from '@/lib/constants'
import { resolveArticleType } from '@/lib/article-type'
import ArticleTypeBadge from '@/components/article/ArticleTypeBadge'
import TagChips from '@/components/article/TagChips'

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

interface CategoryPageClientProps {
  categoryName: string
  posts: WPPostCard[]
}

export default function CategoryPageClient({ categoryName, posts }: CategoryPageClientProps) {
  const [tag, setTag] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const initialType = searchParams.get('type')
  const [type, setType] = useState<string | null>(
    initialType && initialType in ARTICLE_TYPE_LABELS ? initialType : null
  )

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
    return Array.from(counts.entries()).map(([slug, v]) => ({ slug, name: v.name, count: v.count }))
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
          <span className="text-xs text-paper-muted tracking-wider">文章類型</span>
          {[
            { slug: null, label: '全部', count: posts.length },
            ...Object.entries(ARTICLE_TYPE_LABELS).map(([slug, label]) => ({
              slug,
              label,
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
                      : 'bg-white border border-paper-border text-paper-ink font-medium'
                  }`}
                >
                  {opt.label}
                  <span className={`text-xs font-normal ${active ? 'text-white/75' : 'text-paper-muted'}`}>
                    {opt.count} 篇
                  </span>
                </button>
              )
            })}
          <span className="text-xs text-paper-muted">
            這個分類收錄{' '}
            {Object.entries(ARTICLE_TYPE_LABELS)
              .map(([slug, label]) => `${typeCounts[slug] ?? 0} 篇${label}`)
              .join('、')}
          </span>
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex items-center gap-2.5 flex-wrap pt-6">
          <span className="text-xs text-paper-muted tracking-wider mr-0.5">主題篩選</span>
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
                    : 'bg-white border border-paper-border text-paper-secondary hover:border-paper-muted'
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
          <span>篩選中，共 {filtered.length} 篇文章</span>
          <button
            type="button"
            onClick={() => {
              setTag(null)
              setType(null)
            }}
            className="text-brand-600 font-bold"
          >
            清除篩選
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-paper-secondary text-[15px]">找不到相關文章，試試其他主題</div>
      ) : (
        <>
          {feature && (
            <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 items-center pt-8 pb-9 border-b border-paper-border">
              <Link
                href={`/${feature.categories.nodes[0]?.slug ?? categoryName}/${feature.slug}`}
                className="block relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-paper-surface"
              >
                {feature.featuredImage?.node && (
                  <Image
                    src={feature.featuredImage.node.sourceUrl}
                    alt={feature.featuredImage.node.altText || feature.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                )}
              </Link>
              <div>
                <div className="flex items-center gap-2.5 text-xs flex-wrap">
                  <span className="text-brand-600 font-bold">編輯精選</span>
                  <ArticleTypeBadge type={resolveArticleType(feature.articleTypes)} size="sm" />
                  <span className="text-paper-muted">{formatDate(feature.date)}</span>
                </div>
                <h2 className="font-serif text-2xl font-bold leading-snug tracking-tight mt-3">
                  <Link
                    href={`/${feature.categories.nodes[0]?.slug ?? categoryName}/${feature.slug}`}
                    className="hover:text-brand-600 transition-colors"
                  >
                    {feature.title}
                  </Link>
                </h2>
                {feature.excerpt && (
                  <p className="text-[15px] leading-loose text-paper-secondary mt-3.5">
                    {stripHtml(feature.excerpt)}
                  </p>
                )}
                {feature.tags.nodes.length > 0 && (
                  <div className="mt-3.5">
                    <TagChips tags={feature.tags.nodes} max={5} />
                  </div>
                )}
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section className="pt-9">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-9 gap-x-8">
                {rest.map((post) => {
                  const category = post.categories.nodes[0]
                  const href = category ? `/${category.slug}/${post.slug}` : `/${categoryName}/${post.slug}`
                  return (
                    <Link key={post.slug} href={href} className="block group">
                      <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-paper-surface">
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
                        <ArticleTypeBadge
                          category={category}
                          type={resolveArticleType(post.articleTypes)}
                        />
                        <span className="text-paper-muted">{formatDate(post.date)}</span>
                      </div>
                      <h3 className="text-lg font-medium leading-relaxed mt-2 group-hover:text-brand-600 transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm leading-loose text-paper-secondary mt-2.5 line-clamp-2">
                          {stripHtml(post.excerpt)}
                        </p>
                      )}
                      {post.tags.nodes.length > 0 && (
                        <div className="mt-2.5">
                          <TagChips tags={post.tags.nodes} max={3} />
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
