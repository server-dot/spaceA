import { stripHtml } from '@/lib/format'

export interface BrandListItem {
  name: string
  url?: string
  image?: string
}

/**
 * 從 StackTool 推薦文的品牌卡片（.brand-card）抓出「第幾家、叫什麼、官網、圖片」，
 * 給 ItemList 結構化資料用：文章正文本來就是一份排序過的推薦清單，
 * 不另外標出來的話 AI 搜尋只能自己猜哪幾家是被推薦的。
 * 沒有卡片（手寫的選購指南）就回空陣列，呼叫端不輸出 schema。
 */
export function extractBrandList(html: string): BrandListItem[] {
  const cards = html.split(/<div class="brand-card">/).slice(1)
  const items: BrandListItem[] = []
  for (const card of cards) {
    const name = card.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)?.[1]
    if (!name) continue
    const url = card.match(/class="ref-link"><a href="([^"]+)"/)?.[1]
    const image = card.match(/<div class="card-hero">[\s\S]*?<img[^>]*src="([^"]+)"/)?.[1]
    items.push({
      name: stripHtml(name).replace(/\s+/g, ' ').trim(),
      url: url || undefined,
      image: image || undefined,
    })
  }
  return items
}
