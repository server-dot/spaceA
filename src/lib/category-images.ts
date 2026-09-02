// public/categories/*.jpg 是舊分類（3c/education/food/health/pets，現在 WP 裡已經沒有這些分類）留下的照片
const JPG_CATEGORY_IMAGES = new Set(['3c', 'education', 'food', 'health', 'pets'])

// public/categories/*.svg 是目前真實分類的暫用圖示，等有真實照片再換掉
const SVG_CATEGORY_IMAGES = new Set(['marketing', 'creator-gear'])

export function getCategoryImageSrc(slug: string): string | null {
  if (SVG_CATEGORY_IMAGES.has(slug)) return `/categories/${slug}.svg`
  if (JPG_CATEGORY_IMAGES.has(slug)) return `/categories/${slug}.jpg`
  return null
}
