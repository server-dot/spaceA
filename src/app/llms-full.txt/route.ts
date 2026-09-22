import { fetchQuery } from '@/lib/graphql/client'
import { GET_LLMS_FULL_ARTICLES } from '@/lib/graphql/queries/llms-full'
import { resolveSummary, stripHtml } from '@/lib/format'
import { cleanUpstreamHtml } from '@/lib/content-parsers'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import { LANGS, articleHref, langOfCategorySlug, ui } from '@/lib/i18n'

export const revalidate = 3600

interface LlmsFullArticle {
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  date: string
  modified: string
  categories: { nodes: Array<{ name: string; slug: string }> }
  seo?: { metaDesc?: string | null } | null
}

interface LlmsFullArticlesData {
  posts: { nodes: LlmsFullArticle[] }
}

const LANG_HEADING: Record<(typeof LANGS)[number], string> = {
  zh: '繁體中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
}

/**
 * 內文 HTML 轉成純文字版 Markdown。只保留對模型有用的結構：標題層級、段落、清單、表格列、連結網址。
 * 卡片的 <style>、封面 SVG、手寫目錄全部丟掉；連結保留網址（品牌官網與參考資料是引用時最需要的）。
 */
function htmlToText(html: string): string {
  let s = cleanUpstreamHtml(html)
    .replace(/<(style|script|svg|nav)[^>]*>[\s\S]*?<\/\1>/gi, '')
    // 卡片的排名數字與「小編點評」標籤：數字併進 h3 前面，標籤補冒號，不然會跟正文黏在一起
    .replace(/<span class="card-badge">(\d+)<\/span>\s*<h3[^>]*>([\s\S]*?)<\/h3>/gi, '<h3>$1. $2</h3>')
    .replace(/<span class="lbl">([\s\S]*?)<\/span>/gi, '$1：')
    .replace(/<p class="col-title">([\s\S]*?)<\/p>/gi, '\n$1：')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<img[^>]*>/gi, '')
    // 卡片的 dt／dd 是「欄位：值」，攤成一行
    .replace(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi, '\n- $1：$2')
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, (_, row: string) => {
      const cells = [...row.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((m) => stripHtml(m[1]).trim())
      return `\n| ${cells.join(' | ')} |`
    })
    .replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href: string, text: string) => {
      const label = stripHtml(text).trim()
      const url = href.replace(/&amp;/g, '&')
      return label && /^https?:\/\//i.test(url) ? `${label}（${url}）` : label
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|blockquote|details|summary|dl)>/gi, '\n')
  s = stripHtml(s)
  return s
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line, i, arr) => line !== '' || (i > 0 && arr[i - 1] !== ''))
    .join('\n')
    .trim()
}

function articleBlock(lang: (typeof LANGS)[number], post: LlmsFullArticle) {
  const cat = post.categories.nodes[0]
  const url = `${SITE_URL}${articleHref(lang, cat.slug, post.slug)}`
  const summary = resolveSummary(post.excerpt, post.seo?.metaDesc) || stripHtml(post.excerpt ?? '')
  const lines = [
    `# ${stripHtml(post.title)}`,
    '',
    `- URL: ${url}`,
    `- Category: ${cat.name}`,
    `- Published: ${(post.date || '').slice(0, 10)}`,
    `- Updated: ${(post.modified || '').slice(0, 10)}`,
    `- Author: ${ui(lang).editorName}, ${SITE_NAME}`,
  ]
  if (summary) lines.push(`- Summary: ${summary.replace(/\s+/g, ' ')}`)
  lines.push('', htmlToText(post.content ?? ''))
  return lines.join('\n')
}

export async function GET() {
  const data = await fetchQuery<LlmsFullArticlesData>(GET_LLMS_FULL_ARTICLES)
  const articles = (data?.posts?.nodes ?? []).filter((p) => {
    const cat = p.categories.nodes[0]
    return cat && !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug)
  })

  const sections = LANGS.map((lang) => {
    const blocks = articles
      .filter((p) => langOfCategorySlug(p.categories.nodes[0].slug) === lang)
      .map((p) => articleBlock(lang, p))
    if (blocks.length === 0) return ''
    return `\n\n---\n\n# ${LANG_HEADING[lang]}\n\n${blocks.join('\n\n---\n\n')}`
  }).join('')

  const body = `# ${SITE_NAME} — full text

> ${SITE_DESCRIPTION}

This file contains the full text of every published article on ${SITE_URL}, in all four language versions (zh-TW, en, ja, ko).
Each article lists its canonical URL, category, publish/update dates and author before the body. Site index: ${SITE_URL}/llms.txt
${sections}
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
