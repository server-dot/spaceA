'use client'

import { useState, type ReactNode } from 'react'
import { sendGAEvent } from '@next/third-parties/google'
import { KIDS_FISH_OIL, FAO_WHO_URL, dailyTarget, type FishOilProduct, type HowTo } from '@/data/kids-fish-oil'
import type { Lang } from '@/lib/i18n'

/**
 * 兒童魚油挑選表單：年齡 → 怎麼吃 → 飲食限制，答完列出符合的款、每天幾顆、一個月多少錢，
 * 不符合的收在下面並寫原因。嵌在 post 1410（及英日韓譯文）前言後的
 * <div data-spacea-tool="kids-fish-oil"></div>（ArticleBody 負責切開）。
 * 伺服器端先用預設答案算好，爬蟲看得到內容；客戶端改答案才重算。
 */

const AGES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

type Way = 'chew' | 'swallow' | 'mix'
type Limit = 'soy' | 'peanut' | 'pork' | 'beef'
type Status = 'ok' | 'short' | 'nodata'
type Why = 'minAge' | 'noChew' | 'noSwallow' | 'noMix' | 'soy' | 'peanut' | 'pork' | 'beef'

interface Strings {
  title: string
  qAge: string
  age: (a: number) => string
  qWay: string
  ways: Record<Way, string>
  qLimit: string
  limits: Record<Limit, string>
  head: [string, string, string, string, string]
  summary: (age: number, range: string, fao: ReactNode, n: number) => ReactNode
  pcs: (n: number) => string
  mg: (n: number) => string
  noData: string
  badge: Record<Status, string>
  none: string
  outTitle: (n: number) => string
  why: (w: Why, minAge: number | null) => string
  howTo: Record<HowTo, string>
  foot: string
  faoLabel: string
}

const S: Record<Lang, Strings> = {
  zh: {
    title: '孩子能吃哪幾款？',
    qAge: '孩子幾歲？',
    age: (a) => `${a} 歲`,
    qWay: '孩子怎麼吃膠囊？',
    ways: { chew: '會咬著吃', swallow: '會整顆吞膠囊', mix: '都還不會，要拌進食物' },
    qLimit: '有沒有飲食限制？',
    limits: { soy: '對大豆過敏', peanut: '對花生過敏', pork: '不吃豬', beef: '不吃牛' },
    head: ['產品', '每天吃', '一天補到', '一個月約', '怎麼吃'],
    summary: (age, range, fao, n) => (
      <>{age} 歲一天要 <strong>{range} 毫克</strong> EPA＋DHA（{fao}），這 10 款裡有 <strong>{n} 款</strong>適合。</>
    ),
    pcs: (n) => `${n} 顆`,
    mg: (n) => `${n} 毫克`,
    noData: '官網未標示',
    badge: { ok: '達建議量', short: '吃到上限也不夠', nodata: '官網未標示 DHA' },
    none: '這 10 款都不符合這組條件，可以先問小兒科醫師或藥師，或改看藻油產品。',
    outTitle: (n) => `不符合條件的 ${n} 款`,
    why: (w, m) => ({ minAge: `${m} 歲以上才能吃`, noChew: '要整顆吞，不能咬', noSwallow: '要咬破咀嚼，不能整顆吞', noMix: '官網沒有寫可以剪開拌食物', soy: '含大豆', peanut: '含花生', pork: '膠囊是豬明膠', beef: '膠囊是牛明膠' })[w],
    howTo: { swallowOrMix: '直接吞，或剪開拌進食物', chewMelt: '咬破或咀嚼到化開', entericSwallow: '腸溶膠囊，整顆吞', smallSwallow: '小顆軟膠囊，整顆吞', chewNoSwallow: '咬破咀嚼，勿整顆吞', chewWell: '充分咀嚼', cutOpen: '剪開食用', biteOpen: '直接咬破', chewOrSwallow: '咀嚼或整顆吞', pierceMix: '刺破混進果汁或牛奶', chewSoftgel: '咀嚼軟膠囊', chewOrSpread: '咀嚼，或擠在食物上' },
    foot: '顆數照官網建議量，月花費以定價、30 天計算。正在吃抗凝血藥物的孩子先問醫師。',
    faoLabel: 'FAO／WHO 建議',
  },
  en: {
    title: 'Which ones can your child take?',
    qAge: 'How old is your child?',
    age: (a) => `${a} yrs`,
    qWay: 'How does your child take capsules?',
    ways: { chew: 'Chews them', swallow: 'Swallows them whole', mix: 'Neither yet, mixed into food' },
    qLimit: 'Any dietary restrictions?',
    limits: { soy: 'Soy allergy', peanut: 'Peanut allergy', pork: 'No pork', beef: 'No beef' },
    head: ['Product', 'Per day', 'Daily intake', 'Per month', 'How to take'],
    summary: (age, range, fao, n) => (
      <>A {age}-year-old needs <strong>{range} mg</strong> of EPA + DHA a day ({fao}). <strong>{n} of these 10</strong> fit.</>
    ),
    pcs: (n) => `${n} ${n === 1 ? 'capsule' : 'capsules'}`,
    mg: (n) => `${n} mg`,
    noData: 'Not listed',
    badge: { ok: 'Meets the intake', short: 'Short even at max dose', nodata: 'DHA not listed' },
    none: 'None of the 10 fit these answers. Ask a pediatrician or pharmacist, or look at algal oil instead.',
    outTitle: (n) => `${n} that don’t fit`,
    why: (w, m) => ({ minAge: `Ages ${m}+ only`, noChew: 'Must be swallowed whole', noSwallow: 'Must be chewed, not swallowed whole', noMix: 'Brand doesn’t say it can be cut open into food', soy: 'Contains soy', peanut: 'Contains peanut', pork: 'Pork gelatin capsule', beef: 'Beef gelatin capsule' })[w],
    howTo: { swallowOrMix: 'Swallow, or cut open into food', chewMelt: 'Bite or chew until it melts', entericSwallow: 'Enteric capsule, swallow whole', smallSwallow: 'Small softgel, swallow whole', chewNoSwallow: 'Bite and chew, don’t swallow whole', chewWell: 'Chew well', cutOpen: 'Cut open', biteOpen: 'Bite open', chewOrSwallow: 'Chew or swallow whole', pierceMix: 'Pierce into juice or milk', chewSoftgel: 'Chewable softgel', chewOrSpread: 'Chew, or squeeze onto food' },
    foot: 'Capsules per day follow each brand’s label; monthly cost uses list price over 30 days. Check with a doctor if your child takes blood thinners.',
    faoLabel: 'FAO/WHO recommendation',
  },
  ja: {
    title: 'お子さんが飲めるのはどれ？',
    qAge: 'お子さんは何歳？',
    age: (a) => `${a}歳`,
    qWay: 'カプセルの飲み方は？',
    ways: { chew: '噛んで食べられる', swallow: 'そのまま飲み込める', mix: 'まだどちらも無理、食べ物に混ぜる' },
    qLimit: '食事の制限はありますか？',
    limits: { soy: '大豆アレルギー', peanut: 'ピーナッツアレルギー', pork: '豚を食べない', beef: '牛を食べない' },
    head: ['商品', '1日の量', '1日の摂取量', '1か月の目安', '飲み方'],
    summary: (age, range, fao, n) => (
      <>{age}歳の1日の目安は EPA＋DHA <strong>{range}mg</strong>（{fao}）。10商品のうち<strong>{n}商品</strong>が条件に合います。</>
    ),
    pcs: (n) => `${n}粒`,
    mg: (n) => `${n}mg`,
    noData: '公式サイトに記載なし',
    badge: { ok: '目安量を満たす', short: '上限まで飲んでも不足', nodata: 'DHA量の記載なし' },
    none: 'この条件に合う商品はありません。小児科医や薬剤師に相談するか、藻類由来のオイルも検討してください。',
    outTitle: (n) => `条件に合わない${n}商品`,
    why: (w, m) => ({ minAge: `${m}歳以上から`, noChew: 'そのまま飲み込むタイプで噛めない', noSwallow: '噛んで食べるタイプで丸飲み不可', noMix: '開けて食べ物に混ぜられるという記載なし', soy: '大豆を含む', peanut: 'ピーナッツを含む', pork: 'カプセルが豚ゼラチン', beef: 'カプセルが牛ゼラチン' })[w],
    howTo: { swallowOrMix: 'そのまま飲むか、開けて食べ物に混ぜる', chewMelt: '噛むか、溶けるまで噛む', entericSwallow: '腸溶カプセル、丸飲み', smallSwallow: '小粒ソフトカプセル、丸飲み', chewNoSwallow: '噛んで食べる、丸飲み不可', chewWell: 'よく噛む', cutOpen: '開けて食べる', biteOpen: 'そのまま噛む', chewOrSwallow: '噛むか丸飲み', pierceMix: '穴を開けてジュースや牛乳に混ぜる', chewSoftgel: '噛むソフトカプセル', chewOrSpread: '噛むか、食べ物に絞り出す' },
    foot: '粒数は各公式サイトの推奨量、1か月の費用は定価・30日で計算。抗凝固薬を飲んでいるお子さんは先に医師に相談してください。',
    faoLabel: 'FAO／WHOの推奨量',
  },
  ko: {
    title: '우리 아이가 먹을 수 있는 제품은?',
    qAge: '아이가 몇 살인가요?',
    age: (a) => `${a}세`,
    qWay: '캡슐을 어떻게 먹나요?',
    ways: { chew: '씹어서 먹어요', swallow: '통째로 삼켜요', mix: '아직 둘 다 못 해서 음식에 섞어요' },
    qLimit: '식이 제한이 있나요?',
    limits: { soy: '대두 알레르기', peanut: '땅콩 알레르기', pork: '돼지고기 안 먹음', beef: '소고기 안 먹음' },
    head: ['제품', '하루 섭취량', '하루 보충량', '한 달 약', '먹는 법'],
    summary: (age, range, fao, n) => (
      <>{age}세는 하루 EPA+DHA <strong>{range}mg</strong>이 필요합니다({fao}). 10개 제품 중 <strong>{n}개</strong>가 맞습니다.</>
    ),
    pcs: (n) => `${n}알`,
    mg: (n) => `${n}mg`,
    noData: '공식 사이트 미표기',
    badge: { ok: '권장량 충족', short: '최대량을 먹어도 부족', nodata: 'DHA 함량 미표기' },
    none: '이 조건에 맞는 제품이 없습니다. 소아과 의사나 약사와 상담하거나 조류 오일 제품을 살펴보세요.',
    outTitle: (n) => `조건에 맞지 않는 ${n}개`,
    why: (w, m) => ({ minAge: `${m}세 이상만 가능`, noChew: '통째로 삼켜야 하며 씹을 수 없음', noSwallow: '씹어 먹어야 하며 통째로 삼키면 안 됨', noMix: '잘라서 음식에 섞을 수 있다는 표기 없음', soy: '대두 함유', peanut: '땅콩 함유', pork: '캡슐이 돼지 젤라틴', beef: '캡슐이 소 젤라틴' })[w],
    howTo: { swallowOrMix: '삼키거나 잘라서 음식에 섞기', chewMelt: '깨물거나 녹을 때까지 씹기', entericSwallow: '장용성 캡슐, 통째로 삼키기', smallSwallow: '작은 소프트젤, 통째로 삼키기', chewNoSwallow: '깨물어 씹기, 통째로 삼키지 않기', chewWell: '충분히 씹기', cutOpen: '잘라서 먹기', biteOpen: '바로 깨물어 먹기', chewOrSwallow: '씹거나 통째로 삼키기', pierceMix: '구멍 내서 주스나 우유에 섞기', chewSoftgel: '씹는 소프트젤', chewOrSpread: '씹거나 음식 위에 짜서 먹기' },
    foot: '하루 알 수는 각 공식 사이트 권장량, 한 달 비용은 정가·30일 기준입니다. 항응고제를 복용 중인 아이는 먼저 의사와 상담하세요.',
    faoLabel: 'FAO/WHO 권장량',
  },
}

interface Match {
  p: FishOilProduct
  status: Status
  perDay: number
  intake: number | null
  monthly: number
}

function excludeReason(p: FishOilProduct, age: number, way: Way, limits: Limit[]): Why | null {
  if (p.minAge != null && age < p.minAge) return 'minAge'
  if (way === 'chew' && !p.chew) return 'noChew'
  if (way === 'swallow' && !p.swallow) return 'noSwallow'
  if (way === 'mix' && !p.mix) return 'noMix'
  if (limits.includes('soy') && p.allergens.includes('soy')) return 'soy'
  if (limits.includes('peanut') && p.allergens.includes('peanut')) return 'peanut'
  if (limits.includes('pork') && p.gelatin === 'pork') return 'pork'
  if (limits.includes('beef') && p.gelatin === 'beef') return 'beef'
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

const BADGE_CLS: Record<Status, string> = {
  ok: 'bg-emerald-50 text-emerald-700',
  short: 'bg-amber-50 text-amber-700',
  nodata: 'bg-gray-100 text-gray-600',
}

/** 中文、日文顯示中文原名（日文譯文的慣例），英文、韓文顯示英文／韓文名；產品名只在中文版列出 */
function brandOf(p: FishOilProduct, lang: Lang) {
  return lang === 'en' || lang === 'ko' ? p.names[lang] : p.brand
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 text-[15px] font-bold text-gray-900">{title}</legend>
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

export default function KidsFishOilCalculator({ lang = 'zh' }: { lang?: Lang }) {
  const t = S[lang]
  const [age, setAge] = useState(6)
  const [way, setWay] = useState<Way>('chew')
  const [limits, setLimits] = useState<Limit[]>([])
  const toggle = (k: Limit) => {
    track('kfo_answer', { question: 'limit', value: k, lang })
    setLimits((xs) => (xs.includes(k) ? xs.filter((x) => x !== k) : [...xs, k]))
  }

  const target = dailyTarget(age)
  const range = target.low === target.high ? `${target.low}` : `${target.low}～${target.high}`
  const order: Record<Status, number> = { ok: 0, short: 1, nodata: 2 }
  const fits: Match[] = []
  const out: { p: FishOilProduct; why: Why }[] = []
  for (const p of KIDS_FISH_OIL) {
    const why = excludeReason(p, age, way, limits)
    if (why) out.push({ p, why })
    else fits.push(match(p, age))
  }
  fits.sort((a, b) => order[a.status] - order[b.status] || a.monthly - b.monthly)
  const fao = (
    <a href={FAO_WHO_URL} target="_blank" rel="noopener" className="text-[#0369a1] underline">
      {t.faoLabel}
    </a>
  )

  return (
    <section className="not-prose my-8 rounded-2xl border border-[#bae6fd] bg-[#f8fcff] p-5 sm:p-6" aria-labelledby="kfo-form-title">
      <h2 id="kfo-form-title" className="m-0 mb-5 text-xl font-bold text-[#0369a1]">
        {t.title}
      </h2>

      <div className="space-y-5">
        <Step title={t.qAge}>
          {AGES.map((a) => (
            <Chip key={a} on={a === age} onClick={() => { track('kfo_answer', { question: 'age', value: a, lang }); setAge(a) }}>{t.age(a)}</Chip>
          ))}
        </Step>
        <Step title={t.qWay}>
          {(Object.keys(t.ways) as Way[]).map((w) => (
            <Chip key={w} on={w === way} onClick={() => { track('kfo_answer', { question: 'way', value: w, lang }); setWay(w) }}>{t.ways[w]}</Chip>
          ))}
        </Step>
        <Step title={t.qLimit}>
          {(Object.keys(t.limits) as Limit[]).map((l) => (
            <Chip key={l} role="checkbox" on={limits.includes(l)} onClick={() => toggle(l)}>{t.limits[l]}</Chip>
          ))}
        </Step>
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-[#e6e2da]">
        <p className="m-0 text-[15px] leading-relaxed text-gray-800">{t.summary(age, range, fao, fits.length)}</p>

        {fits.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-[15px]">
              <thead>
                <tr className="bg-[#0284c7] text-left text-white">
                  {t.head.map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fits.map((m, i) => (
                  <tr key={m.p.brand} className={i % 2 ? 'bg-white' : 'bg-[#F7F9FC]'}>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5">
                      <a href={m.p.url} target="_blank" rel="noopener" onClick={() => track('kfo_product_click', { brand: m.p.brand, position: i + 1, age, way, lang })} className="font-semibold text-[#0369a1] hover:underline">
                        {brandOf(m.p, lang)}
                      </a>
                      {lang === 'zh' && <span className="block text-[13px] text-gray-500">{m.p.name}</span>}
                      <span className={`mt-1 block w-fit rounded px-1.5 py-0.5 text-xs font-medium ${BADGE_CLS[m.status]}`}>{t.badge[m.status]}</span>
                    </td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">{t.pcs(m.perDay)}</td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">{m.intake == null ? t.noData : t.mg(m.intake)}</td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5 whitespace-nowrap">NT${m.monthly.toLocaleString('en-US')}</td>
                    <td className="border-t border-[#e6e2da] px-3 py-2.5 text-[14px]">{t.howTo[m.p.howTo(age)]}</td>
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
            <summary className="cursor-pointer font-medium text-gray-700">{t.outTitle(out.length)}</summary>
            <ul className="mt-2 mb-0 list-disc pl-5">
              {out.map((o) => (
                <li key={o.p.brand}>{brandOf(o.p, lang)}{lang === 'zh' ? ` ${o.p.name}` : ''}{lang === 'en' ? ': ' : '：'}{t.why(o.why, o.p.minAge)}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <p className="mt-3 mb-0 text-[13px] leading-relaxed text-gray-500">{t.foot}</p>
    </section>
  )
}
