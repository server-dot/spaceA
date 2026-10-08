import { BrandListItem } from '@/lib/brand-list'

interface ItemListJsonLdProps {
  /** 文章標題，當這份清單的名稱 */
  name: string
  url: string
  items: BrandListItem[]
}

/**
 * 推薦文的品牌清單：ItemList + 每家一個 ListItem，順序就是文章裡的排序。
 * 每家帶完整卡片資料（小編點評、規格、網友評價），給 AI 搜尋直接引用。
 * 不輸出評分：我們沒有打分數，編一個違反 Google 規範也違反揭露原則。
 * 商品價格用 AggregateOffer：我們不是賣家，用 Offer 會被 Google 當成「商家資訊」，
 * 要求退貨政策、運費、庫存這些我們給不出的欄位；AggregateOffer 是「整理別人的售價」，只走產品摘要。
 */
export default function ItemListJsonLd({ name, url, items }: ItemListJsonLdProps) {
  if (items.length === 0) return null
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${url}#itemlist`,
    name,
    url,
    numberOfItems: items.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: entity(item),
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

function entity(item: BrandListItem) {
  const base = {
    '@type': item.type,
    name: item.name,
    ...(item.url ? { url: item.url } : {}),
    ...(item.image ? { image: item.image } : {}),
    ...(item.description ? { description: item.description } : {}),
    ...(item.facts.length > 0
      ? {
          additionalProperty: item.facts.map((f) => ({ '@type': 'PropertyValue', name: f.name, value: f.value })),
        }
      : {}),
  }

  if (item.type === 'Product') {
    if (!item.offer) return base
    const offers = {
      '@type': 'AggregateOffer',
      lowPrice: item.offer.price,
      priceCurrency: item.offer.currency,
      offerCount: 1,
      ...(item.url ? { url: item.url } : {}),
    }
    return { ...base, offers }
  }

  // 店家：收費說明原文放 priceRange（schema.org 這欄本來就是文字）
  if (item.type !== 'TouristAttraction' && item.priceText) {
    return { ...base, priceRange: item.priceText }
  }
  return base
}
