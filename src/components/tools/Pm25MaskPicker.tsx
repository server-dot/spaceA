'use client'

import { useState, type ReactNode } from 'react'
import { sendGAEvent } from '@next/third-parties/google'
import { PM25_MASKS, monthlyCost, type MaskProduct, type Where, type Priority } from '@/data/pm25-masks'
import type { Lang } from '@/lib/i18n'

/**
 * PM2.5 口罩推薦表單：在哪戴 → 一週幾天 → 願不願意洗 → 最在意什麼，
 * 答完依分數排出適合的款（前 3 款標「最適合」）、每月約花多少、為什麼適合；被排除的收在下面並寫原因。
 * 嵌在 post 1640 的 <div data-spacea-tool="pm25-mask"></div>（ArticleBody 負責切開）。
 * 目前只有中文；譯文上線前其他語言先顯示中文。
 */

type Days = 2 | 4 | 7
type Wash = 'yes' | 'no'
type Out = 'washable'

const WHERE: Record<Where, string> = {
  moto: '騎機車',
  walk: '走路或搭車通勤',
  kitchen: '廚房炒菜',
  work: '工作場所有粉塵',
  alert: '只有空污日才戴',
}
const DAYS: Record<Days, string> = { 2: '1～2 天', 4: '3～5 天', 7: '幾乎每天' }
const WASH: Record<Wash, string> = { yes: '願意，可以每天洗', no: '不想洗，戴完就丟' }
const PRIORITY: Record<Priority, string> = {
  grade: '防護等級最高',
  cost: '每個月最省',
  breath: '吸氣不吃力',
  look: '外觀能搭衣服',
}

interface Ranked {
  p: MaskProduct
  score: number
  monthly: number
  reasons: string[]
}

function rank(p: MaskProduct, where: Where, days: Days, priority: Priority): Ranked {
  const reasons: string[] = []
  let score = p.grade === 'A' ? 2 : p.grade === 'B' ? 1 : 0
  const w = p.where[where]
  if (w) { score += w.score; reasons.push(w.why) }
  if (where === 'alert' && p.smallBox) { score += 1; reasons.push(`${p.smallBox}，不容易囤到過期`) }
  if (p.type === 'washable') {
    if (days === 7) { score += 1; reasons.push('天天戴，可水洗攤下來不比拋棄式貴') }
    if (where === 'alert') score -= 1
  }
  if (priority === 'grade' && p.grade === 'A') {
    score += 3 + (p.extraCert ? 1 : 0)
    if (p.extraCert) reasons.unshift(`另有${p.extraCert}認證`)
  }
  if (priority === 'breath' && p.breath) { score += p.breath.score; reasons.push(p.breath.why) }
  if (priority === 'look' && p.look) { score += p.look.score; reasons.push(p.look.why) }
  if (priority === 'grade' && p.grade == null) score -= 1
  if (reasons.length === 0) reasons.push(p.base)
  return { p, score, monthly: monthlyCost(p, days), reasons: [...new Set(reasons)] }
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 text-[15px] font-bold text-gray-900">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
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

// GA4 事件：pm25_answer = 改了哪一題、選什麼；pm25_product_click = 點了結果裡哪一款、排第幾
function track(name: string, params: Record<string, string | number>) {
  try {
    sendGAEvent('event', name, params)
  } catch {
    // 沒載入 GA（本機、擋廣告）就略過
  }
}

const OUT_WHY: Record<Out, string> = {
  washable: '要水洗重複使用',
}

export default function Pm25MaskPicker({ lang = 'zh' }: { lang?: Lang }) {
  const [where, setWhere] = useState<Where>('walk')
  const [days, setDays] = useState<Days>(4)
  const [wash, setWash] = useState<Wash>('yes')
  const [priority, setPriority] = useState<Priority>('grade')
  const answer = (q: string, v: string | number) => track('pm25_answer', { question: q, value: v, lang })

  const fits: Ranked[] = []
  const out: { p: MaskProduct; why: Out }[] = []
  for (const p of PM25_MASKS) {
    if (wash === 'no' && p.type === 'washable') out.push({ p, why: 'washable' })
    else fits.push(rank(p, where, days, priority))
  }
  // 「每個月最省」照花費排；其他照分數，同分再比花費
  fits.sort((a, b) => (priority === 'cost' ? a.monthly - b.monthly : b.score - a.score || a.monthly - b.monthly))

  return (
    <section className="not-prose my-8 rounded-2xl border border-[#bae6fd] bg-[#f8fcff] p-5 sm:p-6" aria-labelledby="pm25-form-title">
      <h2 id="pm25-form-title" className="m-0 mb-5 text-xl font-bold text-[#0369a1]">
        哪一款 PM2.5 口罩適合你？
      </h2>

      <div className="space-y-5">
        <Step title="主要在哪裡戴？">
          {(Object.keys(WHERE) as Where[]).map((k) => (
            <Chip key={k} on={k === where} onClick={() => { answer('where', k); setWhere(k) }}>{WHERE[k]}</Chip>
          ))}
        </Step>
        <Step title="一週戴幾天？">
          {([2, 4, 7] as Days[]).map((k) => (
            <Chip key={k} on={k === days} onClick={() => { answer('days', k); setDays(k) }}>{DAYS[k]}</Chip>
          ))}
        </Step>
        <Step title="願意洗口罩嗎？">
          {(Object.keys(WASH) as Wash[]).map((k) => (
            <Chip key={k} on={k === wash} onClick={() => { answer('wash', k); setWash(k) }}>{WASH[k]}</Chip>
          ))}
        </Step>
        <Step title="最在意什麼？">
          {(Object.keys(PRIORITY) as Priority[]).map((k) => (
            <Chip key={k} on={k === priority} onClick={() => { answer('priority', k); setPriority(k) }}>{PRIORITY[k]}</Chip>
          ))}
        </Step>
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-[#e6e2da]">
        <p className="m-0 text-[15px] leading-relaxed text-gray-800">
          照你的答案，這 6 款裡有 <strong>{fits.length} 款</strong>適合{fits.length > 3 ? '，標「最適合」的 3 款最符合你的情況' : ''}。
        </p>

        <ol className="m-0 mt-4 list-none space-y-3 p-0">
          {fits.map((m, i) => {
            const top = i < 3 && fits.length > 3
            return (
              <li key={m.p.brand} className={`rounded-lg border p-3.5 ${top ? 'border-[#7dd3fc] bg-[#f0f9ff]' : 'border-[#e6e2da] bg-white'}`}>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-bold text-gray-400">{i + 1}</span>
                  <a
                    href={m.p.url}
                    target="_blank"
                    rel="noopener"
                    onClick={() => track('pm25_product_click', { brand: m.p.brand, position: i + 1, where, days, wash, priority, lang })}
                    className="text-[16px] font-bold text-[#0369a1] hover:underline"
                  >
                    {m.p.brand} {m.p.name}
                  </a>
                  {top && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">最適合</span>}
                </div>
                <p className="m-0 mt-1.5 text-[14px] text-gray-600">
                  {m.p.grade ? `CNS 15980 ${m.p.grade} 級` : '未標等級'}・{m.p.wearLabel}・每月約 <strong className="text-gray-900">NT${m.monthly.toLocaleString('en-US')}</strong>
                </p>
                <p className="m-0 mt-1 text-[15px] leading-relaxed text-gray-800">{m.reasons.join('；')}</p>
              </li>
            )
          })}
        </ol>

        {out.length > 0 && (
          <details className="mt-4 text-[14px] text-gray-600">
            <summary className="cursor-pointer font-medium text-gray-700">不符合條件的 {out.length} 款</summary>
            <ul className="mt-2 mb-0 list-disc pl-5">
              {out.map((o) => (
                <li key={o.p.brand}>{o.p.brand} {o.p.name}：{OUT_WHY[o.why]}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <p className="mt-3 mb-0 text-[13px] leading-relaxed text-gray-500">
        每月花費以定價、一個月 4.3 週計算；藍鷹官網未標價，用 PChome 售價。可水洗款照官網建議的更換天數攤提：克微粒以 6 天計，Xpure 以可洗 200 次計。
      </p>
    </section>
  )
}
