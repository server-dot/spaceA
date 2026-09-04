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

function cutSection(html: string, heading: string): { block: string; rest: string } | null {
  const re = new RegExp(`<h2[^>]*>\\s*${heading}\\s*</h2>([\\s\\S]*?)(?=<h2[\\s>]|$)`, 'i')
  const match = html.match(re)
  if (!match || match.index === undefined) return null
  const block = match[1]
  const rest = html.slice(0, match.index) + html.slice(match.index + match[0].length)
  return { block, rest }
}

function extractConclusion(html: string): { conclusion: ParsedArticleContent['conclusion']; rest: string } {
  const cut = cutSection(html, '結論')
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

function extractFaq(html: string): { faq: FaqItem[] | null; rest: string } {
  const cut = cutSection(html, '常見問題')
  if (!cut) return { faq: null, rest: html }

  const pairs = [
    ...cut.block.matchAll(/<h3[^>]*>\s*Q[:：]?\s*([\s\S]*?)<\/h3>\s*<p[^>]*>\s*A[:：]?\s*([\s\S]*?)<\/p>/gi),
  ]
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

  const withoutLegacyToc = stripLegacyToc(html)
  const { conclusion, rest: afterConclusion } = extractConclusion(withoutLegacyToc)
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
