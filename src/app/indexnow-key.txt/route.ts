// IndexNow 的金鑰驗證檔：內容就是金鑰本身，搜尋引擎收到通知後會來這裡對
export const dynamic = 'force-dynamic'

export function GET() {
  const key = process.env.INDEXNOW_KEY
  if (!key) return new Response('Not Found', { status: 404 })
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
