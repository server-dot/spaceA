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
  SEAT_LABELS,
  type ChairSeat,
  type DiningChair,
} from '@/data/dining-chairs'
import type { Lang } from '@/lib/i18n'

/**
 * 餐椅座高計算器：輸入自家餐桌高度 → 算出桌面減座面 27～30 公分的座高區間 → 列出 post 1591 九款裡合適的，
 * 不合適的收在下面並寫原因；選填身高時高差改用 SIDIZ 公式（身高×0.183−1）±1.5。
 * 嵌在 post 1591（與英日韓譯文）前言後的 <div data-spacea-tool="dining-chair"></div>。
 * 伺服器端先用預設 74 公分算好，爬蟲看得到內容；客戶端改桌高才重算。
 */

// 台灣餐桌多在 72～75；兩頭補日式矮桌（68～70）與歐美進口桌（76～78）
const PRESETS = [68, 70, 72, 74, 76, 78]
const DEFAULT_TABLE = 74
const fmt = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(1))

type Gap = { min: number; max: number }

type Fit =
  | { c: DiningChair; kind: 'fit'; seats: ChairSeat[]; gap: number }
  | { c: DiningChair; kind: 'low' | 'high'; seat: number; gap: number }
  | { c: DiningChair; kind: 'nodata' }

interface Strings {
  title: string
  tableQ: string
  tableAria: string
  cm: string
  badTable: string
  bodyQ: string
  optional: string
  bodyPh: string
  bodyAria: string
  badBody: string
  bodyLine: (bh: string, seat: string, gap: string) => string
  rangeBody: (table: string) => string
  rangePlain: (table: string) => string
  rangeNote: (min: number, max: number) => string
  seatRange: (lo: string, hi: string) => string
  fitCount: (n: number) => [string, string, string]
  tooHigh: (d: string) => [string, string, string]
  tooLow: (d: string) => [string, string, string]
  cols: [string, string, string, string]
  tolerance: (n: number) => string
  none: string
  outSummary: (n: number) => string
  nodata: string
  low: (seat: string, gap: string) => string
  high: (seat: string, gap: string) => string
  ask: string
  from: string
  sep: string
  note: (a: ReactNode, b: ReactNode) => ReactNode
  srcGap: string
  srcBody: string
}

const ZH: Strings = {
  title: '餐椅座高計算器',
  tableQ: '餐桌桌面離地幾公分？',
  tableAria: '餐桌高度（公分）',
  cm: '公分',
  badTable: `請填 60 到 90 之間的數字，先用 ${DEFAULT_TABLE} 公分計算。`,
  bodyQ: '你的身高幾公分？',
  optional: '（選填）',
  bodyPh: '例如 165',
  bodyAria: '身高（公分）',
  badBody: '請填 130 到 200 之間的數字，先不算身高。',
  bodyLine: (bh, seat, gap) => `身高 ${bh} 公分，公式建議座高約 ${seat} 公分、桌椅高差約 ${gap} 公分。`,
  rangeBody: (t) => `配 ${t} 公分的桌子，座高抓 `,
  rangePlain: (t) => `桌高 ${t} 公分，座高抓 `,
  rangeNote: (min, max) => `（桌面減座面 ${min} 到 ${max} 公分）`,
  seatRange: (lo, hi) => `${lo} 到 ${hi} 公分`,
  fitCount: (n) => ['，這篇 9 款裡有 ', `${n} 款`, '對得上。'],
  tooHigh: (d) => ['這張桌子對你來說偏高，椅子配著桌高選，', `座面會比建議高約 ${d} 公分，腳可能踩不穩地`, '，可以在桌下放腳踏。'],
  tooLow: (d) => ['這張桌子對你來說偏低，椅子配著桌高選，', `座面會比建議低約 ${d} 公分，膝蓋彎得比較多`, '，坐久腿會悶。'],
  cols: ['款式', '合適的座高', '桌椅高差', '定價'],
  tolerance: (n) => `官網註明誤差約 ±${n} 公分`,
  none: '這 9 款都對不上這個桌高，可以考慮有幾種座高可選的款式，或請店家依桌高訂製。',
  outSummary: (n) => `對不上或沒寫座高的 ${n} 款`,
  nodata: '官網沒有標示座高，下單前要先問',
  low: (s, g) => `座高 ${s} 公分，桌面比座面高 ${g} 公分，坐下去會覺得桌子偏高`,
  high: (s, g) => `座高 ${s} 公分，桌面只比座面高 ${g} 公分，坐下去桌子會偏低，大腿容易碰到桌底`,
  ask: '需詢價',
  from: ' 起',
  sep: '、',
  note: (a, b) => (
    <>
      座高與定價取自各家官網（2026 年 11 月）；桌椅高差 {HEIGHT_GAP.min} 到 {HEIGHT_GAP.max} 公分參考{a}；
      填身高時改用座高＝身高×0.25−1、高差＝身高×0.183−1，上下抓 {BODY_GAP_SPREAD} 公分，公式取自{b}，原本用在書桌椅，餐桌拿來微調。
      加了坐墊要把墊子厚度算進座高。
    </>
  ),
  srcGap: '木頭仁的台灣家具尺寸整理',
  srcBody: 'SIDIZ 桌椅高度公式',
}

const EN: Strings = {
  title: 'Dining Chair Seat Height Calculator',
  tableQ: 'How high is your dining table top (cm)?',
  tableAria: 'Table height (cm)',
  cm: 'cm',
  badTable: `Enter a number from 60 to 90. Using ${DEFAULT_TABLE} cm for now.`,
  bodyQ: 'Your height (cm)',
  optional: ' (optional)',
  bodyPh: 'e.g. 165',
  bodyAria: 'Your height (cm)',
  badBody: 'Enter a number from 130 to 200. Height is ignored for now.',
  bodyLine: (bh, seat, gap) => `At ${bh} cm tall, the formula suggests a seat height of about ${seat} cm and a table-to-seat gap of about ${gap} cm.`,
  rangeBody: (t) => ` With a ${t} cm table, look for a seat height of `,
  rangePlain: (t) => `For a ${t} cm table, look for a seat height of `,
  rangeNote: (min, max) => ` (table top ${min}–${max} cm above the seat)`,
  seatRange: (lo, hi) => `${lo}–${hi} cm`,
  fitCount: (n) => ['. ', `${n} of the 9 chairs`, ' in this guide fit.'],
  tooHigh: (d) => ['This table is on the high side for you. If you pick the chair to match the table, ', `the seat will be about ${d} cm higher than ideal and your feet may not rest flat`, ', so a footrest under the table helps.'],
  tooLow: (d) => ['This table is on the low side for you. If you pick the chair to match the table, ', `the seat will be about ${d} cm lower than ideal and your knees will bend more`, ', which gets uncomfortable over a long meal.'],
  cols: ['Chair', 'Matching seat height', 'Table-to-seat gap', 'List price'],
  tolerance: (n) => `Maker lists a tolerance of about ±${n} cm`,
  none: 'None of the 9 chairs fit this table height. Look for a model with several seat heights, or ask the maker to build to your table.',
  outSummary: (n) => `${n} chairs that don't fit or list no seat height`,
  nodata: 'No seat height on the official site; ask before ordering',
  low: (s, g) => `seat height ${s} cm, the table top sits ${g} cm above the seat, so the table will feel high`,
  high: (s, g) => `seat height ${s} cm, the table top is only ${g} cm above the seat, so the table will feel low and your thighs may hit the apron`,
  ask: 'Price on request',
  from: '+',
  sep: '; ',
  note: (a, b) => (
    <>
      Seat heights and list prices are from each maker’s official site (November 2026). The {HEIGHT_GAP.min}–{HEIGHT_GAP.max} cm gap follows {a}.
      When you enter your height, the tool uses seat = height × 0.25 − 1 and gap = height × 0.183 − 1, ±{BODY_GAP_SPREAD} cm, from {b}; the formula was written for desks, so here it only fine-tunes the result.
      If you add a seat cushion, count its thickness in the seat height.
    </>
  ),
  srcGap: 'Woodenren’s Taiwan furniture size guide',
  srcBody: 'SIDIZ’s desk and chair height formula',
}

const JA: Strings = {
  title: 'ダイニングチェア座面高計算ツール',
  tableQ: 'ダイニングテーブルの天板の高さは何cmですか？',
  tableAria: 'テーブルの高さ（cm）',
  cm: 'cm',
  badTable: `60〜90の数字を入力してください。いったん${DEFAULT_TABLE}cmで計算します。`,
  bodyQ: 'あなたの身長は何cmですか？',
  optional: '（任意）',
  bodyPh: '例：165',
  bodyAria: '身長（cm）',
  badBody: '130〜200の数字を入力してください。いったん身長なしで計算します。',
  bodyLine: (bh, seat, gap) => `身長${bh}cmの場合、計算式による目安は座面高約${seat}cm、差尺約${gap}cmです。`,
  rangeBody: (t) => `${t}cmのテーブルに合わせるなら、座面高は`,
  rangePlain: (t) => `テーブル高${t}cmなら、座面高は`,
  rangeNote: (min, max) => `（天板と座面の差${min}〜${max}cm）`,
  seatRange: (lo, hi) => `${lo}〜${hi}cm`,
  fitCount: (n) => ['が目安で、この記事の9脚のうち', `${n}脚`, 'が合います。'],
  tooHigh: (d) => ['このテーブルはあなたには高めです。テーブルに合わせて椅子を選ぶと、', `座面が目安より約${d}cm高くなり、足が床にしっかり着かないことがあります`, '。テーブルの下に足置きを置くと楽になります。'],
  tooLow: (d) => ['このテーブルはあなたには低めです。テーブルに合わせて椅子を選ぶと、', `座面が目安より約${d}cm低くなり、膝が深く曲がります`, '。長く座ると脚が窮屈になります。'],
  cols: ['モデル', '合う座面高', '差尺', '定価'],
  tolerance: (n) => `公式サイトに約±${n}cmの誤差ありと記載`,
  none: 'この9脚はどれもこのテーブル高に合いません。座面高を選べるモデルを探すか、テーブルに合わせたオーダーを相談してください。',
  outSummary: (n) => `合わない・座面高の記載がない${n}脚`,
  nodata: '公式サイトに座面高の記載なし。注文前に問い合わせが必要です',
  low: (s, g) => `座面高${s}cm、天板と座面の差が${g}cmあり、座るとテーブルが高く感じます`,
  high: (s, g) => `座面高${s}cm、天板と座面の差が${g}cmしかなく、座るとテーブルが低く、太ももが天板の下に当たりやすくなります`,
  ask: '要問い合わせ',
  from: '〜',
  sep: '、',
  note: (a, b) => (
    <>
      座面高と定価は各社公式サイト（2026年11月時点）より。差尺{HEIGHT_GAP.min}〜{HEIGHT_GAP.max}cmは{a}を参考にしています。
      身長を入力した場合は、座面高＝身長×0.25−1、差尺＝身長×0.183−1（±{BODY_GAP_SPREAD}cm）で計算します。式の出典は{b}で、もともとはデスク用のため、ダイニングでは微調整として使っています。
      クッションを敷く場合は、その厚みも座面高に含めてください。
    </>
  ),
  srcGap: '木頭仁による台湾の家具寸法まとめ',
  srcBody: 'SIDIZのデスク・チェア高さの計算式',
}

const KO: Strings = {
  title: '식탁 의자 좌판 높이 계산기',
  tableQ: '식탁 상판 높이는 몇 cm인가요?',
  tableAria: '식탁 높이(cm)',
  cm: 'cm',
  badTable: `60~90 사이 숫자를 입력하세요. 우선 ${DEFAULT_TABLE}cm로 계산합니다.`,
  bodyQ: '키는 몇 cm인가요?',
  optional: ' (선택)',
  bodyPh: '예: 165',
  bodyAria: '키(cm)',
  badBody: '130~200 사이 숫자를 입력하세요. 우선 키는 빼고 계산합니다.',
  bodyLine: (bh, seat, gap) => `키 ${bh}cm라면 공식상 권장 좌판 높이는 약 ${seat}cm, 식탁과 좌판의 높이 차이는 약 ${gap}cm입니다.`,
  rangeBody: (t) => ` ${t}cm 식탁에 맞추면 좌판 높이는 `,
  rangePlain: (t) => `식탁 높이가 ${t}cm라면 좌판 높이는 `,
  rangeNote: (min, max) => `(상판과 좌판 차이 ${min}~${max}cm)`,
  seatRange: (lo, hi) => `${lo}~${hi}cm`,
  fitCount: (n) => ['가 적당하며, 이 글의 9개 중 ', `${n}개`, '가 맞습니다.'],
  tooHigh: (d) => ['이 식탁은 나에게 높은 편입니다. 식탁에 맞춰 의자를 고르면 ', `좌판이 권장보다 약 ${d}cm 높아져 발이 바닥에 안정적으로 닿지 않을 수 있습니다`, '. 식탁 아래에 발받침을 두면 편합니다.'],
  tooLow: (d) => ['이 식탁은 나에게 낮은 편입니다. 식탁에 맞춰 의자를 고르면 ', `좌판이 권장보다 약 ${d}cm 낮아져 무릎이 더 많이 굽혀집니다`, '. 오래 앉아 있으면 다리가 답답합니다.'],
  cols: ['모델', '맞는 좌판 높이', '높이 차이', '정가'],
  tolerance: (n) => `공식 사이트에 약 ±${n}cm 오차 표기`,
  none: '9개 모두 이 식탁 높이에 맞지 않습니다. 좌판 높이를 고를 수 있는 모델을 찾거나 식탁에 맞춘 주문 제작을 문의해 보세요.',
  outSummary: (n) => `맞지 않거나 좌판 높이 표기가 없는 ${n}개`,
  nodata: '공식 사이트에 좌판 높이 표기가 없어 주문 전에 문의해야 합니다',
  low: (s, g) => `좌판 높이 ${s}cm, 상판이 좌판보다 ${g}cm 높아 앉으면 식탁이 높게 느껴집니다`,
  high: (s, g) => `좌판 높이 ${s}cm, 상판이 좌판보다 ${g}cm밖에 높지 않아 식탁이 낮게 느껴지고 허벅지가 식탁 아래에 닿기 쉽습니다`,
  ask: '가격 문의',
  from: '~',
  sep: ', ',
  note: (a, b) => (
    <>
      좌판 높이와 정가는 각 브랜드 공식 사이트 기준(2026년 11월)입니다. 높이 차이 {HEIGHT_GAP.min}~{HEIGHT_GAP.max}cm는 {a}를 참고했습니다.
      키를 입력하면 좌판 = 키 × 0.25 − 1, 높이 차이 = 키 × 0.183 − 1(±{BODY_GAP_SPREAD}cm)로 계산하며, 공식 출처는 {b}입니다. 원래 책상용 공식이라 식탁에서는 미세 조정용으로만 씁니다.
      방석을 깔면 그 두께도 좌판 높이에 넣어 계산하세요.
    </>
  ),
  srcGap: '목공 장인 Woodenren의 대만 가구 치수 정리',
  srcBody: 'SIDIZ 책상·의자 높이 공식',
}

const S: Record<Lang, Strings> = { zh: ZH, en: EN, ja: JA, ko: KO }

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
function seatText(seats: ChairSeat[], lang: Lang, t: Strings) {
  const groups = new Map<string, number[]>()
  for (const s of seats) {
    const label = s.label ? SEAT_LABELS[s.label][lang] : ''
    groups.set(label, [...(groups.get(label) ?? []), s.h])
  }
  return [...groups]
    .map(([label, hs]) => `${label ? label + ' ' : ''}${hs.map(fmt).join(lang === 'zh' || lang === 'ja' ? '／' : '/')}${unitOf(lang, t)}`)
    .join(t.sep)
}

function gapText(gaps: number[]) {
  const lo = Math.min(...gaps)
  const hi = Math.max(...gaps)
  return lo === hi ? fmt(lo) : `${fmt(lo)}～${fmt(hi)}`
}

/** 數字後的單位：中英加空格（45 公分、45 cm），日韓直接接（45cm） */
const unitOf = (lang: Lang, t: Strings) => (lang === 'zh' || lang === 'en' ? ` ${t.cm}` : t.cm)

const brandOf = (c: DiningChair, lang: Lang) => (lang === 'zh' ? c.brand : c.names[lang])

function priceOf(c: DiningChair, lang: Lang, t: Strings) {
  if (lang === 'zh') return c.priceText
  if (c.price == null) return t.ask
  const from = /起|／/.test(c.priceText)
  const p = `NT$${c.price.toLocaleString('en-US')}`
  return from ? p + t.from : p
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
  const t = S[lang]
  const unit = unitOf(lang, t)
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
  const [fc1, fc2, fc3] = t.fitCount(fits.length)

  const pick = (v: number) => {
    track('dcf_input', { value: v, via: 'preset', lang })
    setRaw(String(v))
  }

  const link = (href: string, text: string) => (
    <>
      {lang === 'zh' || lang === 'ja' ? '' : ' '}
      <a href={href} target="_blank" rel="noopener" className="text-[#0369a1] underline">{text}</a>
    </>
  )

  return (
    <section className="not-prose my-8 rounded-2xl border border-[#bae6fd] bg-[#f8fcff] p-5 sm:p-6" aria-labelledby="dcf-title">
      <h2 id="dcf-title" className="m-0 mb-5 text-xl font-bold text-[#0369a1]">
        {t.title}
      </h2>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 text-[15px] font-bold text-gray-900">{t.tableQ}</legend>
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
            aria-label={t.tableAria}
          />
          <span className="text-[15px] text-gray-700">{t.cm}</span>
        </div>
        {!valid && <p className="mt-2 mb-0 text-[14px] text-amber-700">{t.badTable}</p>}
      </fieldset>

      <fieldset className="m-0 mt-5 border-0 p-0">
        <legend className="mb-2 text-[15px] font-bold text-gray-900">
          {t.bodyQ}<span className="ml-1 font-normal text-gray-500">{t.optional}</span>
        </legend>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            min={130}
            max={200}
            step={1}
            value={rawH}
            placeholder={t.bodyPh}
            onChange={(e) => setRawH(e.target.value)}
            onBlur={() => hasBody && track('dcf_body', { value: bh, table, lang })}
            className="w-28 rounded-lg border border-[#e6e2da] bg-white px-3 py-1.5 text-[15px] focus:border-[#0284c7] focus:outline-none"
            aria-label={t.bodyAria}
          />
          <span className="text-[15px] text-gray-700">{t.cm}</span>
        </div>
        {badBody && <p className="mt-2 mb-0 text-[14px] text-amber-700">{t.badBody}</p>}
      </fieldset>

      <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-[#e6e2da]">
        {idealSeat != null && idealGap != null ? (
          <>
            <p className="m-0 text-[15px] leading-relaxed text-gray-800">
              {t.bodyLine(fmt(bh), fmt(idealSeat), fmt(idealGap))}
              {t.rangeBody(fmt(table))}<strong>{t.seatRange(fmt(lo), fmt(hi))}</strong>{fc1}<strong>{fc2}</strong>{fc3}
            </p>
            {table - idealGap - idealSeat > 2 && (() => {
              const [a, b, c] = t.tooHigh(fmt(table - idealGap - idealSeat))
              return <p className="mt-2 mb-0 text-[14px] leading-relaxed text-amber-800">{a}<strong>{b}</strong>{c}</p>
            })()}
            {idealSeat - (table - idealGap) > 2 && (() => {
              const [a, b, c] = t.tooLow(fmt(idealSeat - (table - idealGap)))
              return <p className="mt-2 mb-0 text-[14px] leading-relaxed text-amber-800">{a}<strong>{b}</strong>{c}</p>
            })()}
          </>
        ) : (
          <p className="m-0 text-[15px] leading-relaxed text-gray-800">
            {t.rangePlain(fmt(table))}<strong>{t.seatRange(fmt(lo), fmt(hi))}</strong>{t.rangeNote(HEIGHT_GAP.min, HEIGHT_GAP.max)}
            {fc1}<strong>{fc2}</strong>{fc3}
          </p>
        )}

        {fits.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[15px]">
              <thead>
                <tr className="bg-[#0284c7] text-left text-white">
                  {t.cols.map((h) => (
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
                        {brandOf(f.c, lang)}
                      </a>
                      {lang === 'zh' && <span className="block text-[13px] text-gray-500">{f.c.name}</span>}
                    </td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5">
                      {seatText(f.seats, lang, t)}
                      {f.c.tolerance && <span className="block text-[13px] text-gray-500">{t.tolerance(f.c.tolerance)}</span>}
                    </td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">
                      {gapText(f.seats.map((s) => table - s.h))}{unit}
                    </td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5 text-[14px]">{priceOf(f.c, lang, t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 mb-0 text-[15px] text-gray-700">{t.none}</p>
        )}

        {out.length > 0 && (
          <details className="mt-4 text-[14px] text-gray-600">
            <summary className="cursor-pointer font-medium text-gray-700">{t.outSummary(out.length)}</summary>
            <ul className="mt-2 mb-0 list-disc pl-5">
              {out.map((f) => (
                <li key={f.c.brand}>
                  {lang === 'zh' ? `${f.c.brand} ${f.c.name}：` : `${brandOf(f.c, lang)}${lang === 'ja' ? '：' : ': '}`}
                  {f.kind === 'nodata'
                    ? t.nodata
                    : f.kind === 'low'
                      ? t.low(fmt(f.seat), fmt(f.gap))
                      : t.high(fmt(f.seat), fmt(f.gap))}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <p className="mt-3 mb-0 text-[13px] leading-relaxed text-gray-500">
        {t.note(link(HEIGHT_GAP_SOURCE, t.srcGap), link(BODY_FORMULA_SOURCE, t.srcBody))}
      </p>
    </section>
  )
}
