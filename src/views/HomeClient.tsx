'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { WPPostCard } from '@/types/wordpress'
import CategoryImage from '@/components/layout/CategoryImage'
import ArticleTypeBadge from '@/components/article/ArticleTypeBadge'
import TagChips from '@/components/article/TagChips'
import Reveal from '@/components/ui/Reveal'
import { resolveArticleType } from '@/lib/article-type'
import { formatDate, resolveSummary } from '@/lib/format'
import { articleHref, articleTypeLabel, categoryHref, ui, type Lang } from '@/lib/i18n'

export interface HomeCategoryBlock {
  slug: string
  name: string
  count: number | null
  posts: WPPostCard[]
}

export interface HomeTopic {
  slug: string
  name: string
  count: number
}

interface HomeClientProps {
  lang: Lang
  blocks: HomeCategoryBlock[]
  topics: HomeTopic[]
}

export default function HomeClient({ lang, blocks, topics }: HomeClientProps) {
  const [selected, setSelected] = useState<string[]>([])
  const t = ui(lang)
  const typeBadge = (post: WPPostCard) => {
    const type = resolveArticleType(post.articleTypes)
    return { ...type, name: articleTypeLabel(lang, type) }
  }

  function toggle(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((v) => v !== slug) : prev.concat(slug)))
  }

  const filtered = selected.length ? blocks.filter((b) => selected.includes(b.slug)) : blocks

  return (
    <>
      <section
        id="topics"
        className="relative z-10 -mt-12 scroll-mt-24 bg-paper-card border border-paper-border rounded-[20px] shadow-[0_18px_44px_rgba(30,25,15,0.08)] px-7 sm:px-9 pt-8 pb-6"
      >
        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-6">
          <div className="font-serif text-xl font-bold tracking-tight text-paper-ink">{t.pickTopics}</div>
          <p className="text-[13px] text-paper-secondary">{t.pickTopicsHint}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {topics.map((topic) => {
            const on = selected.includes(topic.slug)
            return (
              <button
                key={topic.slug}
                type="button"
                onClick={() => toggle(topic.slug)}
                className={`group relative flex flex-col items-center gap-2.5 py-4 px-2.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(30,25,15,0.08)] ${
                  on ? 'bg-brand-50 border-brand-600' : 'bg-paper-card border-paper-border hover:border-paper-muted'
                }`}
              >
                {on && (
                  <span className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-brand-600 text-white text-[11px] leading-[18px]">
                    ✓
                  </span>
                )}
                <span className="relative w-[58px] h-[58px] rounded-full overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <CategoryImage slug={topic.slug} name={topic.name} />
                </span>
                <b className={`text-[15px] ${on ? 'font-bold text-brand-600' : 'font-medium text-paper-ink'}`}>
                  {topic.name}
                </b>
                <span className="text-xs text-paper-muted">{t.postCountShort(topic.count)}</span>
              </button>
            )
          })}
        </div>
      </section>

      <Reveal as="section" className="pt-9 max-w-3xl">
        {/* 首頁的 h1 是 Hero 那句標語，這裡改成 h2 — 一頁只能有一個 h1 */}
        <h2 className="font-serif text-[28px] font-bold tracking-tight leading-snug text-paper-ink text-balance">
          {t.homeH2}
        </h2>
        <p className="text-[15px] leading-loose text-paper-secondary mt-3 text-balance">{t.homeH2Sub}</p>
      </Reveal>

      {selected.length > 0 && (
        <div className="flex items-center gap-3.5 pt-8 text-[13px] text-paper-secondary">
          <span>{t.filteringCategories(filtered.length)}</span>
          <button type="button" onClick={() => setSelected([])} className="text-brand-600 font-bold">
            {t.clearFilter}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-paper-secondary text-[15px]">{t.noCategories}</div>
      ) : (
        filtered.map((block) => {
          const [feature, ...rest] = block.posts
          if (!feature) return null
          return (
            <Reveal as="section" key={block.slug}>
              <div className="flex items-center gap-3.5 pt-10 pb-5">
                <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                <h2 className="font-serif text-[22px] font-bold whitespace-nowrap">{block.name}</h2>
                <span className="grow-line flex-1 h-px bg-paper-border" />
                <Link
                  href={categoryHref(lang, block.slug)}
                  className="bg-brand-50 text-brand-600 text-[13px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap hover:bg-brand-100 transition-colors"
                >
                  {t.viewAll}
                </Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-9">
                <Link href={articleHref(lang, block.slug, feature.slug)} className="group block">
                  <div className="relative w-full aspect-[16/10] rounded-[14px] overflow-hidden bg-paper-surface">
                    {feature.featuredImage?.node && (
                      <Image
                        src={feature.featuredImage.node.sourceUrl}
                        alt={feature.featuredImage.node.altText || feature.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 text-xs mt-4 flex-wrap">
                    <ArticleTypeBadge category={{ name: block.name, slug: block.slug }} type={typeBadge(feature)} />
                    <span className="text-paper-muted">{formatDate(feature.date, lang)}</span>
                  </div>
                  <h3 className="text-2xl font-bold leading-relaxed tracking-tight mt-2.5 text-paper-ink transition-colors group-hover:text-brand-600">
                    {feature.title}
                  </h3>
                  {resolveSummary(feature.excerpt) && (
                    <p className="text-[15px] leading-loose text-paper-secondary mt-3">
                      {resolveSummary(feature.excerpt)}
                    </p>
                  )}
                  {feature.tags.nodes.length > 0 && (
                    <div className="mt-3">
                      <TagChips tags={feature.tags.nodes} max={5} />
                    </div>
                  )}
                </Link>
                <div>
                  <ul>
                    {rest.slice(0, 4).map((post, i) => (
                      <Reveal
                        as="li"
                        key={post.slug}
                        delay={120 + i * 90}
                        className="grid grid-cols-[104px_1fr] gap-4 py-4 border-b border-paper-border"
                      >
                        <Link
                          href={articleHref(lang, block.slug, post.slug)}
                          className="group relative w-full h-[72px] rounded-[10px] overflow-hidden bg-paper-surface"
                        >
                          {post.featuredImage?.node && (
                            <Image
                              src={post.featuredImage.node.sourceUrl}
                              alt={post.featuredImage.node.altText || post.title}
                              fill
                              sizes="104px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                        </Link>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <ArticleTypeBadge
                              category={{ name: block.name, slug: block.slug }}
                              type={typeBadge(post)}
                              size="sm"
                            />
                            <em className="not-italic text-[11px] text-paper-muted font-normal">
                              {formatDate(post.date, lang)}
                            </em>
                          </div>
                          <Link
                            href={articleHref(lang, block.slug, post.slug)}
                            className="block text-[15px] font-medium leading-relaxed mt-1.5 hover:text-brand-600 transition-colors"
                          >
                            {post.title}
                          </Link>
                          {post.tags.nodes.length > 0 && (
                            <div className="mt-1.5">
                              <TagChips tags={post.tags.nodes} max={2} />
                            </div>
                          )}
                        </div>
                      </Reveal>
                    ))}
                  </ul>
                  <Link
                    href={categoryHref(lang, block.slug)}
                    className="block text-center mt-5 bg-brand-600 hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(2,132,199,0.25)] text-white font-bold text-sm py-3.5 rounded-lg transition-all duration-200"
                  >
                    {t.seeMoreOf(block.name)}
                  </Link>
                </div>
              </div>
            </Reveal>
          )
        })
      )}
    </>
  )
}
