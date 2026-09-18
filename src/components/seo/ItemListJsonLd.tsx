import { BrandListItem } from '@/lib/brand-list'

interface ItemListJsonLdProps {
  /** 文章標題，當這份清單的名稱 */
  name: string
  url: string
  items: BrandListItem[]
}

/** 推薦文的品牌清單：ItemList + 每家一個 ListItem，順序就是文章裡的排序 */
export default function ItemListJsonLd({ name, url, items }: ItemListJsonLdProps) {
  if (items.length === 0) return null
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url,
    numberOfItems: items.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { url: item.url } : {}),
      ...(item.image ? { image: item.image } : {}),
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
