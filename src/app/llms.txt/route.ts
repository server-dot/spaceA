import { fetchQuery } from '@/lib/graphql/client'
import { GET_NAVIGATION } from '@/lib/graphql/queries/navigation'
import { GET_LLMS_ARTICLES } from '@/lib/graphql/queries/llms'
import { resolveSummary, stripHtml } from '@/lib/format'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import { LANGS, articleHref, categoryHref, langOfCategorySlug, langPrefix, ui } from '@/lib/i18n'

export const revalidate = 3600

interface NavigationData {
  categories: {
    nodes: Array<{ name: string; slug: string }>
  }
}

interface LlmsArticle {
  title: string
  slug: string
  excerpt: string | null
  modified: string
  categories: { nodes: Array<{ name: string; slug: string }> }
  seo?: { metaDesc?: string | null } | null
}

interface LlmsArticlesData {
  posts: { nodes: LlmsArticle[] }
}

// 一篇文章一行：標題、網址、一句摘要（吃校稿寫的 excerpt，沒有就用 Yoast 描述），最後更新日
function articleLine(lang: (typeof LANGS)[number], post: LlmsArticle) {
  const cat = post.categories.nodes[0]
  if (!cat) return ''
  const summary = resolveSummary(post.excerpt, post.seo?.metaDesc) || stripHtml(post.excerpt ?? '')
  const brief = summary.replace(/\s+/g, ' ').slice(0, 120)
  const date = (post.modified || '').slice(0, 10)
  return `- [${stripHtml(post.title)}](${SITE_URL}${articleHref(lang, cat.slug, post.slug)})${brief ? `: ${brief}` : ''}${date ? `（${date}）` : ''}`
}

export async function GET() {
  const data = await fetchQuery<NavigationData>(GET_NAVIGATION)
  const articleData = await fetchQuery<LlmsArticlesData>(GET_LLMS_ARTICLES)
  const allArticles = (articleData?.posts?.nodes ?? []).filter((p) => {
    const cat = p.categories.nodes[0]
    return cat && !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug)
  })
  const articleLines = (lang: (typeof LANGS)[number]) =>
    allArticles
      .filter((p) => langOfCategorySlug(p.categories.nodes[0].slug) === lang)
      .map((p) => articleLine(lang, p))
      .filter(Boolean)
      .join('\n')
  const allCategories = (data?.categories?.nodes ?? []).filter((cat) => !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug))
  const byLang = (lang: (typeof LANGS)[number]) => allCategories.filter((cat) => langOfCategorySlug(cat.slug) === lang)
  const lines = (lang: (typeof LANGS)[number]) =>
    byLang(lang)
      .map((cat) => `- [${cat.name}](${SITE_URL}${categoryHref(lang, cat.slug)})`)
      .join('\n')

  const categoryLines = lines('zh') || '- （分類資料暫時無法取得）'

  // 其他語言各自一段，沒有分類就整段不輸出（避免列出空清單）
  const OTHER_LANG_HEADING: Record<string, string> = {
    en: 'English',
    ja: '日本語',
    ko: '한국어',
  }
  const otherLangSections = LANGS.filter((l) => l !== 'zh')
    .map((lang) => {
      const list = lines(lang)
      if (!list) return ''
      const articles = articleLines(lang)
      return `
## ${OTHER_LANG_HEADING[lang]}

> ${ui(lang).siteDescription}

- [${ui(lang).home}](${SITE_URL}${langPrefix(lang)})
${list}
${articles ? `\n${articles}\n` : ''}`
    })
    .join('')

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} 由專業 SEO 團隊營運，為各行各業撰寫精選推薦文章，並提供依實際閱讀數據排序的熱門排行。
本站有繁體中文、英文、日文、韓文四個語言版本，內容相同，網址前綴分別是 /、/en、/ja、/ko。

## 全文版

- [llms-full.txt](${SITE_URL}/llms-full.txt): 全站文章純文字全文（四語），一次抓完不用逐頁爬

## 熱門內容

- [熱門排行](${SITE_URL}/popular): 依實際閱讀數據排序的推薦文章排行，每週一更新

## 分類

${categoryLines}

## 文章

${articleLines('zh') || '- （文章資料暫時無法取得）'}

## 關於

- [關於我們與編輯方針](${SITE_URL}/about): 推薦內容如何產生、廣告版面與推薦內容怎麼分開、排行如何計算
- [聯絡我們](${SITE_URL}/contact)
- [隱私權政策](${SITE_URL}/privacy)
- [使用條款](${SITE_URL}/terms)
${otherLangSections}`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
