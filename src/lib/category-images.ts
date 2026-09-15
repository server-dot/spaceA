// public/categories/*.jpg 是每個分類的主題照片
const JPG_CATEGORY_IMAGES = new Set([
  'marketing',
  '3c',
  'health',
  'pets',
  'creator-gear',
  'education',
  'travel',
  'auto',
  'food',
  'legal',
  'home',
  'beauty',
  'fitness',
  'finance',
])

import { toRouteSlug } from '@/lib/i18n'

// 英文分類（travel-en）跟中文分類共用同一張圖
export function getCategoryImageSrc(slug: string): string | null {
  const base = toRouteSlug(slug)
  if (JPG_CATEGORY_IMAGES.has(base)) return `/categories/${base}.jpg`
  return null
}
