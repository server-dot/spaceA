import { stripHtml } from '@/lib/format'

export interface BrandFact {
  name: string
  value: string
}

export type BrandEntityType =
  | 'Product'
  | 'Hotel'
  | 'Dentist'
  | 'MedicalClinic'
  | 'ProfessionalService'
  | 'LocalBusiness'
  | 'TouristAttraction'

export interface BrandOffer {
  currency: string
  price: number
}

export interface BrandListItem {
  name: string
  url?: string
  image?: string
  /** 結構化資料的類型，依卡片第一欄「○○定位」判斷 */
  type: BrandEntityType
  /** 小編點評全文 */
  description?: string
  /** 卡片上每一欄（規格、網友評價、使用感受…），原文照抄 */
  facts: BrandFact[]
  /** 價格欄原文；店家類型放 priceRange 用 */
  priceText?: string
  /** 價格欄抓得到明確金額才有 */
  offer?: BrandOffer
}

/** 卡片第一欄的標籤決定這一家是商品、店家還是景點（四語） */
const SERVICE_LABELS = ['服務定位', 'Service positioning', 'サービスの位置づけ', '서비스 포지셔닝']
const CLINIC_LABELS = ['診所定位']
const SPOT_LABELS = ['景點定位', 'About the spot', '観光地の位置づけ', '관광지 포지셔닝']

/** 價格那一欄的標籤（四語） */
const PRICE_LABELS = [
  '產品價格', '官網價格', '收費模式', '隆鼻費用', '門票',
  'Price', 'Official price', 'Pricing', 'Admission',
  '価格', '公式価格', '料金体系', '入場料',
  '가격', '공식 가격', '요금 체계', '입장료',
]

/**
 * 從 StackTool 推薦文的品牌卡片（.brand-card）抓出每一家的完整資料，給 ItemList 結構化資料用。
 * 卡片上寫什麼就帶什麼（小編點評、規格欄、網友正負評、使用感受），不另外推算；
 * GEO 引擎讀的是機器可讀的事實，內文寫得再細，沒標出來它也只能自己猜。
 * 沒有卡片（手寫的選購指南）就回空陣列，呼叫端不輸出 schema。
 */
export function extractBrandList(html: string, postSlug = ''): BrandListItem[] {
  const cards = html.split(/<div class="brand-card">/).slice(1)
  const items: BrandListItem[] = []
  for (const card of cards) {
    const name = card.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)?.[1]
    if (!name) continue
    const url = card.match(/class="ref-link"><a href="([^"]+)"/)?.[1]
    const image = card.match(/<div class="card-hero">[\s\S]*?<img[^>]*src="([^"]+)"/)?.[1]
    const verdict = card.match(/<div class="verdict">\s*<span class="lbl">[\s\S]*?<\/span>([\s\S]*?)<\/div>/)?.[1]

    const facts: BrandFact[] = []
    for (const m of card.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)) {
      facts.push({ name: clean(m[1]), value: cleanList(m[2]) })
    }
    // 網友正面／負面評價兩欄
    for (const m of card.matchAll(/<p class="col-title">([\s\S]*?)<\/p>\s*<ul>([\s\S]*?)<\/ul>/g)) {
      facts.push({ name: clean(m[1]), value: cleanList(m[2]) })
    }
    // 「實際使用感受：」「回購傾向：」這類粗體標題段落
    for (const m of card.matchAll(/<p class="repurchase-line"><strong>([\s\S]*?)<\/strong>([\s\S]*?)<\/p>/g)) {
      facts.push({ name: clean(m[1]).replace(/[：:]\s*$/, ''), value: clean(m[2]) })
    }
    const usable = facts.filter((f) => f.name && f.value)

    const priceText = usable.find((f) => PRICE_LABELS.includes(f.name))?.value
    items.push({
      name: clean(name),
      url: url || undefined,
      image: image || undefined,
      type: entityType(usable[0]?.name, postSlug),
      description: verdict ? clean(verdict) : undefined,
      facts: usable,
      priceText,
      offer: priceText ? parseOffer(priceText) : undefined,
    })
  }
  return items
}

function entityType(firstLabel: string | undefined, postSlug: string): BrandEntityType {
  if (firstLabel && SPOT_LABELS.includes(firstLabel)) return 'TouristAttraction'
  if (firstLabel && CLINIC_LABELS.includes(firstLabel)) return 'MedicalClinic'
  if (firstLabel && SERVICE_LABELS.includes(firstLabel)) {
    // 服務類卡片的對象是店家本身；細分類型看文章主題
    if (/hotel/.test(postSlug)) return 'Hotel'
    if (/dental/.test(postSlug)) return 'Dentist'
    if (/agency|marketing/.test(postSlug)) return 'ProfessionalService'
    return 'LocalBusiness'
  }
  // 舊版卡片沒有「定位」欄，從文章主題補判
  if (!firstLabel) {
    if (/hotel/.test(postSlug)) return 'Hotel'
    if (/agency|marketing/.test(postSlug)) return 'ProfessionalService'
  }
  return 'Product'
}

/**
 * 價格欄寫在最前面的金額就是卡片主打的價格（「NT$980／8 入（每入約 NT$123）」取 980）；
 * 不取最低／最高，後面常接每入換算、兒童票、加購價，拿來當區間會失真。
 * NT$／TWD／「○○ 元」算台幣，A$ 算澳幣；後面接「萬／万／만」的不收（NT$35万 會被誤讀成 35 元）。
 * 抓不到就不輸出 offers。
 */
function parseOffer(text: string): BrandOffer | undefined {
  const patterns: { currency: string; re: RegExp }[] = [
    { currency: 'AUD', re: /A\$\s?([\d,]+(?:\.\d+)?)(?![\d,]*\s*[萬万만])/g },
    { currency: 'TWD', re: /(?:NT\$|TWD)\s?([\d,]+(?:\.\d+)?)(?![\d,]*\s*[萬万만])/g },
    { currency: 'TWD', re: /([\d,]+(?:\.\d+)?)\s*元/g },
  ]
  let best: (BrandOffer & { at: number }) | undefined
  for (const { currency, re } of patterns) {
    for (const m of text.matchAll(re)) {
      const price = Number(m[1].replace(/,/g, ''))
      if (!Number.isFinite(price) || price <= 0) continue
      if (!best || m.index < best.at) best = { currency, price, at: m.index }
      break
    }
  }
  if (best) return { currency: best.currency, price: best.price }
  return undefined
}

function clean(html: string) {
  return stripHtml(html).replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
}

/** <li> 清單攤平成「；」分隔的一行 */
function cleanList(html: string) {
  if (!/<li/.test(html)) return clean(html)
  return [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)]
    .map((m) => clean(m[1]))
    .filter(Boolean)
    .join('；')
}
