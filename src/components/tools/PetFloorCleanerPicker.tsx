'use client'

import { useState, type ReactNode } from 'react'
import { sendGAEvent } from '@next/third-parties/google'
import { FLOOR_CLEANERS, type FloorCleaner, type Need, type Pet, type Scent } from '@/data/pet-floor-cleaners'
import type { Lang } from '@/lib/i18n'

/**
 * 寵物地板清潔劑選擇器：養貓或養狗 → 要不要香味 → 最想解決什麼，答完排出適合的款、一瓶可以拖幾次，
 * 不符合的收在下面並寫原因。嵌在 post 1676 的 <div data-spacea-tool="pet-floor-cleaner"></div>。四語；嵌在譯文同一個標記。
 */

interface Strings {
  title: string
  qPet: string
  pets: Record<Pet, string>
  qScent: string
  scents: Record<Scent, string>
  qNeed: string
  needs: Record<Need, string>
  summary: (n: number) => ReactNode
  top: string
  uses: (n: string) => ReactNode
  catNote: string
  more: (n: number) => string
  outTitle: (n: number) => string
  dogOnly: string
  hasScent: (s: string) => string
  colon: string
  foot: string
}

const S: Record<Lang, Strings> = {
  zh: {
    title: '哪一款寵物地板清潔劑適合你家？',
    qPet: '家裡養什麼？',
    pets: { cat: '貓', dog: '狗', both: '貓狗都有' },
    qScent: '拖完要有香味嗎？',
    scents: { none: '不要香味', ok: '有淡淡香味沒關係' },
    qNeed: '最想解決什麼？',
    needs: { urine: '尿騷味', food: '口水和飼料油漬', often: '常拖地，想用久一點' },
    summary: (n) => <>照你的答案，這 10 款裡有 <strong>{n} 款</strong>符合{n > 3 ? '，標「最適合」的最符合你的情況' : ''}。</>,
    top: '最適合',
    uses: (n) => <>一瓶約拖 <strong className="text-gray-900">{n} 次</strong></>,
    catNote: '養貓留意：',
    more: (n) => `看其他符合的 ${n} 款`,
    outTitle: (n) => `不符合條件的 ${n} 款`,
    dogOnly: '標示狗家庭適用',
    hasScent: (s) => `有${s}`,
    colon: '：',
    foot: '次數以一桶 10 公升水計算；婦政司用瓶蓋計量、沒有標毫升，不列次數。寵物有疾病、懷孕或皮膚過敏，使用前請詢問獸醫。',
  },
  en: {
    title: 'Which pet floor cleaner suits your home?',
    qPet: 'What pets do you have?',
    pets: { cat: 'Cat', dog: 'Dog', both: 'Both' },
    qScent: 'Do you want a scent after mopping?',
    scents: { none: 'No scent', ok: 'A light scent is fine' },
    qNeed: 'What do you most want to solve?',
    needs: { urine: 'Urine odor', food: 'Saliva and food grease', often: 'I mop often and want it to last' },
    summary: (n) => <>Based on your answers, <strong>{n} of these 10</strong> fit{n > 3 ? '; the ones marked “Best match” suit you most' : ''}.</>,
    top: 'Best match',
    uses: (n) => <>about <strong className="text-gray-900">{n} uses</strong> per bottle</>,
    catNote: 'Cat owners: ',
    more: (n) => `See ${n} more that fit`,
    outTitle: (n) => `${n} that don’t fit`,
    dogOnly: 'labeled for homes with dogs',
    hasScent: (s) => `has ${s}`,
    colon: ': ',
    foot: 'Uses are based on a 10-liter bucket. Fu Choice is measured by the cap without milliliters, so no count is given. If your pet is ill, pregnant or has a skin allergy, ask a vet before use.',
  },
  ja: {
    title: 'あなたの家に合うペット用床用洗剤は？',
    qPet: '何を飼っていますか？',
    pets: { cat: '猫', dog: '犬', both: '犬も猫も' },
    qScent: '拭いたあとに香りは必要ですか？',
    scents: { none: '香りはいらない', ok: 'ほのかな香りなら大丈夫' },
    qNeed: '一番解決したいことは？',
    needs: { urine: '尿臭', food: 'よだれやフードの油汚れ', often: 'よく拭くので長く使いたい' },
    summary: (n) => <>回答に合うのはこの 10 点のうち <strong>{n} 点</strong>です{n > 3 ? '。「最適」と付いたものが特に合っています' : ''}。</>,
    top: '最適',
    uses: (n) => <>1 本で約 <strong className="text-gray-900">{n} 回</strong></>,
    catNote: '猫がいる場合：',
    more: (n) => `条件に合うほかの ${n} 点を見る`,
    outTitle: (n) => `条件に合わない ${n} 点`,
    dogOnly: '犬のいる家庭向けの表示',
    hasScent: (s) => `${s}がある`,
    colon: '：',
    foot: '回数は水 10 リットルで計算。婦政司はキャップで量り ml の表示がないため回数は載せていません。病気、妊娠中、皮膚アレルギーのあるペットは、使う前に獣医師に相談してください。',
  },
  ko: {
    title: '우리 집에 맞는 반려동물 바닥 세정제는?',
    qPet: '무엇을 키우나요?',
    pets: { cat: '고양이', dog: '개', both: '둘 다' },
    qScent: '닦은 뒤 향이 나도 되나요?',
    scents: { none: '향은 싫어요', ok: '은은한 향은 괜찮아요' },
    qNeed: '가장 해결하고 싶은 것은?',
    needs: { urine: '소변 냄새', food: '침과 사료 기름때', often: '자주 닦아서 오래 쓰고 싶어요' },
    summary: (n) => <>답변 기준으로 10종 중 <strong>{n}종</strong>이 맞습니다{n > 3 ? '. ‘최적’ 표시가 가장 잘 맞습니다' : ''}.</>,
    top: '최적',
    uses: (n) => <>한 병으로 약 <strong className="text-gray-900">{n}번</strong></>,
    catNote: '고양이가 있다면: ',
    more: (n) => `조건에 맞는 다른 ${n}종 보기`,
    outTitle: (n) => `조건에 맞지 않는 ${n}종`,
    dogOnly: '강아지 가정용 표시',
    hasScent: (s) => `${s} 있음`,
    colon: ': ',
    foot: '횟수는 물 10리터 기준입니다. Fu Choice는 뚜껑으로 재고 ml 표시가 없어 횟수를 적지 않았습니다. 반려동물이 아프거나 임신 중이거나 피부 알레르기가 있다면 사용 전에 수의사와 상담하세요.',
  },
}

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
  const t = S[lang]
  const [pet, setPet] = useState<Pet>('both')
  const [scent, setScent] = useState<Scent>('ok')
  const [need, setNeed] = useState<Need>('urine')
  const answer = (question: string, value: string) => track('floor_answer', { question, value, lang })

  const hasCat = pet !== 'dog'
  const out: { p: FloorCleaner; why: string }[] = []
  const fits: { p: FloorCleaner; score: number }[] = []
  for (const p of FLOOR_CLEANERS) {
    if (hasCat && p.dogOnly) out.push({ p, why: t.dogOnly })
    else if (scent === 'none' && p.scent) out.push({ p, why: t.hasScent(p.scent[lang]) })
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
            {p.name[lang]}
          </button>
          {top && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">{t.top}</span>}
        </div>
        <p className="m-0 mt-1.5 text-[14px] text-gray-600">
          {p.price[lang]}・{p.dilution[lang]}{p.uses && <>・{t.uses(p.uses[lang])}</>}
        </p>
        <p className="m-0 mt-1 text-[15px] leading-relaxed text-gray-800">{(p.need[need]?.why ?? p.base)[lang]}</p>
        {hasCat && p.catNote && <p className="m-0 mt-1 text-[14px] leading-relaxed text-amber-700">{t.catNote}{p.catNote[lang]}</p>}
      </li>
    )
  }

  return (
    <section className="not-prose my-8 rounded-2xl border border-[#bae6fd] bg-[#f8fcff] p-5 sm:p-6" aria-labelledby="floor-form-title">
      <h2 id="floor-form-title" className="m-0 mb-5 text-xl font-bold text-[#0369a1]">
        {t.title}
      </h2>

      <div className="space-y-5">
        <Step title={t.qPet}>
          {(Object.keys(t.pets) as Pet[]).map((k) => (
            <Chip key={k} on={k === pet} onClick={() => { answer('pet', k); setPet(k) }}>{t.pets[k]}</Chip>
          ))}
        </Step>
        <Step title={t.qScent}>
          {(Object.keys(t.scents) as Scent[]).map((k) => (
            <Chip key={k} on={k === scent} onClick={() => { answer('scent', k); setScent(k) }}>{t.scents[k]}</Chip>
          ))}
        </Step>
        <Step title={t.qNeed}>
          {(Object.keys(t.needs) as Need[]).map((k) => (
            <Chip key={k} on={k === need} onClick={() => { answer('need', k); setNeed(k) }}>{t.needs[k]}</Chip>
          ))}
        </Step>
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-[#e6e2da]" aria-live="polite">
        <p className="m-0 text-[15px] leading-relaxed text-gray-800">
          {t.summary(fits.length)}
        </p>
        <ol className="m-0 mt-4 list-none space-y-3 p-0">{fits.slice(0, 3).map(renderItem)}</ol>

        {fits.length > 3 && (
          <details className="mt-4 text-[14px] text-gray-600">
            <summary className="cursor-pointer font-medium text-gray-700">{t.more(fits.length - 3)}</summary>
            <ol className="m-0 mt-3 list-none space-y-3 p-0">{fits.slice(3).map((f, i) => renderItem(f, i + 3))}</ol>
          </details>
        )}

        {out.length > 0 && (
          <details className="mt-4 text-[14px] text-gray-600">
            <summary className="cursor-pointer font-medium text-gray-700">{t.outTitle(out.length)}</summary>
            <ul className="mt-2 mb-0 list-disc pl-5">
              {out.map(({ p, why }) => <li key={p.id}>{p.name[lang]}{t.colon}{why}</li>)}
            </ul>
          </details>
        )}
      </div>

      <p className="mt-3 mb-0 text-[13px] leading-relaxed text-gray-500">
        {t.foot}
      </p>
    </section>
  )
}
