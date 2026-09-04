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

export const RANGES = [
  { key: 'week', label: '本週' },
  { key: 'month', label: '本月' },
  { key: 'all', label: '總排行' },
] as const

export type RangeKey = (typeof RANGES)[number]['key']

export const POPULAR_PAGE_DESCRIPTION =
  'spaceA 最新上稿的推薦與知識分享文章，依發布時間排序；等實際閱讀數據串接完成後會改為依讀者行為的熱門排行。'
