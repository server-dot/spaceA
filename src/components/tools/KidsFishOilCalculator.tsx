'use client'

import { useState } from 'react'
import { KIDS_FISH_OIL, dailyTarget, type FishOilProduct } from '@/data/kids-fish-oil'

/**
 * 兒童魚油計算器：選孩子年齡 → 每款照官網建議量要吃幾顆、一天補到多少、一個月花多少。
 * 嵌在 post 1410 內文的 <div data-spacea-tool="kids-fish-oil"></div> 位置（ArticleBody 負責切開）。
 * 伺服器端先用預設年齡算好整張表，爬蟲看得到內容；客戶端切年齡才重算。
 */

const AGES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const DEFAULT_AGE = 6

type Status = 'ok' | 'short' | 'age' | 'nodata'

interface Row {
  p: FishOilProduct
  status: Status
  perDay: number
  intake: number | null
  monthly: number
}

function compute(age: number): Row[] {
  const target = dailyTarget(age)
  const rows = KIDS_FISH_OIL.map((p): Row => {
    const [lo, hi] = p.perDay(age)
    // 10 歲以上對的是 DHA 建議量，只算 DHA；10 歲以下對 EPA＋DHA，官網沒標 EPA 的只算 DHA
    const per = p.dha == null ? null : age >= 10 ? p.dha : p.dha + (p.epa ?? 0)
    let status: Status = 'ok'
    let n = lo
    if (p.minAge != null && age < p.minAge) status = 'age'
    else if (per == null) status = 'nodata'
    else {
      const enough = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).find((k) => k * per >= target.low)
      if (enough == null) { n = hi; status = 'short' } else n = enough
    }
    return { p, status, perDay: n, intake: per == null ? null : Math.round(per * n), monthly: Math.round((p.price / p.count) * n * 30) }
  })
  const order: Record<Status, number> = { ok: 0, short: 1, nodata: 2, age: 3 }
  return rows.sort((a, b) => order[a.status] - order[b.status] || a.monthly - b.monthly)
}

const BADGE: Record<Status, { text: string; cls: string }> = {
  ok: { text: '達建議量', cls: 'bg-emerald-50 text-emerald-700' },
  short: { text: '未達建議量', cls: 'bg-amber-50 text-amber-700' },
  nodata: { text: '官網未標示 DHA', cls: 'bg-gray-100 text-gray-600' },
  age: { text: '年齡未達', cls: 'bg-gray-100 text-gray-500' },
}

export default function KidsFishOilCalculator() {
  const [age, setAge] = useState(DEFAULT_AGE)
  const target = dailyTarget(age)
  const rows = compute(age)
  const okCount = rows.filter((r) => r.status === 'ok').length
  const unit = age >= 10 ? 'DHA' : 'EPA＋DHA'

  return (
    <section className="not-prose my-8 rounded-2xl border border-[#e6e2da] bg-white p-5 sm:p-6" aria-labelledby="kfo-calc-title">
      <h3 id="kfo-calc-title" className="m-0 text-lg font-bold text-[#0369a1]">
        孩子幾歲？算算每款一天要吃幾顆、一個月多少錢
      </h3>
      <p className="mt-2 mb-4 text-sm text-gray-600">
        依各家官網標示的建議量與定價計算（2026-10-22 核對），只算孩子年齡可以吃的款。
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="孩子年齡">
        {AGES.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAge(a)}
            aria-pressed={a === age}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              a === age ? 'border-[#0284c7] bg-[#0284c7] text-white' : 'border-[#e6e2da] bg-white text-gray-700 hover:border-[#0284c7]'
            }`}
          >
            {a} 歲
          </button>
        ))}
      </div>

      <p className="mt-4 mb-3 rounded-lg bg-[#f0f9ff] px-4 py-3 text-[15px] text-gray-800">
        <strong>{age} 歲</strong>每天建議 {unit}{' '}
        <strong>
          {target.low === target.high ? `${target.low}` : `${target.low}～${target.high}`} 毫克
        </strong>
        （{target.source}）。照官網用量吃得到的有 <strong>{okCount} 款</strong>。
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-[15px]">
          <thead>
            <tr className="bg-[#0284c7] text-left text-white">
              <th className="px-3 py-2 font-semibold whitespace-nowrap">產品</th>
              <th className="px-3 py-2 font-semibold whitespace-nowrap">每天吃</th>
              <th className="px-3 py-2 font-semibold whitespace-nowrap">一天補到</th>
              <th className="px-3 py-2 font-semibold whitespace-nowrap">一個月約</th>
              <th className="px-3 py-2 font-semibold whitespace-nowrap">怎麼吃</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const dim = r.status === 'age'
              return (
                <tr key={r.p.brand} className={`${i % 2 ? 'bg-white' : 'bg-[#F7F9FC]'} ${dim ? 'text-gray-400' : 'text-gray-800'}`}>
                  <td className="border-t border-[#e6e2da] px-3 py-2.5">
                    <a href={r.p.url} target="_blank" rel="noopener" className="font-semibold text-[#0369a1] hover:underline">
                      {r.p.brand}
                    </a>
                    <span className="block text-[13px] text-gray-500">{r.p.name}</span>
                    <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${BADGE[r.status].cls}`}>
                      {r.status === 'age' && r.p.minAge != null ? `${r.p.minAge} 歲以上` : BADGE[r.status].text}
                    </span>
                  </td>
                  <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">{dim ? '—' : `${r.perDay} 顆`}</td>
                  <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">
                    {dim ? '—' : r.intake == null ? '官網未標示' : `${r.intake} 毫克`}
                  </td>
                  <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">
                    {dim ? '—' : `NT$${r.monthly.toLocaleString('en-US')}`}
                  </td>
                  <td className="border-t border-[#e6e2da] px-3 py-2.5 text-[14px]">{dim ? '—' : r.p.howTo(age)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 mb-0 text-[13px] leading-relaxed text-gray-500">
        每天顆數照官網建議量，建議量是範圍的取剛好達標的顆數；一個月以 30 天、定價計算。官網沒標 EPA 的只算 DHA。
        2 歲以下、正在吃抗凝血藥物或對魚、大豆、花生過敏的孩子，吃之前先問醫師。
      </p>
    </section>
  )
}
