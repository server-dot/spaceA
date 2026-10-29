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
 */

type Form = 'free' | 'ester' | 'unknown'

const FORMS: Form[] = ['free', 'ester', 'unknown']

type Strings = {
  title: string
  qMg: string
  mgUnit: string
  qForm: string
  forms: Record<Form, string>
  qPerDay: string
  result: (mg: string) => ReactNode
  resultUnknown: (lo: string, hi: string) => ReactNode
  ok: (limit: ReactNode) => ReactNode
  over: (limit: ReactNode) => ReactNode
  overIfFree: (limit: ReactNode) => ReactNode
  limitLabel: string
  listTitle: string
  head: string[]
  perUnit: (mg: number, unit: string) => string
  perDay: (n: number, unit: string) => string
  mg: (n: number) => string
  noData: string
  formTag: Record<LuteinForm, string>
  officialLutein: (mg: number) => string
  /** 資料檔的單位是中文（包、粒…），外語版換成各自的量詞 */
  unit: (u: string, n: number) => string
  foot: string
}

const ZH: Strings = {
  title: '葉黃素含量計算器',
  qMg: '瓶身寫每顆（每份）幾毫克？',
  mgUnit: '毫克',
  qForm: '標示的型態',
  forms: { free: '游離型', ester: '酯化型', unknown: '沒寫' },
  qPerDay: '一天吃幾顆（份）？',
  result: (mg) => <>換算成游離型，一天大約吃到 <strong>{mg} 毫克</strong>葉黃素。</>,
  resultUnknown: (lo, hi) => (
    <>標示沒寫型態，一天大約落在 <strong>{lo}～{hi} 毫克</strong>之間（寫的是游離型就是 {hi}，是酯化型就是 {lo}）。可以看成分表寫的是「葉黃素」還是「葉黃素酯」。</>
  ),
  ok: (limit) => <>在{limit}之內。</>,
  over: (limit) => <>已經超過{limit}，每天的量要減少。</>,
  overIfFree: (limit) => <>如果寫的是游離型，就超過了{limit}，先確認型態再決定一天吃幾顆。</>,
  limitLabel: `衛福部每日 ${DAILY_LIMIT} 毫克的上限`,
  listTitle: '文章比的 10 款，換成同一個單位',
  head: ['產品', '標示', '一天吃', '換算成游離型'],
  perUnit: (mg, unit) => `${mg} 毫克／${unit}`,
  perDay: (n, unit) => `${n} ${unit}`,
  mg: (n) => `${n} 毫克`,
  noData: '官網未標示',
  formTag: { free: '游離型', ester: '酯化型', none: '未寫型態' },
  officialLutein: (mg) => `酯化型，官網換算含葉黃素 ${mg} 毫克`,
  unit: (u) => u,
  foot: `酯化型乘 ${ESTER_FACTOR} 換回游離型，依葉黃素與二棕櫚酸酯的分子量比計算（568.9 ÷ 1045.7）；官網自己換算過的照官網數字。每日量照官網建議，官網沒寫的不換算。`,
}

const EN_UNIT: Record<string, [string, string]> = { 包: ['sachet', 'sachets'], 粒: ['softgel', 'softgels'], 顆: ['capsule', 'capsules'], 錠: ['tablet', 'tablets'], 瓶: ['bottle', 'bottles'] }
const JA_UNIT: Record<string, string> = { 包: '包', 粒: '粒', 顆: '粒', 錠: '錠', 瓶: '本' }
const KO_UNIT: Record<string, string> = { 包: '포', 粒: '알', 顆: '알', 錠: '정', 瓶: '병' }

const EN: Strings = {
  title: 'Lutein Content Calculator',
  qMg: 'How many mg per capsule (serving) does the label say?',
  mgUnit: 'mg',
  qForm: 'Form on the label',
  forms: { free: 'Free form', ester: 'Ester form', unknown: 'Not stated' },
  qPerDay: 'How many per day?',
  result: (mg) => <>Converted to free-form lutein, you get about <strong>{mg} mg</strong> a day.</>,
  resultUnknown: (lo, hi) => (
    <>The label does not state the form, so your daily intake is about <strong>{lo} to {hi} mg</strong> ({hi} if it is free form, {lo} if it is ester form). Check whether the ingredient list says “lutein” or “lutein esters”.</>
  ),
  ok: (limit) => <>That is within {limit}.</>,
  over: (limit) => <>That is over {limit}; take less per day.</>,
  overIfFree: (limit) => <>If it is free form, that is over {limit}; confirm the form before deciding how many to take.</>,
  limitLabel: `Taiwan’s ${DAILY_LIMIT} mg daily limit`,
  listTitle: 'The 10 products in this article, on the same basis',
  head: ['Product', 'Label', 'Per day', 'As free-form lutein'],
  perUnit: (mg, unit) => `${mg} mg / ${unit}`,
  perDay: (n, unit) => `${n} ${unit}`,
  mg: (n) => `${n} mg`,
  noData: 'Not stated',
  formTag: { free: 'Free form', ester: 'Ester form', none: 'Form not stated' },
  officialLutein: (mg) => `Ester form; ${mg} mg lutein per the official site`,
  unit: (u, n) => (EN_UNIT[u] ? EN_UNIT[u][n === 1 ? 0 : 1] : u),
  foot: `Ester-form figures are multiplied by ${ESTER_FACTOR} to get free-form lutein, based on the molecular weight ratio of lutein to lutein dipalmitate (568.9 ÷ 1045.7); where the official site gives its own conversion, that figure is used. Daily amounts follow each official site; products without a stated daily amount are not converted.`,
}

const JA: Strings = {
  title: 'ルテイン含有量計算ツール',
  qMg: 'ラベルに書かれた1粒（1回分）あたりのmgは？',
  mgUnit: 'mg',
  qForm: '表示されている型',
  forms: { free: '遊離型', ester: 'エステル型', unknown: '記載なし' },
  qPerDay: '1日に何粒（何回分）飲みますか？',
  result: (mg) => <>遊離型に換算すると、1日あたり約 <strong>{mg} mg</strong> のルテインを摂っています。</>,
  resultUnknown: (lo, hi) => (
    <>型の記載がないため、1日あたり約 <strong>{lo}〜{hi} mg</strong> の範囲です（遊離型なら {hi}、エステル型なら {lo}）。成分表が「ルテイン」か「ルテインエステル」かを確認してください。</>
  ),
  ok: (limit) => <>{limit}の範囲内です。</>,
  over: (limit) => <>{limit}を超えています。1日の量を減らしてください。</>,
  overIfFree: (limit) => <>遊離型の場合は{limit}を超えます。型を確認してから1日の量を決めてください。</>,
  limitLabel: `台湾衛生福利部の1日${DAILY_LIMIT} mgの上限`,
  listTitle: '本記事で比較した10製品を同じ基準で',
  head: ['製品', '表示', '1日の量', '遊離型換算'],
  perUnit: (mg, unit) => `${mg} mg／1${unit}`,
  perDay: (n, unit) => `${n}${unit}`,
  mg: (n) => `${n} mg`,
  noData: '公式サイトに記載なし',
  formTag: { free: '遊離型', ester: 'エステル型', none: '型の記載なし' },
  officialLutein: (mg) => `エステル型、公式サイトの換算でルテイン ${mg} mg`,
  unit: (u) => JA_UNIT[u] ?? u,
  foot: `エステル型は ${ESTER_FACTOR} を掛けて遊離型に換算しています（ルテインとジパルミチン酸エステルの分子量比 568.9 ÷ 1045.7）。公式サイトが独自に換算している場合はその数値を使用。1日の量は公式サイトの推奨量に従い、記載のない製品は換算していません。`,
}

const KO: Strings = {
  title: '루테인 함량 계산기',
  qMg: '라벨에 적힌 1알(1회분)당 mg은?',
  mgUnit: 'mg',
  qForm: '라벨에 표시된 형태',
  forms: { free: '유리형', ester: '에스터형', unknown: '표시 없음' },
  qPerDay: '하루에 몇 알(회분) 드시나요?',
  result: (mg) => <>유리형으로 환산하면 하루 약 <strong>{mg} mg</strong>의 루테인을 섭취합니다.</>,
  resultUnknown: (lo, hi) => (
    <>형태 표시가 없어 하루 섭취량은 약 <strong>{lo}~{hi} mg</strong> 사이입니다(유리형이면 {hi}, 에스터형이면 {lo}). 성분표에 ‘루테인’인지 ‘루테인 에스터’인지 확인해 보세요.</>
  ),
  ok: (limit) => <>{limit} 이내입니다.</>,
  over: (limit) => <>{limit}을 넘었습니다. 하루 섭취량을 줄이세요.</>,
  overIfFree: (limit) => <>유리형이라면 {limit}을 넘습니다. 형태를 먼저 확인한 뒤 하루 섭취량을 정하세요.</>,
  limitLabel: `대만 위생복리부의 하루 ${DAILY_LIMIT} mg 상한`,
  listTitle: '이 글에서 비교한 10종을 같은 기준으로',
  head: ['제품', '표시', '하루 섭취', '유리형 환산'],
  perUnit: (mg, unit) => `${mg} mg／1${unit}`,
  perDay: (n, unit) => `${n}${unit}`,
  mg: (n) => `${n} mg`,
  noData: '공식 사이트 미표시',
  formTag: { free: '유리형', ester: '에스터형', none: '형태 미표시' },
  officialLutein: (mg) => `에스터형, 공식 사이트 환산 루테인 ${mg} mg`,
  unit: (u) => KO_UNIT[u] ?? u,
  foot: `에스터형은 ${ESTER_FACTOR}를 곱해 유리형으로 환산했습니다(루테인과 루테인 디팔미테이트의 분자량 비 568.9 ÷ 1045.7). 공식 사이트가 직접 환산한 경우 그 수치를 사용했습니다. 하루 섭취량은 공식 사이트 권장량을 따르며, 표시가 없는 제품은 환산하지 않았습니다.`,
}

const S: Record<Lang, Strings> = { zh: ZH, en: EN, ja: JA, ko: KO }

/** 中文、日文顯示中文原名（日文譯文的慣例），英文、韓文用譯文卡片的品牌名；產品名只在中文版列出 */
function brandOf(p: LuteinProduct, lang: Lang) {
  return lang === 'en' || lang === 'ko' ? p.names[lang] : p.brand
}

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
          <span className="text-[15px] text-gray-700">{t.mgUnit}</span>
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
                      {brandOf(p, lang)}
                    </a>
                    {lang === 'zh' && <span className="block text-[13px] text-gray-500">{p.name}</span>}
                  </td>
                  <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">
                    {p.mg == null ? t.noData : t.perUnit(p.mg, t.unit(p.unit, 1))}
                    <span className="block text-[13px] text-gray-500">{p.luteinMg != null ? t.officialLutein(p.luteinMg) : t.formTag[p.form]}</span>
                  </td>
                  <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">{p.perDay == null ? t.noData : t.perDay(p.perDay, t.unit(p.unit, p.perDay))}</td>
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
