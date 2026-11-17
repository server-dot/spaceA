'use client'

import { useState, type ReactNode } from 'react'
import { sendGAEvent } from '@next/third-parties/google'
import { PM25_MASKS, monthlyCost, type MaskProduct, type Where, type Priority } from '@/data/pm25-masks'
import type { Lang } from '@/lib/i18n'

/**
 * PM2.5 口罩推薦表單：在哪戴 → 一週幾天 → 願不願意洗 → 最在意什麼，
 * 答完依分數排出適合的款（超過 3 款時前 3 款標「最適合」）、每月約花多少、為什麼適合；不想洗時可水洗款收在下面並寫原因。
 * 嵌在 post 1640 及英日韓譯文的 <div data-spacea-tool="pm25-mask"></div>（ArticleBody 負責切開）。
 */

type Days = 2 | 4 | 7
type Wash = 'yes' | 'no'

interface Strings {
  title: string
  qWhere: string
  where: Record<Where, string>
  qDays: string
  days: Record<Days, string>
  qWash: string
  wash: Record<Wash, string>
  qPriority: string
  priority: Record<Priority, string>
  summary: (n: number) => ReactNode
  top: string
  grade: (g: 'A' | 'B' | null) => string
  perMonth: string
  sep: string
  smallBox: (s: string) => string
  washDaily: string
  extraCert: (c: string) => string
  outTitle: (n: number) => string
  outWhy: string
  colon: string
  foot: string
}

const S: Record<Lang, Strings> = {
  zh: {
    title: '哪一款 PM2.5 口罩適合你？',
    qWhere: '主要在哪裡戴？',
    where: { moto: '騎機車', walk: '走路或搭車通勤', kitchen: '廚房炒菜', work: '工作場所有粉塵', alert: '只有空污日才戴' },
    qDays: '一週戴幾天？',
    days: { 2: '1～2 天', 4: '3～5 天', 7: '幾乎每天' },
    qWash: '願意洗口罩嗎？',
    wash: { yes: '願意，可以每天洗', no: '不想洗，戴完就丟' },
    qPriority: '最在意什麼？',
    priority: { grade: '防護等級最高', cost: '每個月最省', breath: '吸氣不吃力', look: '外觀能搭衣服' },
    summary: (n) => <>照你的答案，這 6 款裡有 <strong>{n} 款</strong>適合{n > 3 ? '，標「最適合」的 3 款最符合你的情況' : ''}。</>,
    top: '最適合',
    grade: (g) => (g ? `CNS 15980 ${g} 級` : '未標等級'),
    perMonth: '每月約',
    sep: '；',
    smallBox: (s) => `${s}，不容易囤到過期`,
    washDaily: '天天戴，可水洗攤下來不比拋棄式貴',
    extraCert: (c) => `另有${c}認證`,
    outTitle: (n) => `不符合條件的 ${n} 款`,
    outWhy: '要水洗重複使用',
    colon: '：',
    foot: '每月花費以定價、一個月 4.3 週計算；藍鷹官網未標價，用 PChome 售價。可水洗款照官網建議的更換天數攤提：克微粒以 6 天計，Xpure 以可洗 200 次計。',
  },
  en: {
    title: 'Which PM2.5 mask suits you?',
    qWhere: 'Where will you mostly wear it?',
    where: { moto: 'Riding a scooter', walk: 'Walking or taking transit', kitchen: 'Cooking at home', work: 'Dusty workplace', alert: 'Only on polluted days' },
    qDays: 'How many days a week?',
    days: { 2: '1–2 days', 4: '3–5 days', 7: 'Almost every day' },
    qWash: 'Are you willing to wash masks?',
    wash: { yes: 'Yes, I can wash it daily', no: 'No, I’d rather throw it away' },
    qPriority: 'What matters most?',
    priority: { grade: 'Highest protection grade', cost: 'Lowest monthly cost', breath: 'Easy breathing', look: 'Looks good with my outfit' },
    summary: (n) => <>Based on your answers, <strong>{n} of these 6</strong> fit{n > 3 ? '; the 3 marked “Best match” suit you most' : ''}.</>,
    top: 'Best match',
    grade: (g) => (g ? `CNS 15980 Grade ${g}` : 'Grade not stated'),
    perMonth: 'about',
    sep: '; ',
    smallBox: (s) => `${s}, so it won’t sit around until it expires`,
    washDaily: 'Worn daily, a washable mask costs no more than disposables',
    extraCert: (c) => `Also ${c} certified`,
    outTitle: (n) => `${n} that don’t fit`,
    outWhy: 'needs washing and reuse',
    colon: ': ',
    foot: 'Monthly cost uses list price and 4.3 weeks a month; Blue Eagle has no price on its official site, so the PChome price is used. Washable masks are spread over the replacement period the brand recommends: 6 days for :dcMask and 200 washes for Xpure.',
  },
  ja: {
    title: 'あなたに合う PM2.5 マスクはどれ？',
    qWhere: '主にどこで着けますか？',
    where: { moto: 'バイクに乗る', walk: '徒歩や電車・バスで通勤', kitchen: '台所で料理', work: '粉じんのある職場', alert: '大気汚染の日だけ' },
    qDays: '週に何日着けますか？',
    days: { 2: '1〜2 日', 4: '3〜5 日', 7: 'ほぼ毎日' },
    qWash: 'マスクを洗えますか？',
    wash: { yes: 'はい、毎日洗える', no: '洗いたくない、使い捨てがいい' },
    qPriority: '一番重視することは？',
    priority: { grade: '防護等級の高さ', cost: '月々の安さ', breath: '息のしやすさ', look: '服に合う見た目' },
    summary: (n) => <>回答に合うのはこの 6 点のうち <strong>{n} 点</strong>です{n > 3 ? '。「最適」の 3 点が特におすすめです' : ''}。</>,
    top: '最適',
    grade: (g) => (g ? `CNS 15980 ${g} 等級` : '等級の記載なし'),
    perMonth: '月約',
    sep: '、',
    smallBox: (s) => `${s}ので、期限切れになりにくい`,
    washDaily: '毎日使うなら、洗えるタイプは使い捨てより高くならない',
    extraCert: (c) => `${c}認証もあり`,
    outTitle: (n) => `条件に合わない ${n} 点`,
    outWhy: '洗って繰り返し使うタイプ',
    colon: '：',
    foot: '月々の費用は定価・1 か月 4.3 週で計算。藍鷹牌は公式サイトに価格がないため PChome の価格を使用。洗えるタイプは公式サイトの推奨交換日数で割っています（克微粒は 6 日、Xpure は 200 回洗濯で計算）。',
  },
  ko: {
    title: '나에게 맞는 PM2.5 마스크는?',
    qWhere: '주로 어디서 쓰나요?',
    where: { moto: '오토바이 탈 때', walk: '도보나 대중교통 출퇴근', kitchen: '집에서 요리할 때', work: '분진 있는 작업장', alert: '대기 오염일에만' },
    qDays: '일주일에 며칠 쓰나요?',
    days: { 2: '1~2일', 4: '3~5일', 7: '거의 매일' },
    qWash: '마스크를 빨 수 있나요?',
    wash: { yes: '네, 매일 빨 수 있어요', no: '아니요, 쓰고 버릴래요' },
    qPriority: '가장 중요한 것은?',
    priority: { grade: '가장 높은 보호 등급', cost: '가장 적은 월 비용', breath: '편한 호흡', look: '옷에 어울리는 외관' },
    summary: (n) => <>답변 기준으로 6종 중 <strong>{n}종</strong>이 맞습니다{n > 3 ? '. ‘최적’ 표시된 3종이 가장 잘 맞습니다' : ''}.</>,
    top: '최적',
    grade: (g) => (g ? `CNS 15980 ${g} 등급` : '등급 미표기'),
    perMonth: '월 약',
    sep: '; ',
    smallBox: (s) => `${s}이라 유통기한을 넘기기 어려움`,
    washDaily: '매일 쓰면 세탁형도 일회용보다 비싸지 않음',
    extraCert: (c) => `${c} 인증도 있음`,
    outTitle: (n) => `조건에 맞지 않는 ${n}종`,
    outWhy: '세탁해 재사용하는 제품',
    colon: ': ',
    foot: '월 비용은 정가, 한 달 4.3주 기준입니다. Blue Eagle은 공식 사이트에 가격이 없어 PChome 판매가를 썼습니다. 세탁형은 공식 권장 교체 기간으로 나눴습니다(:dcMask 6일, Xpure 200회 세탁 기준).',
  },
}

interface Ranked {
  p: MaskProduct
  score: number
  monthly: number
  reasons: string[]
}

function rank(p: MaskProduct, where: Where, days: Days, priority: Priority, lang: Lang): Ranked {
  const t = S[lang]
  const reasons: string[] = []
  let score = p.grade === 'A' ? 2 : p.grade === 'B' ? 1 : 0
  const w = p.where[where]
  if (w) { score += w.score; reasons.push(w.why[lang]) }
  if (where === 'alert' && p.smallBox) { score += 1; reasons.push(t.smallBox(p.smallBox[lang])) }
  if (p.type === 'washable') {
    if (days === 7) { score += 1; reasons.push(t.washDaily) }
    if (where === 'alert') score -= 1
  }
  if (priority === 'grade' && p.grade === 'A') {
    score += 3 + (p.extraCert ? 1 : 0)
    if (p.extraCert) reasons.unshift(t.extraCert(p.extraCert[lang]))
  }
  if (priority === 'breath' && p.breath) { score += p.breath.score; reasons.push(p.breath.why[lang]) }
  if (priority === 'look' && p.look) { score += p.look.score; reasons.push(p.look.why[lang]) }
  if (priority === 'grade' && p.grade == null) score -= 1
  if (reasons.length === 0) reasons.push(p.base[lang])
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

export default function Pm25MaskPicker({ lang = 'zh' }: { lang?: Lang }) {
  const t = S[lang]
  const [where, setWhere] = useState<Where>('walk')
  const [days, setDays] = useState<Days>(4)
  const [wash, setWash] = useState<Wash>('yes')
  const [priority, setPriority] = useState<Priority>('grade')
  const answer = (q: string, v: string | number) => track('pm25_answer', { question: q, value: v, lang })

  const fits: Ranked[] = []
  const out: MaskProduct[] = []
  for (const p of PM25_MASKS) {
    if (wash === 'no' && p.type === 'washable') out.push(p)
    else fits.push(rank(p, where, days, priority, lang))
  }
  // 「每個月最省」照花費排；其他照分數，同分再比花費
  fits.sort((a, b) => (priority === 'cost' ? a.monthly - b.monthly : b.score - a.score || a.monthly - b.monthly))

  return (
    <section className="not-prose my-8 rounded-2xl border border-[#bae6fd] bg-[#f8fcff] p-5 sm:p-6" aria-labelledby="pm25-form-title">
      <h2 id="pm25-form-title" className="m-0 mb-5 text-xl font-bold text-[#0369a1]">
        {t.title}
      </h2>

      <div className="space-y-5">
        <Step title={t.qWhere}>
          {(Object.keys(t.where) as Where[]).map((k) => (
            <Chip key={k} on={k === where} onClick={() => { answer('where', k); setWhere(k) }}>{t.where[k]}</Chip>
          ))}
        </Step>
        <Step title={t.qDays}>
          {([2, 4, 7] as Days[]).map((k) => (
            <Chip key={k} on={k === days} onClick={() => { answer('days', k); setDays(k) }}>{t.days[k]}</Chip>
          ))}
        </Step>
        <Step title={t.qWash}>
          {(Object.keys(t.wash) as Wash[]).map((k) => (
            <Chip key={k} on={k === wash} onClick={() => { answer('wash', k); setWash(k) }}>{t.wash[k]}</Chip>
          ))}
        </Step>
        <Step title={t.qPriority}>
          {(Object.keys(t.priority) as Priority[]).map((k) => (
            <Chip key={k} on={k === priority} onClick={() => { answer('priority', k); setPriority(k) }}>{t.priority[k]}</Chip>
          ))}
        </Step>
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-[#e6e2da]">
        <p className="m-0 text-[15px] leading-relaxed text-gray-800">{t.summary(fits.length)}</p>

        <ol className="m-0 mt-4 list-none space-y-3 p-0">
          {fits.map((m, i) => {
            const top = i < 3 && fits.length > 3
            return (
              <li key={m.p.id} className={`rounded-lg border p-3.5 ${top ? 'border-[#7dd3fc] bg-[#f0f9ff]' : 'border-[#e6e2da] bg-white'}`}>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-bold text-gray-400">{i + 1}</span>
                  <a
                    href={m.p.url}
                    target="_blank"
                    rel="noopener"
                    onClick={() => track('pm25_product_click', { brand: m.p.id, position: i + 1, where, days, wash, priority, lang })}
                    className="text-[16px] font-bold text-[#0369a1] hover:underline"
                  >
                    {m.p.brand[lang]} {m.p.name[lang]}
                  </a>
                  {top && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">{t.top}</span>}
                </div>
                <p className="m-0 mt-1.5 text-[14px] text-gray-600">
                  {t.grade(m.p.grade)}・{m.p.wearLabel[lang]}・{t.perMonth} <strong className="text-gray-900">NT${m.monthly.toLocaleString('en-US')}</strong>
                </p>
                <p className="m-0 mt-1 text-[15px] leading-relaxed text-gray-800">{m.reasons.join(t.sep)}</p>
              </li>
            )
          })}
        </ol>

        {out.length > 0 && (
          <details className="mt-4 text-[14px] text-gray-600">
            <summary className="cursor-pointer font-medium text-gray-700">{t.outTitle(out.length)}</summary>
            <ul className="mt-2 mb-0 list-disc pl-5">
              {out.map((p) => (
                <li key={p.id}>{p.brand[lang]} {p.name[lang]}{t.colon}{t.outWhy}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <p className="mt-3 mb-0 text-[13px] leading-relaxed text-gray-500">{t.foot}</p>
    </section>
  )
}
