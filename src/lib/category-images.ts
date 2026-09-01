// public/categories/*.jpg 目前實際存在的分類圖片，缺圖的分類直接顯示漸層底色，避免打到 next/image 造成 500
const CATEGORY_IMAGES = new Set(['3c', 'education', 'food', 'health', 'pets'])

export function hasCategoryImage(slug: string): boolean {
  return CATEGORY_IMAGES.has(slug)
}
