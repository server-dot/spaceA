'use client'

import { useState, type ReactNode } from 'react'
import { sendGAEvent } from '@next/third-parties/google'
import { LUTEIN, LUTEIN_LIMIT_URL, ESTER_FACTOR, DAILY_LIMIT, type LuteinForm, type LuteinProduct } from '@/data/lutein'
import type { Lang } from '@/lib/i18n'

/**
 * 葉黃素換算器：瓶身寫的毫克數有游離型、酯化型兩種算法，不能直接比。
 * 上半輸入自己那瓶的標示換算成游離型，下半把文章比的 10 款都換成同一個單位排好。
 * 嵌在 post 1471「挑葉黃素要看型態、劑量與配方」章的 <div data-spacea-tool="lutein"></div>。
 * 伺服器端先用預設值算好，爬蟲看得到內容；客戶端改數字才重算。
 * 譯文還沒做，英日韓先沿用中文字串，定案翻譯時再補。
 */

type Form = 'free' | 'ester' | 'unknown'

const FORMS: Form[] = ['free', 'ester', 'unknown']

const ZH = {
  title: '你那瓶到底吃到多少葉黃素？',
  qMg: '瓶身寫每顆（每份）幾毫克？',
  qForm: '標示的型態',
  forms: { free: '游離型', ester: '酯化型', unknown: '沒寫' } as Record<Form, string>,
  qPerDay: '一天吃幾顆（份）？',
  result: (mg: string): ReactNode => <>換算成游離型，一天大約吃到 <strong>{mg} 毫克</strong>葉黃素。</>,
  resultUnknown: (lo: string, hi: string): ReactNode => (
    <>標示沒寫型態，一天大約落在 <strong>{lo}～{hi} 毫克</strong>之間（寫的是游離型就是 {hi}，是酯化型就是 {lo}）。可以看成分表寫的是「葉黃素」還是「葉黃素酯」。</>
  ),
  ok: (limit: ReactNode) => <>在{limit}之內。</>,
  over: (limit: ReactNode) => <>已經超過{limit}，每天的量要減少。</>,
  overIfFree: (limit: ReactNode) => <>如果寫的是游離型，就超過了{limit}，先確認型態再決定一天吃幾顆。</>,
  limitLabel: `衛福部每日 ${DAILY_LIMIT} 毫克的上限`,
  listTitle: '文章比的 10 款，換成同一個單位',
  head: ['產品', '標示', '一天吃', '換算成游離型'],
  perUnit: (mg: number, unit: string) => `${mg} 毫克／${unit}`,
  perDay: (n: number, unit: string) => `${n} ${unit}`,
  mg: (n: number) => `${n} 毫克`,
  noData: '官網未標示',
  formTag: { free: '游離型', ester: '酯化型', none: '未寫型態' } as Record<LuteinForm, string>,
  officialLutein: (mg: number) => `酯化型，官網換算含葉黃素 ${mg} 毫克`,
  foot: `酯化型乘 ${ESTER_FACTOR} 換回游離型，依葉黃素與二棕櫚酸酯的分子量比計算（568.9 ÷ 1045.7）；官網自己換算過的照官網數字。每日量照官網建議，官網沒寫的不換算。`,
}

const S: Record<Lang, typeof ZH> = { zh: ZH, en: ZH, ja: ZH, ko: ZH }

const round1 = (n: number) => Math.round(n * 10) / 10
const fmt = (n: number) => round1(n).toLocaleString('en-US')

/** 每天換算成游離型的毫克數；酯化型官網自己有換算就用官網的，未寫型態照標示算 */
function dailyFree(p: LuteinProduct) {
  if (p.mg == null || p.perDay == null) return null
  const per = p.luteinMg ?? p.mg * (p.form === 'ester' ? ESTER_FACTOR : 1)
  return round1(per * p.perDay)
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 text-[15px] font-bold text-gray-900">{title}</legend>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
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

// GA4 事件：lut_input = 改了哪一欄、改成什麼；lut_product_click = 點了清單裡哪一款、排第幾
function track(name: string, params: Record<string, string | number>) {
  try {
    sendGAEvent('event', name, params)
  } catch {
    // 沒載入 GA（本機、擋廣告）就略過
  }
}

export default function LuteinConverter({ lang = 'zh' }: { lang?: Lang }) {
  const t = S[lang]
  const [mg, setMg] = useState('20')
  const [form, setForm] = useState<Form>('ester')
  const [perDay, setPerDay] = useState(1)

  const n = Math.max(0, Number(mg) || 0)
  const free = n * perDay
  const ester = n * perDay * ESTER_FACTOR
  const shown = form === 'free' ? free : form === 'ester' ? ester : free
  const limit = (
    <a href={LUTEIN_LIMIT_URL} target="_blank" rel="noopener" className="text-[#0369a1] underline">
      {t.limitLabel}
    </a>
  )

  const rows = LUTEIN.map((p) => ({ p, daily: dailyFree(p) })).sort((a, b) => (b.daily ?? -1) - (a.daily ?? -1))

  return (
    <section className="not-prose my-8 rounded-2xl border border-[#bae6fd] bg-[#f8fcff] p-5 sm:p-6" aria-labelledby="lut-title">
      <h2 id="lut-title" className="m-0 mb-5 text-xl font-bold text-[#0369a1]">
        {t.title}
      </h2>

      <div className="space-y-5">
        <Step title={t.qMg}>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={mg}
            onChange={(e) => setMg(e.target.value)}
            onBlur={() => track('lut_input', { field: 'mg', value: n, lang })}
            className="w-28 rounded-lg border border-[#e6e2da] bg-white px-3 py-1.5 text-[15px] focus:border-[#0284c7] focus:outline-none"
            aria-label={t.qMg}
          />
          <span className="text-[15px] text-gray-700">毫克</span>
        </Step>
        <Step title={t.qForm}>
          {FORMS.map((f) => (
            <Chip key={f} on={f === form} onClick={() => { track('lut_input', { field: 'form', value: f, lang }); setForm(f) }}>{t.forms[f]}</Chip>
          ))}
        </Step>
        <Step title={t.qPerDay}>
          {[1, 2, 3].map((k) => (
            <Chip key={k} on={k === perDay} onClick={() => { track('lut_input', { field: 'perDay', value: k, lang }); setPerDay(k) }}>{k}</Chip>
          ))}
        </Step>
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-[#e6e2da]">
        <p className="m-0 text-[15px] leading-relaxed text-gray-800">
          {form === 'unknown' ? t.resultUnknown(fmt(ester), fmt(free)) : t.result(fmt(shown))}{' '}
          {form === 'unknown'
            ? ester > DAILY_LIMIT ? t.over(limit) : free > DAILY_LIMIT ? t.overIfFree(limit) : t.ok(limit)
            : shown > DAILY_LIMIT ? t.over(limit) : t.ok(limit)}
        </p>

        <h3 className="mt-5 mb-2 text-[16px] font-bold text-gray-900">{t.listTitle}</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[15px]">
            <thead>
              <tr className="bg-[#0284c7] text-left text-white">
                {t.head.map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ p, daily }, i) => (
                <tr key={p.brand} className={i % 2 ? 'bg-white' : 'bg-[#F7F9FC]'}>
                  <td className="border-t border-[#e6e2da] px-3 py-2.5">
                    <a href={p.url} target="_blank" rel="noopener" onClick={() => track('lut_product_click', { brand: p.brand, position: i + 1, lang })} className="font-semibold text-[#0369a1] hover:underline">
                      {p.brand}
                    </a>
                    <span className="block text-[13px] text-gray-500">{p.name}</span>
                  </td>
                  <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">
                    {p.mg == null ? t.noData : t.perUnit(p.mg, p.unit)}
                    <span className="block text-[13px] text-gray-500">{p.luteinMg != null ? t.officialLutein(p.luteinMg) : t.formTag[p.form]}</span>
                  </td>
                  <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">{p.perDay == null ? t.noData : t.perDay(p.perDay, p.unit)}</td>
                  <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap font-semibold">{daily == null ? t.noData : t.mg(daily)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 mb-0 text-[13px] leading-relaxed text-gray-500">{t.foot}</p>
    </section>
  )
}
