'use client'

import { useState, type ReactNode } from 'react'
import { sendGAEvent } from '@next/third-parties/google'
import { FLOOR_CLEANERS, type FloorCleaner, type Need, type Pet, type Scent } from '@/data/pet-floor-cleaners'
import type { Lang } from '@/lib/i18n'

/**
 * 寵物地板清潔劑選擇器：養貓或養狗 → 要不要香味 → 最想解決什麼，答完排出適合的款、一瓶可以拖幾次，
 * 不符合的收在下面並寫原因。嵌在 post 1676 的 <div data-spacea-tool="pet-floor-cleaner"></div>，目前只有中文。
 */

const PETS: Record<Pet, string> = { cat: '貓', dog: '狗', both: '貓狗都有' }
const SCENTS: Record<Scent, string> = { none: '不要香味', ok: '有淡淡香味沒關係' }
const NEEDS: Record<Need, string> = { urine: '尿騷味', food: '口水和飼料油漬', often: '常拖地，想用久一點' }

function track(name: string, params: Record<string, string | number>) {
  try {
    sendGAEvent('event', name, params)
  } catch {
    // 沒載入 GA（本機、擋廣告）就略過
  }
}

/** 名稱點了跳到文章裡那張卡（用卡片的官方連結認），找不到卡片才開官方頁 */
function jumpToCard(url: string) {
  const link = [...document.querySelectorAll<HTMLAnchorElement>('.brand-card .ref-link a')].find((a) => a.href === url)
  const card = link?.closest('.brand-card')
  if (!card) {
    window.open(url, '_blank', 'noopener')
    return
  }
  window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 88, behavior: 'smooth' })
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 text-[15px] font-bold text-gray-900">{title}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={title}>{children}</div>
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

export default function PetFloorCleanerPicker({ lang = 'zh' }: { lang?: Lang }) {
  const [pet, setPet] = useState<Pet>('both')
  const [scent, setScent] = useState<Scent>('ok')
  const [need, setNeed] = useState<Need>('urine')
  const answer = (question: string, value: string) => track('floor_answer', { question, value, lang })

  const hasCat = pet !== 'dog'
  const out: { p: FloorCleaner; why: string }[] = []
  const fits: { p: FloorCleaner; score: number }[] = []
  for (const p of FLOOR_CLEANERS) {
    if (hasCat && p.dogOnly) out.push({ p, why: '標示狗家庭適用' })
    else if (scent === 'none' && p.scent) out.push({ p, why: `有${p.scent}` })
    else fits.push({ p, score: (p.need[need]?.score ?? 0) - (hasCat ? ((p.catPenalty ?? 0) >= 2 ? 3 : (p.catPenalty ?? 0)) : 0) })
  }
  fits.sort((a, b) => b.score - a.score)

  const renderItem = ({ p, score }: { p: FloorCleaner; score: number }, i: number) => {
    // 養貓時含精油的款、分數 0 以下的款不標「最適合」
    const top = i < 3 && fits.length > 3 && score > 0 && !(hasCat && (p.catPenalty ?? 0) >= 2)
    return (
      <li key={p.id} className={`rounded-lg border p-3.5 ${top ? 'border-[#7dd3fc] bg-[#f0f9ff]' : 'border-[#e6e2da] bg-white'}`}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-bold text-gray-400">{i + 1}</span>
          <button
            type="button"
            onClick={() => {
              track('floor_product_click', { brand: p.id, position: i + 1, pet, scent, need, lang })
              jumpToCard(p.url)
            }}
            className="text-left text-[16px] font-bold text-[#0369a1] hover:underline"
          >
            {p.name}
          </button>
          {top && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">最適合</span>}
        </div>
        <p className="m-0 mt-1.5 text-[14px] text-gray-600">
          {p.price}・{p.dilution}{p.uses && <>・一瓶約拖 <strong className="text-gray-900">{p.uses} 次</strong></>}
        </p>
        <p className="m-0 mt-1 text-[15px] leading-relaxed text-gray-800">{p.need[need]?.why ?? p.base}</p>
        {hasCat && p.catNote && <p className="m-0 mt-1 text-[14px] leading-relaxed text-amber-700">養貓留意：{p.catNote}</p>}
      </li>
    )
  }

  return (
    <section className="not-prose my-8 rounded-2xl border border-[#bae6fd] bg-[#f8fcff] p-5 sm:p-6" aria-labelledby="floor-form-title">
      <h2 id="floor-form-title" className="m-0 mb-5 text-xl font-bold text-[#0369a1]">
        哪一款寵物地板清潔劑適合你家？
      </h2>

      <div className="space-y-5">
        <Step title="家裡養什麼？">
          {(Object.keys(PETS) as Pet[]).map((k) => (
            <Chip key={k} on={k === pet} onClick={() => { answer('pet', k); setPet(k) }}>{PETS[k]}</Chip>
          ))}
        </Step>
        <Step title="拖完要有香味嗎？">
          {(Object.keys(SCENTS) as Scent[]).map((k) => (
            <Chip key={k} on={k === scent} onClick={() => { answer('scent', k); setScent(k) }}>{SCENTS[k]}</Chip>
          ))}
        </Step>
        <Step title="最想解決什麼？">
          {(Object.keys(NEEDS) as Need[]).map((k) => (
            <Chip key={k} on={k === need} onClick={() => { answer('need', k); setNeed(k) }}>{NEEDS[k]}</Chip>
          ))}
        </Step>
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-[#e6e2da]" aria-live="polite">
        <p className="m-0 text-[15px] leading-relaxed text-gray-800">
          照你的答案，這 10 款裡有 <strong>{fits.length} 款</strong>符合{fits.length > 3 ? '，標「最適合」的最符合你的情況' : ''}。
        </p>
        <ol className="m-0 mt-4 list-none space-y-3 p-0">{fits.slice(0, 3).map(renderItem)}</ol>

        {fits.length > 3 && (
          <details className="mt-4 text-[14px] text-gray-600">
            <summary className="cursor-pointer font-medium text-gray-700">看其他符合的 {fits.length - 3} 款</summary>
            <ol className="m-0 mt-3 list-none space-y-3 p-0">{fits.slice(3).map((f, i) => renderItem(f, i + 3))}</ol>
          </details>
        )}

        {out.length > 0 && (
          <details className="mt-4 text-[14px] text-gray-600">
            <summary className="cursor-pointer font-medium text-gray-700">不符合條件的 {out.length} 款</summary>
            <ul className="mt-2 mb-0 list-disc pl-5">
              {out.map(({ p, why }) => <li key={p.id}>{p.name}：{why}</li>)}
            </ul>
          </details>
        )}
      </div>

      <p className="mt-3 mb-0 text-[13px] leading-relaxed text-gray-500">
        次數以一桶 10 公升水計算；婦政司用瓶蓋計量、沒有標毫升，不列次數。寵物有疾病、懷孕或皮膚過敏，使用前請詢問獸醫。
      </p>
    </section>
  )
}
