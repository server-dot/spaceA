'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ArticleImageFallback from '@/components/article/ArticleImageFallback'
import { RANGE_KEYS, type RangeKey, type RankedArticle } from './popular-data'
import { WPCategory } from '@/types/wordpress'
import Reveal from '@/components/ui/Reveal'
import { categoryHref, homeHref, langPrefix, ui, type Lang } from '@/lib/i18n'

const ALL = '__all__'

function formatRangeLabel(days: number | null, lang: Lang) {
  const now = new Date()
  if (days === null) return ui(lang).popularAllTime
  const start = new Date(now)
  start.setDate(start.getDate() - days)
  const fmt = (d: Date) => d.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-TW', { month: 'long', day: 'numeric' })
  return `${fmt(start)} – ${fmt(now)}`
}

interface Props {
  lang: Lang
  articles: RankedArticle[]
  categories: WPCategory[]
}

export default function PopularRankingClient({ lang, articles, categories }: Props) {
  const t = ui(lang)
  const breadcrumbs = [
    { label: t.home, href: homeHref(lang) },
    { label: t.popularTitle, href: `${langPrefix(lang)}/popular` },
  ]
  const [range, setRange] = useState<RangeKey>('all')
  const [category, setCategory] = useState(ALL)

  const rangeLabel = useMemo(() => {
    if (range === 'week') return formatRangeLabel(7, lang)
    if (range === 'month') return formatRangeLabel(30, lang)
    return formatRangeLabel(null, lang)
  }, [range, lang])

  // 「現在」只在初次掛載時取一次：直接在 render 裡呼叫 Date.now() 會讓每次重繪的篩選結果
  // 都可能不同（react-hooks/purity），用 lazy initializer 就能固定住這個值
  const [now] = useState(() => Date.now())

  // 目前還沒有真實閱讀數據，暫以「發布時間」當篩選依據（真的落在該期間內才會出現），
  // 不像舊版用 slice/reverse 假造不同區間的排序
  let list = articles
  if (range !== 'all') {
    const days = range === 'week' ? 7 : 30
    const cutoff = now - days * 24 * 60 * 60 * 1000
    list = articles.filter((item) => new Date(item.dateISO).getTime() >= cutoff)
  }
  if (category !== ALL) list = list.filter((item) => item.cat === category)

  const categoryFilters = useMemo(() => {
    const names = new Set(articles.map((a) => a.cat))
    return [ALL, ...Array.from(names)]
  }, [articles])

  return (
    <div className="bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-7">
          <Breadcrumbs items={breadcrumbs} label={t.breadcrumbs} />
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 sm:gap-10 items-end pt-6 pb-7 border-b border-paper-border">
          <div className="max-w-xl">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink">
              {t.popularTitle}
            </h1>
            <p className="text-[15px] leading-loose text-paper-secondary mt-3 text-balance">{t.popularIntro}</p>
            <p className="text-xs text-paper-muted mt-2.5">
              {t.popularPeriod}
              {rangeLabel}
            </p>
          </div>
          <div className="flex gap-2.5">
            {RANGE_KEYS.map((key) => {
              const active = key === range
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRange(key)}
                  className={`rounded-full px-4 py-2 text-[13px] transition-colors ${
                    active
                      ? 'bg-paper-ink border border-paper-ink text-white font-bold'
                      : 'bg-paper-card border border-paper-border text-paper-secondary hover:border-paper-muted'
                  }`}
                >
                  {t.ranges[key]}
                </button>
              )
            })}
          </div>
        </section>

        {categoryFilters.length > 2 && (
          <div className="flex items-center gap-2.5 flex-wrap pt-5">
            <span className="text-xs text-paper-muted tracking-wider mr-0.5">{t.category}</span>
            {categoryFilters.map((name) => {
              const active = name === category
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setCategory(name)}
                  className={`rounded-full px-4 py-1.5 text-[13px] transition-colors ${
                    active
                      ? 'bg-brand-600 border border-brand-600 text-white font-bold'
                      : 'bg-paper-card border border-paper-border text-paper-secondary hover:border-paper-muted'
                  }`}
                >
                  {name === ALL ? t.all : name}
                </button>
              )
            })}
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10 lg:gap-14 items-start pt-8">
          <div>
            <ol className="grid">
              {list.map((p, i) => (
                <Reveal
                  as="li"
                  key={p.href}
                  delay={Math.min(i, 6) * 70}
                  className={`grid grid-cols-[40px_100px_1fr] sm:grid-cols-[56px_132px_1fr] gap-4 sm:gap-5 items-start py-5 border-b border-paper-border ${
                    i === 0 ? 'border-t' : ''
                  }`}
                >
                  <span
                    className={`font-serif text-2xl sm:text-3xl font-bold leading-tight ${
                      i < 3 ? 'text-brand-600' : 'text-paper-secondary'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="relative w-full h-[70px] sm:h-[88px] rounded-xl overflow-hidden bg-paper-surface">
                    {p.image ? (
                      <Image
                        src={p.image.url}
                        alt={p.image.alt}
                        fill
                        sizes="(max-width: 640px) 100px, 132px"
                        className="object-cover"
                      />
                    ) : (
                      <ArticleImageFallback size={24} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className="text-brand-600 font-bold">{p.cat}</span>
                      <span className="text-paper-muted">{p.date}</span>
                    </div>
                    <h2
                      className={`mt-2 leading-relaxed tracking-tight ${
                        i < 3 ? 'text-lg sm:text-xl font-bold' : 'text-base sm:text-lg font-medium'
                      }`}
                    >
                      <Link href={p.href} className="hover:text-brand-600 transition-colors">
                        {p.title}
                      </Link>
                    </h2>
                    <p className="text-sm leading-loose text-paper-secondary mt-2">{p.excerpt}</p>
                  </div>
                </Reveal>
              ))}
            </ol>

            {list.length === 0 && (
              <div className="py-16 text-center text-paper-secondary text-[15px]">
                {t.popularEmpty}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 grid gap-5">
            {categories.length > 0 && (
              <div className="bg-paper-card border border-paper-border rounded-2xl p-6">
                <div className="text-xs tracking-wider text-paper-muted font-bold">{t.otherTopics}</div>
                <p className="text-sm leading-relaxed text-paper-body mt-3">{t.otherTopicsHint}</p>
                <ul className="grid gap-3 mt-4 text-sm">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={categoryHref(lang, c.slug)}
                        className="flex items-center justify-between text-paper-body hover:text-brand-600 transition-colors"
                      >
                        <span>{c.name}</span>
                        {typeof c.count === 'number' && (
                          <span className="text-paper-muted">{t.postCountShort(c.count)}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </section>

        <div className="h-16 sm:h-20" />
      </div>
    </div>
  )
}
