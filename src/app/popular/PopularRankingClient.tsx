'use client'

import { useState } from 'react'
import Link from 'next/link'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import CategoryImage from '@/components/layout/CategoryImage'
import { RANKED_ARTICLES, RANGES, CATEGORY_FILTERS, type RangeKey } from './data'

const BREADCRUMBS = [
  { label: '首頁', href: '/' },
  { label: '熱門排行', href: '/popular' },
]

export default function PopularRankingClient() {
  const [range, setRange] = useState<RangeKey>('week')
  const [category, setCategory] = useState('全部')

  const current = RANGES.find((r) => r.key === range) ?? RANGES[0]

  let list = RANKED_ARTICLES.slice()
  if (range === 'month') list = [...RANKED_ARTICLES.slice(2), ...RANKED_ARTICLES.slice(0, 2)]
  else if (range === 'all') list = RANKED_ARTICLES.slice().reverse()
  if (category !== '全部') list = list.filter((item) => item.cat === category)

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
              依實際閱讀數據排序，每週一更新。排行反映讀者在看什麼，不代表我們認為它最值得買——推薦理由請看文章本身。
            </p>
            <p className="text-xs text-paper-muted mt-2.5">統計期間：{current.range}</p>
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

        <div className="flex items-center gap-2.5 flex-wrap pt-5">
          <span className="text-xs text-paper-muted tracking-wider mr-0.5">分類</span>
          {CATEGORY_FILTERS.map((name) => {
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
                    <CategoryImage slug={p.catSlug} name={p.cat} />
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
                這個分類本週還沒有進榜的文章
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 grid gap-5">
            <div className="bg-white border border-paper-border rounded-2xl p-6">
              <div className="text-xs tracking-wider text-paper-muted font-bold">排行怎麼算</div>
              <ul className="grid gap-3 mt-4 text-sm leading-relaxed text-paper-body">
                <li>依頁面實際閱讀量排序，排除自家內部流量。</li>
                <li>每週一重新統計，統計期間標示在標題下方。</li>
                <li>排行不受廣告或合作影響，也不對外開放付費。</li>
              </ul>
              <Link href="/about#how" className="block mt-4 text-[13px] font-bold text-brand-600">
                看編輯方針
              </Link>
            </div>
            <div className="bg-paper-surface rounded-2xl p-6">
              <div className="text-xs tracking-wider text-paper-muted font-bold">逛分類</div>
              <ul className="grid gap-3 mt-4 text-sm">
                <li>
                  <Link href="/pets" className="text-paper-body hover:text-brand-600 transition-colors">
                    寵物生活
                  </Link>
                </li>
                <li>
                  <Link href="/3c" className="text-paper-body hover:text-brand-600 transition-colors">
                    3C 數位
                  </Link>
                </li>
                <li>
                  <Link href="/food" className="text-paper-body hover:text-brand-600 transition-colors">
                    美食餐廳
                  </Link>
                </li>
                <li>
                  <Link href="/health" className="text-paper-body hover:text-brand-600 transition-colors">
                    健康醫療
                  </Link>
                </li>
                <li>
                  <Link href="/education" className="text-paper-body hover:text-brand-600 transition-colors">
                    教育學習
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </section>

        <div className="h-16 sm:h-20" />
      </div>
    </div>
  )
}
