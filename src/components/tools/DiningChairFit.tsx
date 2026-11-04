'use client'

import { useState, type ReactNode } from 'react'
import { sendGAEvent } from '@next/third-parties/google'
import {
  BODY_FORMULA,
  BODY_FORMULA_SOURCE,
  BODY_GAP_SPREAD,
  DINING_CHAIRS,
  HEIGHT_GAP,
  HEIGHT_GAP_SOURCE,
  type DiningChair,
} from '@/data/dining-chairs'
import type { Lang } from '@/lib/i18n'

/**
 * 餐椅座高篩選：輸入自家餐桌高度 → 算出桌面減座面 27～30 公分的座高區間 → 列出 post 1591 九款裡合適的，
 * 不合適的收在下面並寫原因；選填身高時高差改用 SIDIZ 公式（身高×0.183−1）±1.5。嵌在 post 1591 前言後的 <div data-spacea-tool="dining-chair"></div>。
 * 伺服器端先用預設 74 公分算好，爬蟲看得到內容；客戶端改桌高才重算。
 * 這篇目前只有中文，其他語言先顯示中文。
 */

// 台灣餐桌多在 72～75；兩頭補日式矮桌（68～70）與歐美進口桌（76～78）
const PRESETS = [68, 70, 72, 74, 76, 78]
const DEFAULT_TABLE = 74
const fmt = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(1))

type Gap = { min: number; max: number }

type Fit =
  | { c: DiningChair; kind: 'fit'; seats: { h: number; label?: string }[]; gap: number }
  | { c: DiningChair; kind: 'low' | 'high'; seat: number; gap: number }
  | { c: DiningChair; kind: 'nodata' }

function judge(c: DiningChair, table: number, G: Gap): Fit {
  if (c.seats.length === 0) return { c, kind: 'nodata' }
  const ok = c.seats.filter((s) => table - s.h >= G.min && table - s.h <= G.max)
  if (ok.length) {
    const mid = (G.min + G.max) / 2
    const best = Math.min(...ok.map((s) => Math.abs(table - s.h - mid)))
    return { c, kind: 'fit', seats: ok, gap: best }
  }
  // 最接近區間的那個座高
  const nearest = [...c.seats].sort((a, b) => dist(table - a.h, G) - dist(table - b.h, G))[0]
  const gap = table - nearest.h
  return { c, kind: gap > G.max ? 'low' : 'high', seat: nearest.h, gap }
}

function dist(gap: number, G: Gap) {
  if (gap < G.min) return G.min - gap
  if (gap > G.max) return gap - G.max
  return 0
}

/** 有情門這種多座高：同一種座面的座高併成一組（「木座 45／42.5 公分、布座／皮座 43 公分」） */
function seatText(seats: { h: number; label?: string }[]) {
  const groups = new Map<string, number[]>()
  for (const s of seats) groups.set(s.label ?? '', [...(groups.get(s.label ?? '') ?? []), s.h])
  return [...groups].map(([label, hs]) => `${label ? label + ' ' : ''}${hs.map(fmt).join('／')} 公分`).join('、')
}

function gapText(gaps: number[]) {
  const lo = Math.min(...gaps)
  const hi = Math.max(...gaps)
  return lo === hi ? fmt(lo) : `${fmt(lo)}～${fmt(hi)}`
}

// GA4 事件：dcf_input = 桌高改成多少；dcf_body = 填了身高；dcf_product_click = 點了合適清單裡哪一款、排第幾
function track(name: string, params: Record<string, string | number>) {
  try {
    sendGAEvent('event', name, params)
  } catch {
    // 沒載入 GA（本機、擋廣告）就略過
  }
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        on ? 'border-[#0284c7] bg-[#0284c7] text-white' : 'border-[#e6e2da] bg-white text-gray-700 hover:border-[#0284c7]'
      }`}
    >
      {children}
    </button>
  )
}

export default function DiningChairFit({ lang = 'zh' }: { lang?: Lang }) {
  const [raw, setRaw] = useState(String(DEFAULT_TABLE))
  const n = Number(raw)
  const valid = Number.isFinite(n) && n >= 60 && n <= 90
  const table = valid ? n : DEFAULT_TABLE
  const [rawH, setRawH] = useState('')
  const bh = Number(rawH)
  const hasBody = rawH.trim() !== '' && Number.isFinite(bh) && bh >= 130 && bh <= 200
  const badBody = rawH.trim() !== '' && !hasBody
  const idealSeat = hasBody ? BODY_FORMULA.seat(bh) : null
  const idealGap = hasBody ? BODY_FORMULA.gap(bh) : null
  const G: Gap = idealGap != null ? { min: idealGap - BODY_GAP_SPREAD, max: idealGap + BODY_GAP_SPREAD } : HEIGHT_GAP
  const lo = table - G.max
  const hi = table - G.min

  const all = DINING_CHAIRS.map((c) => judge(c, table, G))
  const fits = all
    .filter((f): f is Extract<Fit, { kind: 'fit' }> => f.kind === 'fit')
    .sort((a, b) => a.gap - b.gap || (a.c.price ?? Infinity) - (b.c.price ?? Infinity))
  const out = all.filter((f) => f.kind !== 'fit')

  const pick = (v: number) => {
    track('dcf_input', { value: v, via: 'preset', lang })
    setRaw(String(v))
  }

  return (
    <section className="not-prose my-8 rounded-2xl border border-[#bae6fd] bg-[#f8fcff] p-5 sm:p-6" aria-labelledby="dcf-title">
      <h2 id="dcf-title" className="m-0 mb-5 text-xl font-bold text-[#0369a1]">
        餐椅座高計算器
      </h2>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 text-[15px] font-bold text-gray-900">餐桌桌面離地幾公分？</legend>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((v) => (
            <Chip key={v} on={valid && n === v} onClick={() => pick(v)}>{v}</Chip>
          ))}
          <input
            type="number"
            inputMode="decimal"
            min={60}
            max={90}
            step={0.5}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onBlur={() => valid && track('dcf_input', { value: n, via: 'typed', lang })}
            className="w-24 rounded-lg border border-[#e6e2da] bg-white px-3 py-1.5 text-[15px] focus:border-[#0284c7] focus:outline-none"
            aria-label="餐桌高度（公分）"
          />
          <span className="text-[15px] text-gray-700">公分</span>
        </div>
        {!valid && <p className="mt-2 mb-0 text-[14px] text-amber-700">請填 60 到 90 之間的數字，先用 {DEFAULT_TABLE} 公分計算。</p>}
      </fieldset>

      <fieldset className="m-0 mt-5 border-0 p-0">
        <legend className="mb-2 text-[15px] font-bold text-gray-900">
          你的身高幾公分？<span className="ml-1 font-normal text-gray-500">（選填）</span>
        </legend>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            min={130}
            max={200}
            step={1}
            value={rawH}
            placeholder="例如 165"
            onChange={(e) => setRawH(e.target.value)}
            onBlur={() => hasBody && track('dcf_body', { value: bh, table, lang })}
            className="w-28 rounded-lg border border-[#e6e2da] bg-white px-3 py-1.5 text-[15px] focus:border-[#0284c7] focus:outline-none"
            aria-label="身高（公分）"
          />
          <span className="text-[15px] text-gray-700">公分</span>
        </div>
        {badBody && <p className="mt-2 mb-0 text-[14px] text-amber-700">請填 130 到 200 之間的數字，先不算身高。</p>}
      </fieldset>

      <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-[#e6e2da]">
        {idealSeat != null && idealGap != null ? (
          <>
            <p className="m-0 text-[15px] leading-relaxed text-gray-800">
              身高 {fmt(bh)} 公分，公式建議座高約 {fmt(idealSeat)} 公分、桌椅高差約 {fmt(idealGap)} 公分。
              配 {fmt(table)} 公分的桌子，座高抓 <strong>{fmt(lo)} 到 {fmt(hi)} 公分</strong>，這篇 9 款裡有 <strong>{fits.length} 款</strong>對得上。
            </p>
            {table - idealGap - idealSeat > 2 && (
              <p className="mt-2 mb-0 text-[14px] leading-relaxed text-amber-800">
                這張桌子對你來說偏高，椅子配著桌高選，<strong>座面會比建議高約 {fmt(table - idealGap - idealSeat)} 公分，腳可能踩不穩地</strong>，可以在桌下放腳踏。
              </p>
            )}
            {idealSeat - (table - idealGap) > 2 && (
              <p className="mt-2 mb-0 text-[14px] leading-relaxed text-amber-800">
                這張桌子對你來說偏低，椅子配著桌高選，<strong>座面會比建議低約 {fmt(idealSeat - (table - idealGap))} 公分，膝蓋彎得比較多</strong>，坐久腿會悶。
              </p>
            )}
          </>
        ) : (
          <p className="m-0 text-[15px] leading-relaxed text-gray-800">
            桌高 {fmt(table)} 公分，座高抓 <strong>{fmt(lo)} 到 {fmt(hi)} 公分</strong>（桌面減座面 {HEIGHT_GAP.min} 到 {HEIGHT_GAP.max} 公分），
            這篇 9 款裡有 <strong>{fits.length} 款</strong>對得上。
          </p>
        )}

        {fits.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[15px]">
              <thead>
                <tr className="bg-[#0284c7] text-left text-white">
                  {['款式', '合適的座高', '桌椅高差', '定價'].map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fits.map((f, i) => (
                  <tr key={f.c.brand} className={i % 2 ? 'bg-white' : 'bg-[#F7F9FC]'}>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5">
                      <a
                        href={f.c.url}
                        target="_blank"
                        rel="noopener"
                        onClick={() => track('dcf_product_click', { brand: f.c.brand, position: i + 1, table, lang })}
                        className="font-semibold text-[#0369a1] hover:underline"
                      >
                        {f.c.brand}
                      </a>
                      <span className="block text-[13px] text-gray-500">{f.c.name}</span>
                    </td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5">
                      {seatText(f.seats)}
                      {f.c.tolerance && <span className="block text-[13px] text-gray-500">官網註明誤差約 ±{f.c.tolerance} 公分</span>}
                    </td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">
                      {gapText(f.seats.map((s) => table - s.h))} 公分
                    </td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5 text-[14px]">{f.c.priceText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 mb-0 text-[15px] text-gray-700">這 9 款都對不上這個桌高，可以考慮有幾種座高可選的款式，或請店家依桌高訂製。</p>
        )}

        {out.length > 0 && (
          <details className="mt-4 text-[14px] text-gray-600">
            <summary className="cursor-pointer font-medium text-gray-700">對不上或沒寫座高的 {out.length} 款</summary>
            <ul className="mt-2 mb-0 list-disc pl-5">
              {out.map((f) => (
                <li key={f.c.brand}>
                  {f.c.brand} {f.c.name}：
                  {f.kind === 'nodata'
                    ? '官網沒有標示座高，下單前要先問'
                    : f.kind === 'low'
                      ? `座高 ${fmt(f.seat)} 公分，桌面比座面高 ${fmt(f.gap)} 公分，坐下去會覺得桌子偏高`
                      : `座高 ${fmt(f.seat)} 公分，桌面只比座面高 ${fmt(f.gap)} 公分，坐下去桌子會偏低，大腿容易碰到桌底`}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <p className="mt-3 mb-0 text-[13px] leading-relaxed text-gray-500">
        座高與定價取自各家官網（2026 年 11 月）；桌椅高差 {HEIGHT_GAP.min} 到 {HEIGHT_GAP.max} 公分參考
        <a href={HEIGHT_GAP_SOURCE} target="_blank" rel="noopener" className="text-[#0369a1] underline">木頭仁的台灣家具尺寸整理</a>；
        填身高時改用座高＝身高×0.25−1、高差＝身高×0.183−1，上下抓 {BODY_GAP_SPREAD} 公分，公式取自
        <a href={BODY_FORMULA_SOURCE} target="_blank" rel="noopener" className="text-[#0369a1] underline">SIDIZ 桌椅高度公式</a>，原本用在書桌椅，餐桌拿來微調。
        加了坐墊要把墊子厚度算進座高。
      </p>
    </section>
  )
}
