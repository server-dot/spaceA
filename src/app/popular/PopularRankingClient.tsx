'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { RANGES, type RangeKey, type RankedArticle } from './data'
import { WPCategory } from '@/types/wordpress'

const BREADCRUMBS = [
  { label: '首頁', href: '/' },
  { label: '熱門排行', href: '/popular' },
]

function formatRangeLabel(days: number | null) {
  const now = new Date()
  if (days === null) return '全站累計'
  const start = new Date(now)
  start.setDate(start.getDate() - days)
  const fmt = (d: Date) => d.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })
  return `${fmt(start)} – ${fmt(now)}`
}

interface Props {
  articles: RankedArticle[]
  categories: WPCategory[]
}

export default function PopularRankingClient({ articles, categories }: Props) {
  const [range, setRange] = useState<RangeKey>('all')
  const [category, setCategory] = useState('全部')

  const rangeLabel = useMemo(() => {
    if (range === 'week') return formatRangeLabel(7)
    if (range === 'month') return formatRangeLabel(30)
    return formatRangeLabel(null)
  }, [range])

  // 目前還沒有真實閱讀數據，暫以「發布時間」當篩選依據（真的落在該期間內才會出現），
  // 不像舊版用 slice/reverse 假造不同區間的排序
  let list = articles
  if (range !== 'all') {
    const days = range === 'week' ? 7 : 30
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    list = articles.filter((item) => new Date(item.dateISO).getTime() >= cutoff)
  }
  if (category !== '全部') list = list.filter((item) => item.cat === category)

  const categoryFilters = useMemo(() => {
    const names = new Set(articles.map((a) => a.cat))
    return ['全部', ...Array.from(names)]
  }, [articles])

  return (
    <div className="bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-7">
          <Breadcrumbs items={BREADCRUMBS} />
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 sm:gap-10 items-end pt-6 pb-7 border-b border-paper-border">
          <div className="max-w-xl">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink">
              熱門排行
            </h1>
            <p className="text-[15px] leading-loose text-paper-secondary mt-3 text-balance">
              目前依發布時間排序，帶你看最新上稿的推薦與知識內容。等實際閱讀數據串接完成，會改成依讀者行為排序。
            </p>
            <p className="text-xs text-paper-muted mt-2.5">統計期間：{rangeLabel}</p>
          </div>
          <div className="flex gap-2.5">
            {RANGES.map((r) => {
              const active = r.key === range
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRange(r.key)}
                  className={`rounded-full px-4 py-2 text-[13px] transition-colors ${
                    active
                      ? 'bg-paper-ink border border-paper-ink text-white font-bold'
                      : 'bg-white border border-paper-border text-paper-secondary hover:border-paper-muted'
                  }`}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
        </section>

        {categoryFilters.length > 2 && (
          <div className="flex items-center gap-2.5 flex-wrap pt-5">
            <span className="text-xs text-paper-muted tracking-wider mr-0.5">分類</span>
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
                      : 'bg-white border border-paper-border text-paper-secondary hover:border-paper-muted'
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10 lg:gap-14 items-start pt-8">
          <div>
            <ol className="grid">
              {list.map((p, i) => (
                <li
                  key={p.href}
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
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">spaceA</span>
                      </div>
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
                </li>
              ))}
            </ol>

            {list.length === 0 && (
              <div className="py-16 text-center text-paper-secondary text-[15px]">
                這個區間還沒有進榜的文章
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 grid gap-5">
            <div className="bg-white border border-paper-border rounded-2xl p-6">
              <div className="text-xs tracking-wider text-paper-muted font-bold">排行怎麼算</div>
              <ul className="grid gap-3 mt-4 text-sm leading-relaxed text-paper-body">
                <li>目前依發布時間排序，之後會換成依實際閱讀量排序。</li>
                <li>排除自家內部流量，統計期間標示在標題下方。</li>
                <li>排行不受廣告或合作影響，也不對外開放付費。</li>
              </ul>
              <Link href="/standards#how" className="block mt-4 text-[13px] font-bold text-brand-600">
                看推薦標準
              </Link>
            </div>
            {categories.length > 0 && (
              <div className="bg-paper-surface rounded-2xl p-6">
                <div className="text-xs tracking-wider text-paper-muted font-bold">逛分類</div>
                <ul className="grid gap-3 mt-4 text-sm">
                  {categories.map((c) => (
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
        </section>

        <div className="h-16 sm:h-20" />
      </div>
    </div>
  )
}
