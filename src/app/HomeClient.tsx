'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { WPPostCard } from '@/types/wordpress'
import CategoryImage from '@/components/layout/CategoryImage'
import ArticleTypeBadge from '@/components/article/ArticleTypeBadge'
import { resolveArticleType } from '@/lib/article-type'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '')
}

export interface HomeCategoryBlock {
  slug: string
  name: string
  count: number | null
  posts: WPPostCard[]
}

interface HomeClientProps {
  blocks: HomeCategoryBlock[]
}

export default function HomeClient({ blocks }: HomeClientProps) {
  const [selected, setSelected] = useState<string[]>([])

  function toggle(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((v) => v !== slug) : prev.concat(slug)))
  }

  const filtered = selected.length ? blocks.filter((b) => selected.includes(b.slug)) : blocks

  return (
    <>
      <section className="relative z-10 -mt-12 bg-white border border-paper-border rounded-[20px] shadow-[0_18px_44px_rgba(30,25,15,0.08)] px-7 sm:px-9 pt-8 pb-6">
        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-6">
          <div className="font-serif text-xl font-bold tracking-tight text-paper-ink">想看哪些主題？</div>
          <p className="text-[13px] text-paper-secondary">可複選，下方分區會即時篩選</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {blocks.map((b) => {
            const on = selected.includes(b.slug)
            return (
              <button
                key={b.slug}
                type="button"
                onClick={() => toggle(b.slug)}
                className={`relative flex flex-col items-center gap-2.5 py-4 px-2.5 rounded-2xl border transition-colors ${
                  on ? 'bg-brand-50 border-brand-600' : 'bg-white border-paper-border'
                }`}
              >
                {on && (
                  <span className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-brand-600 text-white text-[11px] leading-[18px]">
                    ✓
                  </span>
                )}
                <span className="relative w-[58px] h-[58px] rounded-full overflow-hidden shrink-0">
                  <CategoryImage slug={b.slug} name={b.name} />
                </span>
                <b className={`text-[15px] ${on ? 'font-bold text-brand-600' : 'font-medium text-paper-ink'}`}>
                  {b.name}
                </b>
                {b.count != null && <span className="text-xs text-paper-muted">{b.count} 篇</span>}
              </button>
            )
          })}
        </div>
      </section>

      <section className="pt-9 max-w-3xl">
        <h1 className="font-serif text-[28px] font-bold tracking-tight leading-snug text-paper-ink text-balance">
          spaceA 推薦文：彙整網路真實聲量的選物指南
        </h1>
        <p className="text-[15px] leading-loose text-paper-secondary mt-3 text-balance">
          精選推薦文章，幫你找到最值得的選擇。每篇推薦都標明資料來源與更新日期。
        </p>
      </section>

      {selected.length > 0 && (
        <div className="flex items-center gap-3.5 pt-8 text-[13px] text-paper-secondary">
          <span>篩選中，顯示 {filtered.length} 個分類</span>
          <button type="button" onClick={() => setSelected([])} className="text-brand-600 font-bold">
            清除篩選
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-paper-secondary text-[15px]">找不到相關分類，試試其他主題</div>
      ) : (
        filtered.map((block) => {
          const [feature, ...rest] = block.posts
          if (!feature) return null
          return (
            <section key={block.slug}>
              <div className="flex items-center gap-3.5 pt-10 pb-5">
                <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                <h2 className="font-serif text-[22px] font-bold whitespace-nowrap">{block.name}</h2>
                <span className="flex-1 h-px bg-paper-border" />
                <Link
                  href={`/${block.slug}`}
                  className="bg-brand-50 text-brand-600 text-[13px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap hover:bg-brand-100 transition-colors"
                >
                  查看全部
                </Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-9">
                <Link href={`/${block.slug}/${feature.slug}`} className="block">
                  <div className="relative w-full aspect-[16/10] rounded-[14px] overflow-hidden bg-paper-surface">
                    {feature.featuredImage?.node && (
                      <Image
                        src={feature.featuredImage.node.sourceUrl}
                        alt={feature.featuredImage.node.altText || feature.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 text-xs mt-4 flex-wrap">
                    <ArticleTypeBadge
                      category={{ name: block.name, slug: block.slug }}
                      type={resolveArticleType(feature.articleTypes)}
                    />
                    <span className="text-paper-muted">{formatDate(feature.date)}</span>
                  </div>
                  <h3 className="text-2xl font-bold leading-relaxed tracking-tight mt-2.5 text-paper-ink">
                    {feature.title}
                  </h3>
                  {feature.excerpt && (
                    <p className="text-[15px] leading-loose text-paper-secondary mt-3">
                      {stripHtml(feature.excerpt)}
                    </p>
                  )}
                </Link>
                <div>
                  <ul>
                    {rest.slice(0, 4).map((post) => (
                      <li key={post.slug} className="grid grid-cols-[104px_1fr] gap-4 py-4 border-b border-paper-border">
                        <Link
                          href={`/${block.slug}/${post.slug}`}
                          className="relative w-full h-[72px] rounded-[10px] overflow-hidden bg-paper-surface"
                        >
                          {post.featuredImage?.node && (
                            <Image
                              src={post.featuredImage.node.sourceUrl}
                              alt={post.featuredImage.node.altText || post.title}
                              fill
                              sizes="104px"
                              className="object-cover"
                            />
                          )}
                        </Link>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <ArticleTypeBadge
                              category={{ name: block.name, slug: block.slug }}
                              type={resolveArticleType(post.articleTypes)}
                              size="sm"
                            />
                            <em className="not-italic text-[11px] text-paper-muted font-normal">
                              {formatDate(post.date)}
                            </em>
                          </div>
                          <Link
                            href={`/${block.slug}/${post.slug}`}
                            className="block text-[15px] font-medium leading-relaxed mt-1.5 hover:text-brand-600 transition-colors"
                          >
                            {post.title}
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/${block.slug}`}
                    className="block text-center mt-5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm py-3.5 rounded-lg transition-colors"
                  >
                    看更多{block.name}
                  </Link>
                </div>
              </div>
            </section>
          )
        })
      )}
    </>
  )
}
