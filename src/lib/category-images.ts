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

export function getCategoryImageSrc(slug: string): string | null {
  if (JPG_CATEGORY_IMAGES.has(slug)) return `/categories/${slug}.jpg`
  return null
}
