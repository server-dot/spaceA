'use client'

import { useState, type ReactNode } from 'react'
import { sendGAEvent } from '@next/third-parties/google'
import { KIDS_FISH_OIL, FAO_WHO_URL, dailyTarget, type FishOilProduct } from '@/data/kids-fish-oil'

/**
 * 兒童魚油挑選表單：年齡 → 怎麼吃 → 飲食限制，答完列出符合的款、每天幾顆、一個月多少錢，
 * 不符合的收在下面並寫原因。嵌在 post 1410 前言後的 <div data-spacea-tool="kids-fish-oil"></div>
 * （ArticleBody 負責切開）。伺服器端先用預設答案算好，爬蟲看得到內容；客戶端改答案才重算。
 */

const AGES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

type Way = 'chew' | 'swallow' | 'mix'
const WAYS: { key: Way; label: string }[] = [
  { key: 'chew', label: '會咬著吃' },
  { key: 'swallow', label: '會整顆吞膠囊' },
  { key: 'mix', label: '都還不會，要拌進食物' },
]

type Limit = 'soy' | 'peanut' | 'pork' | 'beef'
const LIMITS: { key: Limit; label: string }[] = [
  { key: 'soy', label: '對大豆過敏' },
  { key: 'peanut', label: '對花生過敏' },
  { key: 'pork', label: '不吃豬' },
  { key: 'beef', label: '不吃牛' },
]

type Status = 'ok' | 'short' | 'nodata'

interface Match {
  p: FishOilProduct
  status: Status
  perDay: number
  intake: number | null
  monthly: number
}

function excludeReason(p: FishOilProduct, age: number, way: Way, limits: Limit[]): string | null {
  if (p.minAge != null && age < p.minAge) return `${p.minAge} 歲以上才能吃`
  if (way === 'chew' && !p.chew) return '要整顆吞，不能咬'
  if (way === 'swallow' && !p.swallow) return '要咬破咀嚼，不能整顆吞'
  if (way === 'mix' && !p.mix) return '官網沒有寫可以剪開拌食物'
  if (limits.includes('soy') && p.allergens.includes('soy')) return '含大豆'
  if (limits.includes('peanut') && p.allergens.includes('peanut')) return '含花生'
  if (limits.includes('pork') && p.gelatin === 'pork') return '膠囊是豬明膠'
  if (limits.includes('beef') && p.gelatin === 'beef') return '膠囊是牛明膠'
  return null
}

function match(p: FishOilProduct, age: number): Match {
  const target = dailyTarget(age)
  const [lo, hi] = p.perDay(age)
  // 官網沒標 EPA 的只算 DHA
  const per = p.dha == null ? null : p.dha + (p.epa ?? 0)
  let status: Status = 'ok'
  let n = lo
  if (per == null) status = 'nodata'
  else {
    const enough = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).find((k) => k * per >= target.low)
    if (enough == null) { n = hi; status = 'short' } else n = enough
  }
  return { p, status, perDay: n, intake: per == null ? null : Math.round(per * n), monthly: Math.round((p.price / p.count) * n * 30) }
}

const BADGE: Record<Status, { text: string; cls: string }> = {
  ok: { text: '達建議量', cls: 'bg-emerald-50 text-emerald-700' },
  short: { text: '吃到上限也不夠', cls: 'bg-amber-50 text-amber-700' },
  nodata: { text: '官網未標示 DHA', cls: 'bg-gray-100 text-gray-600' },
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 text-[15px] font-bold text-gray-900">
        {title}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}

function Chip({ on, onClick, children, role = 'radio' }: { on: boolean; onClick: () => void; children: ReactNode; role?: 'radio' | 'checkbox' }) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={on}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        on ? 'border-[#0284c7] bg-[#0284c7] text-white' : 'border-[#e6e2da] bg-white text-gray-700 hover:border-[#0284c7]'
      }`}
    >
      {children}
    </button>
  )
}

// GA4 事件：kfo_answer = 改了哪一題、選什麼；kfo_product_click = 點了結果裡哪一款、排第幾
function track(name: string, params: Record<string, string | number>) {
  try {
    sendGAEvent('event', name, params)
  } catch {
    // 沒載入 GA（本機、擋廣告）就略過
  }
}

export default function KidsFishOilCalculator() {
  const [age, setAge] = useState(6)
  const [way, setWay] = useState<Way>('chew')
  const [limits, setLimits] = useState<Limit[]>([])
  const toggle = (k: Limit) => {
    track('kfo_answer', { question: 'limit', value: k })
    setLimits((xs) => (xs.includes(k) ? xs.filter((x) => x !== k) : [...xs, k]))
  }

  const target = dailyTarget(age)
  const order: Record<Status, number> = { ok: 0, short: 1, nodata: 2 }
  const fits: Match[] = []
  const out: { p: FishOilProduct; why: string }[] = []
  for (const p of KIDS_FISH_OIL) {
    const why = excludeReason(p, age, way, limits)
    if (why) out.push({ p, why })
    else fits.push(match(p, age))
  }
  fits.sort((a, b) => order[a.status] - order[b.status] || a.monthly - b.monthly)

  return (
    <section className="not-prose my-8 rounded-2xl border border-[#bae6fd] bg-[#f8fcff] p-5 sm:p-6" aria-labelledby="kfo-form-title">
      <h2 id="kfo-form-title" className="m-0 text-xl font-bold text-[#0369a1]">
        孩子能吃哪幾款？
      </h2>
      <div className="mb-5" />

      <div className="space-y-5">
        <Step title="孩子幾歲？">
          {AGES.map((a) => (
            <Chip key={a} on={a === age} onClick={() => { track('kfo_answer', { question: 'age', value: a }); setAge(a) }}>{a} 歲</Chip>
          ))}
        </Step>
        <Step title="孩子怎麼吃膠囊？">
          {WAYS.map((w) => (
            <Chip key={w.key} on={w.key === way} onClick={() => { track('kfo_answer', { question: 'way', value: w.key }); setWay(w.key) }}>{w.label}</Chip>
          ))}
        </Step>
        <Step title="有沒有飲食限制？">
          {LIMITS.map((l) => (
            <Chip key={l.key} role="checkbox" on={limits.includes(l.key)} onClick={() => toggle(l.key)}>{l.label}</Chip>
          ))}
        </Step>
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-[#e6e2da]">
        <p className="m-0 text-[15px] leading-relaxed text-gray-800">
          {age} 歲一天要{' '}
          <strong>{target.low === target.high ? target.low : `${target.low}～${target.high}`} 毫克</strong> EPA＋DHA
          （<a href={FAO_WHO_URL} target="_blank" rel="noopener" className="text-[#0369a1] underline">FAO／WHO 建議</a>），這 10 款裡有{' '}
          <strong>{fits.length} 款</strong>適合。
        </p>

        {fits.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-[15px]">
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
                {fits.map((m, i) => (
                  <tr key={m.p.brand} className={i % 2 ? 'bg-white' : 'bg-[#F7F9FC]'}>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5">
                      <a href={m.p.url} target="_blank" rel="noopener" onClick={() => track('kfo_product_click', { brand: m.p.brand, position: i + 1, age, way })} className="font-semibold text-[#0369a1] hover:underline">{m.p.brand}</a>
                      <span className="block text-[13px] text-gray-500">{m.p.name}</span>
                      <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${BADGE[m.status].cls}`}>{BADGE[m.status].text}</span>
                    </td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">{m.perDay} 顆</td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">{m.intake == null ? '官網未標示' : `${m.intake} 毫克`}</td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">NT${m.monthly.toLocaleString('en-US')}</td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5 text-[14px]">{m.p.howTo(age)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 mb-0 text-[15px] text-gray-700">這 10 款都不符合這組條件，可以先問小兒科醫師或藥師，或改看藻油產品。</p>
        )}

        {out.length > 0 && (
          <details className="mt-4 text-[14px] text-gray-600">
            <summary className="cursor-pointer font-medium text-gray-700">不符合條件的 {out.length} 款</summary>
            <ul className="mt-2 mb-0 list-disc pl-5">
              {out.map((o) => (
                <li key={o.p.brand}>{o.p.brand} {o.p.name}：{o.why}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <p className="mt-3 mb-0 text-[13px] leading-relaxed text-gray-500">
        顆數照官網建議量，月花費以定價、30 天計算。正在吃抗凝血藥物的孩子先問醫師。
      </p>
    </section>
  )
}
