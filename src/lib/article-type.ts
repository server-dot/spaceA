import { ARTICLE_TYPE_LABELS, DEFAULT_ARTICLE_TYPE_SLUG } from '@/lib/constants'
import { WPArticleType } from '@/types/wordpress'

/**
 * 沒有設定 article_type 的文章（taxonomy 尚未在 WP 建立，或該篇忘記選）
 * 一律當作既有的「推薦文」，避免舊文章因為缺欄位而跑版或掉 schema。
 */
export function resolveArticleType(articleTypes?: { nodes: WPArticleType[] }): WPArticleType {
  const found = articleTypes?.nodes?.[0]
  if (found) return found
  return { slug: DEFAULT_ARTICLE_TYPE_SLUG, name: ARTICLE_TYPE_LABELS[DEFAULT_ARTICLE_TYPE_SLUG] }
}

export function isKnowledgeArticle(articleTypes?: { nodes: WPArticleType[] }): boolean {
  return resolveArticleType(articleTypes).slug === 'knowledge'
}
