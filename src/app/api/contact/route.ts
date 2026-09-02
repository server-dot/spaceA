import { NextRequest, NextResponse } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// n8n workflow「spaceA-聯絡表單通知」的 webhook，收到表單後轉發到 Slack #機器人測試
const N8N_WEBHOOK_URL = process.env.N8N_CONTACT_WEBHOOK_URL || 'https://stack.zeabur.app/webhook/spacea-contact'

// 純文字欄位進通知內容前先擋掉換行，避免被用來偽造多餘的內容
function sanitizeLine(value: unknown, maxLength = 200): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength)
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: '請求格式錯誤' }, { status: 400 })
  }

  const name = sanitizeLine(body.name, 100)
  const org = sanitizeLine(body.org, 100)
  const email = sanitizeLine(body.email, 200)
  const phone = sanitizeLine(body.phone, 50)
  const articleUrl = sanitizeLine(body.articleUrl, 300)
  const budget = sanitizeLine(body.budget, 200)
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : ''
  const topics = Array.isArray(body.topics)
    ? body.topics.filter((t): t is string => typeof t === 'string').map((t) => sanitizeLine(t, 30))
    : []

  if (!message) {
    return NextResponse.json({ message: '請填寫詢問內容' }, { status: 400 })
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ message: '信箱格式不正確' }, { status: 400 })
  }

  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, org, email, phone, articleUrl, budget, message, topics }),
    })
    if (!res.ok) throw new Error(`n8n webhook responded ${res.status}`)
  } catch (err) {
    console.error('[contact] 轉發到 n8n 失敗', err)
    return NextResponse.json({ message: '送出失敗，請稍後再試' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
