import type { ComponentType } from 'react'
import BrokenImageFallback from './BrokenImageFallback'
import SvgTextFit from './SvgTextFit'
import KidsFishOilCalculator from '@/components/tools/KidsFishOilCalculator'

interface ArticleBodyProps {
  content: string
}

/** WP 內文放 <div data-spacea-tool="名稱"></div>，前台在那個位置換成對應的互動元件 */
const TOOLS: Record<string, ComponentType> = {
  'kids-fish-oil': KidsFishOilCalculator,
}

const TOOL_MARKER = /<div data-spacea-tool="([a-z0-9-]+)"><\/div>/g
const BLOCK_TAG = /<(\/?)(div|section|article)\b[^>]*>/g

/**
 * 內文整段包在 <div class="ai-article-body"> 裡，直接從中間切開會讓前半段少了結尾、後半段少了開頭
 * （後半段的 h2/h3 也會失去 .ai-article-body 的樣式）。切開時把當下還沒關的區塊標籤補關、下一段再補開。
 */
function splitAtTools(html: string) {
  const parts: { html: string; tool?: string }[] = []
  let open: string[] = []
  let last = 0
  for (const m of html.matchAll(TOOL_MARKER)) {
    if (!TOOLS[m[1]]) continue
    const chunk = html.slice(last, m.index)
    const before = open.join('')
    for (const t of chunk.matchAll(BLOCK_TAG)) {
      if (t[1]) open.pop()
      else open.push(t[0])
    }
    const closers = open.map((t) => `</${t.match(/^<(\w+)/)![1]}>`).reverse().join('')
    parts.push({ html: before + chunk + closers })
    parts.push({ html: '', tool: m[1] })
    last = m.index + m[0].length
    open = [...open]
  }
  parts.push({ html: open.join('') + html.slice(last) })
  return parts
}

const PROSE =
  'prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl'

export default function ArticleBody({ content }: ArticleBodyProps) {
  const parts = splitAtTools(content ?? '')
  return (
    <>
      <BrokenImageFallback />
      <SvgTextFit />
      {parts.map((p, i) => {
        if (p.tool) {
          const Tool = TOOLS[p.tool]
          return <Tool key={i} />
        }
        return <div key={i} className={PROSE} dangerouslySetInnerHTML={{ __html: p.html }} />
      })}
    </>
  )
}
