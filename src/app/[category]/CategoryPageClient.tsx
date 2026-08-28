'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { WPPostCard } from '@/types/wordpress'

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

interface CategoryPageClientProps {
  categoryName: string
  posts: WPPostCard[]
}

export default function CategoryPageClient({ categoryName, posts }: CategoryPageClientProps) {
  const [tag, setTag] = useState<string | null>(null)

  const tags = useMemo(() => {
    const seen = new Map<string, string>()
    posts.forEach((post) => {
      post.tags.nodes.forEach((t) => seen.set(t.slug, t.name))
    })
    return Array.from(seen.entries()).map(([slug, name]) => ({ slug, name }))
  }, [posts])

  const filtered = tag ? posts.filter((post) => post.tags.nodes.some((t) => t.slug === tag)) : posts
  const [feature, ...rest] = filtered

  return (
    <>
      {tags.length > 0 && (
        <div className="flex items-center gap-2.5 flex-wrap pt-6">
          <span className="text-xs text-paper-muted tracking-wider mr-0.5">主題篩選</span>
          {tags.map((t) => {
            const active = tag === t.slug
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => setTag(active ? null : t.slug)}
                className={`rounded-full px-4 py-1.5 text-[13px] transition-colors ${
                  active
                    ? 'bg-brand-600 border border-brand-600 text-white font-bold'
                    : 'bg-white border border-paper-border text-paper-secondary hover:border-paper-muted'
                }`}
              >
                {t.name}
              </button>
            )
          })}
        </div>
      )}

      {tag && (
        <div className="flex items-center gap-3.5 pt-5 text-[13px] text-paper-secondary">
          <span>篩選中，共 {filtered.length} 篇文章</span>
          <button type="button" onClick={() => setTag(null)} className="text-brand-600 font-bold">
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
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="text-brand-600 font-bold">編輯精選</span>
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
                      <div className="flex items-center gap-2.5 text-xs mt-3.5">
                        {category && <span className="text-brand-600 font-bold">{category.name}</span>}
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
