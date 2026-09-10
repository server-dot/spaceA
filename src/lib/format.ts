export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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
  if (/^目錄[\s　]/.test(text)) return true
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
