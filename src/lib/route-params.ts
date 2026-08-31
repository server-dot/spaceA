/**
 * Next.js 對非 ASCII（例如中文）動態路由參數，在靜態產生（generateStaticParams）階段
 * 讀進頁面元件的 params 時會是 percent-encoded 字串（例如「醫療很不重要」變成
 * "%E9%86%AB..."），跟 WordPress 存的原始 slug 對不起來，導致用 idType: SLUG 查詢時
 * 找不到文章、整篇被 notFound()。純 ASCII slug 不受影響（decode 是 no-op）。
 *
 * 統一在讀到 params 之後就 decode 一次，兩種情況都正確處理。
 */
export function decodeRouteParam(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
