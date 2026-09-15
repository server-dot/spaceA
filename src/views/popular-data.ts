export interface RankedArticle {
  cat: string
  catSlug: string
  date: string
  dateISO: string
  title: string
  excerpt: string
  href: string
  image: { url: string; alt: string } | null
}

// 顯示名稱在 i18n 的 `ranges`
export const RANGE_KEYS = ['week', 'month', 'all'] as const

export type RangeKey = (typeof RANGE_KEYS)[number]
