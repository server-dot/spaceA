import { SITE_URL } from '@/lib/constants'

export const revalidate = 86400

// 原本用 MetadataRoute.Robots 產，但它不支援 Content-Signal 這種自訂欄位，改成自己輸出純文字。
// Content-Signal 是給 AI 引擎看的內容使用授權（搜尋索引／AI 回答引用／模型訓練），
// 三項都明講「可以」，不然各家引擎會自己認定，GEO 健檢也會報「未表態」。
export function GET() {
  const body = `User-Agent: *
Allow: /
Disallow: /api/

Content-Signal: search=yes, ai-input=yes, ai-train=yes

Sitemap: ${SITE_URL}/sitemap.xml
`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
