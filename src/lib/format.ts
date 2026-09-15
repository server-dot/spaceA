import { LANG_TAG, type Lang } from '@/lib/i18n'

export function formatDate(dateString: string, lang: Lang = 'zh') {
  return new Date(dateString).toLocaleDateString(LANG_TAG[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 這個語言是不是用空白斷詞。中文與日文沒有空白，字數要數字元；英文與韓文數單字。
 * 字數統計（wordCount）與閱讀時間都吃這個判斷。
 */
export function isSpaceSeparated(lang: Lang) {
  return lang === 'en' || lang === 'ko'
}

/** 內文純文字的長度，中日數字元、英韓數單字 */
export function countWords(html: string, lang: Lang) {
  const text = html.replace(/<[^>]*>/g, '')
  if (isSpaceSeparated(lang)) return text.split(/\s+/).filter(Boolean).length
  return text.replace(/\s+/g, '').length
}

export function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/g, '’')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
}

// WordPress 沒填摘要時會自動截前 55 字當 excerpt。StackTool 生成的推薦文開頭就是目錄，
// 自動摘要因此變成「目錄 委託外包還是⋯ […]」這種沒有意義的字串。
// 這裡把自動截斷的摘要判掉，交給呼叫端改用 Yoast 描述或整段不顯示。
export function isAutoExcerpt(excerpt: string) {
  const text = stripHtml(excerpt).trim()
  if (!text) return true
  // 自動摘要一定以 WordPress 的截斷符號收尾（[…] / [&hellip;] / …）
  if (/(\[\s*(…|\.\.\.)\s*\]|\[&hellip;\])\s*$/.test(text)) return true
  // 開頭就是目錄區塊的殘留
  if (/^(目錄|Table of Contents|Contents)[\s　]/i.test(text)) return true
  return false
}

// 文章列表／詳情頁要顯示的一句話摘要：優先用 Yoast 填的描述，
// 沒填才退回 WordPress excerpt，兩者都不可用就回空字串（呼叫端整段不渲染）
export function resolveSummary(
  excerpt: string | null | undefined,
  seoDesc?: string | null
) {
  const desc = (seoDesc ?? '').trim()
  if (desc) return desc
  const raw = (excerpt ?? '').trim()
  if (!raw || isAutoExcerpt(raw)) return ''
  return stripHtml(raw)
}

// Yoast 產的標題結尾會掛 WordPress 站名（「… - 推薦網」），前端 layout 又會再接
// 「| spaceA」，變成一個標題兩個品牌後綴。渲染前先把 WordPress 那組拿掉。
const WP_SITE_SUFFIX = /\s*[-–—|｜]\s*推薦網\s*$/
export function stripWpSiteSuffix(title: string | null | undefined) {
  return (title ?? '').replace(WP_SITE_SUFFIX, '').trim()
}
