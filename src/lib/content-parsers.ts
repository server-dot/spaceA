export interface FaqItem {
  question: string
  answer: string
}

export interface HowToStepItem {
  name: string
  text: string
}

export interface ParseArticleContentOptions {
  /**
   * 是否把「H2 底下接一個 <ol>」解析成判斷標準/步驟（HowTo）。
   * 只給知識分享用——推薦文的 <ol> 通常是排名清單，不是操作步驟，
   * 硬套 HowTo 會誤用結構化資料，也會把清單內容從正文裡挖走。
   */
  extractHowTo?: boolean
  /** 是否解析「這篇怎麼寫出來的」區塊，只給知識分享用（推薦文用固定的業配揭露文字）*/
  extractProvenance?: boolean
}

export interface ParsedArticleContent {
  conclusion: { body: string; takeaways: string[] } | null
  faq: FaqItem[] | null
  howTo: { sectionTitle: string; steps: HowToStepItem[] } | null
  provenance: string[] | null
  toc: { id: string; label: string }[]
  /** 抽掉「結論」「常見問題」「這篇怎麼寫出來的」區塊、並幫剩餘 H2 補上錨點 id 之後的內文，交給既有的 prose 樣式渲染 */
  bodyHtml: string
}

function stripTags(html: string) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // 內容裡的換行與縮排在純文字欄位（結論、FAQ）會變成多餘空白，統一收成單一空格
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * StackTool 生成的文章常常自帶一個手寫的 <nav class="toc"> 目錄區塊。
 * 前端會用 injectTocAnchors 自動產生「本篇目錄」，兩個疊在一起會重複顯示，
 * 所以進解析前一律先拿掉舊的手寫目錄。
 */
function stripLegacyToc(html: string): string {
  return html.replace(/<nav[^>]*\bclass="toc"[^>]*>[\s\S]*?<\/nav>\s*/i, '')
}

/**
 * StackTool 生成的文章會在 `post.content` 裡自己塞一段 `<style>`，用 `.ai-article-body h2/h3`
 * 覆寫標題樣式（藍字＋底線／左側線）。那組選擇器跟站上 `globals.css` 的 `.prose h2/h3`
 * 權重相同，而內容裡的 style 出現在後面，於是「顏色、字級、邊距」吃 StackTool 的、
 * 「藍色底、✓ 前綴」吃站上的，混在一起變成深藍字壓在藍底上。
 * 這裡只挑掉那兩條標題規則，其餘（.brand-card、.faq-container）是 StackTool 元件要用的，保留。
 */
function stripUpstreamHeadingStyles(html: string): string {
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, (block) =>
    block.replace(/\.ai-article-body\s+h[23]\s*\{[^}]*\}\s*/gi, '')
  )
}

/**
 * StackTool 會在內文塞一塊自己的「編者介紹」：小標是純樣式的 `<p>`（不是 heading），
 * 後面接 `.author-block`。因為小標不是 h2，`cutSection('結論')` 抓「結論到下一個 h2」時
 * 會把整塊編者介紹一起吃進去，`<p>` 全被串成結論內文——這就是結論框裡混進自介的原因。
 * 站上每篇文章末尾本來就會渲染自己的編輯介紹（EDITOR_NAME），內文這塊是重複的，
 * 而且人設常常跟文章主題無關，所以整塊挑掉。
 */
function stripUpstreamAuthorBlock(html: string): string {
  return html
    .replace(/<p[^>]*>\s*編者介紹\s*<\/p>\s*/gi, '')
    .replace(/<div[^>]*\bclass="author-block"[^>]*>[\s\S]*?<\/div>\s*/gi, '')
}

function cutSection(html: string, heading: string): { block: string; rest: string } | null {
  const re = new RegExp(`<h2[^>]*>\\s*${heading}\\s*</h2>([\\s\\S]*?)(?=<h2[\\s>]|$)`, 'i')
  const match = html.match(re)
  if (!match || match.index === undefined) return null
  const block = match[1]
  const rest = html.slice(0, match.index) + html.slice(match.index + match[0].length)
  return { block, rest }
}

/**
 * 結論區塊的 h2 標題寫法：選購指南寫「結論」，StackTool 推薦文寫「總結」而且放在文末。
 * 兩種都認，把結論前置到「先看結論」框裡（對 GEO 有利，讀者也不用捲到最後）。
 */
const CONCLUSION_HEADING_PATTERN = '(?:結論|總結)'

function extractConclusion(html: string): { conclusion: ParsedArticleContent['conclusion']; rest: string } {
  const cut = cutSection(html, CONCLUSION_HEADING_PATTERN)
  if (!cut) return { conclusion: null, rest: html }

  const paragraphs = [...cut.block.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => stripTags(m[1]))
  const takeaways = [...cut.block.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => stripTags(m[1]))

  if (paragraphs.length === 0 && takeaways.length === 0) {
    return { conclusion: null, rest: html }
  }

  return {
    conclusion: { body: paragraphs.join(' '), takeaways },
    rest: cut.rest,
  }
}

/** FAQ 區塊的 h2 標題寫法：選購指南用「常見問題」，StackTool 推薦文用「FAQ」 */
const FAQ_HEADING_PATTERN = '(?:常見問題|常見問答|FAQ)'

function extractFaq(html: string): { faq: FaqItem[] | null; rest: string } {
  const cut = cutSection(html, FAQ_HEADING_PATTERN)
  if (!cut) return { faq: null, rest: html }

  // 選購指南／準備清單文的約定格式：<h3>Q：…</h3> 緊接 <p>A：…</p>
  const headingPairs = [
    ...cut.block.matchAll(/<h3[^>]*>\s*Q[:：]?\s*([\s\S]*?)<\/h3>\s*<p[^>]*>\s*A[:：]?\s*([\s\S]*?)<\/p>/gi),
  ]
  // StackTool 推薦文的格式：<details class="faq-item"> 手風琴，
  // 問題在 .question-text、答案在 .answer-container（都是 div，不是 h3/p）
  const accordionPairs = [
    ...cut.block.matchAll(
      /<div[^>]*\bclass="question-text"[^>]*>([\s\S]*?)<\/div>[\s\S]*?<div[^>]*\bclass="answer-container"[^>]*>([\s\S]*?)<\/div>/gi
    ),
  ]

  const pairs = headingPairs.length > 0 ? headingPairs : accordionPairs
  if (pairs.length === 0) return { faq: null, rest: html }

  return {
    faq: pairs.map((m) => ({ question: stripTags(m[1]), answer: stripTags(m[2]) })),
    rest: cut.rest,
  }
}

function extractProvenance(html: string): { provenance: string[] | null; rest: string } {
  const cut = cutSection(html, '這篇怎麼寫出來的')
  if (!cut) return { provenance: null, rest: html }

  const paragraphs = [...cut.block.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => stripTags(m[1]))
  if (paragraphs.length === 0) return { provenance: null, rest: html }

  return { provenance: paragraphs, rest: cut.rest }
}

function injectTocAnchors(html: string): { html: string; toc: ParsedArticleContent['toc'] } {
  const toc: ParsedArticleContent['toc'] = []
  let index = 0
  const withIds = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (full, attrs: string, inner: string) => {
    const label = stripTags(inner)
    if (!label) return full
    // H2 可能已經帶著上游（StackTool）指派的 id（例如 toc-2）——目錄連結必須指向那個既有 id，
    // 不能另外生一個 section-N 塞進目錄卻不套用在標籤上，不然點目錄會連不到對應段落
    const existingId = attrs.match(/\bid="([^"]+)"/)?.[1]
    let id = existingId
    let newAttrs = attrs
    if (!id) {
      index += 1
      id = `section-${index}`
      newAttrs = `${attrs} id="${id}"`
    }
    toc.push({ id, label })
    return `<h2${newAttrs}>${inner}</h2>`
  })
  return { html: withIds, toc }
}

function extractHowTo(html: string): { howTo: ParsedArticleContent['howTo']; rest: string } {
  // 找第一個「H2 底下接一個 <ol>，且每個 <li> 至少 2 項」的區塊，當作步驟/判斷標準
  const match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>\s*(?:<p[^>]*>[\s\S]*?<\/p>\s*)*<ol[^>]*>([\s\S]*?)<\/ol>/i)
  if (!match || match.index === undefined) return { howTo: null, rest: html }

  const sectionTitle = stripTags(match[1])
  const items = [...match[2].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1])
  if (items.length < 2) return { howTo: null, rest: html }

  const steps = items.map((item) => {
    const strongMatch = item.match(/<strong>([\s\S]*?)<\/strong>\s*[:：]?\s*/i)
    if (strongMatch) {
      return {
        name: stripTags(strongMatch[1]),
        text: stripTags(item.replace(strongMatch[0], '')),
      }
    }
    const text = stripTags(item)
    return { name: text.slice(0, 24), text }
  })

  const rest = html.slice(0, match.index) + html.slice(match.index + match[0].length)
  return { howTo: { sectionTitle, steps }, rest }
}

export const HOWTO_SECTION_ID = 'criteria-section'
export const FAQ_SECTION_ID = 'faq-section'

export function parseArticleContent(
  html: string,
  options: ParseArticleContentOptions = {}
): ParsedArticleContent {
  const { extractHowTo: shouldExtractHowTo = true, extractProvenance: shouldExtractProvenance = true } = options

  const cleaned = stripUpstreamAuthorBlock(stripUpstreamHeadingStyles(stripLegacyToc(html)))
  const { conclusion, rest: afterConclusion } = extractConclusion(cleaned)
  const { faq, rest: afterFaq } = extractFaq(afterConclusion)
  const { provenance, rest: afterProvenance } = shouldExtractProvenance
    ? extractProvenance(afterFaq)
    : { provenance: null, rest: afterFaq }
  const { howTo, rest: afterHowTo } = shouldExtractHowTo
    ? extractHowTo(afterProvenance)
    : { howTo: null, rest: afterProvenance }
  const { html: bodyHtml, toc } = injectTocAnchors(afterHowTo)

  if (howTo) {
    toc.unshift({ id: HOWTO_SECTION_ID, label: howTo.sectionTitle })
  }
  if (faq) {
    toc.push({ id: FAQ_SECTION_ID, label: '常見問題' })
  }

  return { conclusion, faq, howTo, provenance, toc, bodyHtml }
}
