'use client'

import { useState } from 'react'

const TOPICS = [
  { key: 'correction', name: '內容更正' },
  { key: 'suggest', name: '選題建議' },
  { key: 'ad', name: '廣告合作' },
  { key: 'license', name: '內容授權' },
  { key: 'media', name: '媒體聯繫' },
  { key: 'other', name: '其他' },
]

export default function ContactForm() {
  const [picked, setPicked] = useState<string[]>(['correction'])
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [org, setOrg] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [articleUrl, setArticleUrl] = useState('')
  const [budget, setBudget] = useState('')
  const [message, setMessage] = useState('')

  const has = (key: string) => picked.includes(key)
  const commercial = has('ad') || has('license') || has('media')

  let note = '我們會盡快回信。'
  if (has('correction')) note = '內容更正會優先處理。我們核對來源後會更正文章，並更新最後更新日期。'
  else if (commercial) note = '我們會評估合作形式後回信。提醒一下，推薦名單與排序不對外開放付費。'
  else if (has('suggest')) note = '謝謝你的建議。選題會納入編輯會議討論，若已在規劃中我們會回信說明時程。'

  let placeholder = '請簡單說明你的問題或需求。'
  if (has('correction')) placeholder = '請說明哪一篇、哪一段有誤，以及你看到的正確資訊或來源。'
  else if (commercial) placeholder = '請說明合作形式、預期時程，以及希望達成的目標。'
  else if (has('suggest')) placeholder = '想看什麼主題？正在猶豫的幾個選項也可以一起告訴我們。'

  function toggle(key: string) {
    setPicked((prev) => (prev.includes(key) ? prev.filter((v) => v !== key) : prev.concat(key)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) {
      setError('請填寫詢問內容')
      return
    }
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          org,
          email,
          phone,
          articleUrl,
          budget,
          message,
          topics: picked.map((key) => TOPICS.find((t) => t.key === key)?.name ?? key),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || '送出失敗，請稍後再試')
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '送出失敗，請稍後再試')
    } finally {
      setSending(false)
    }
  }

  function resetForm() {
    setSent(false)
    setError(null)
    setName('')
    setOrg('')
    setEmail('')
    setPhone('')
    setArticleUrl('')
    setBudget('')
    setMessage('')
    setPicked(['correction'])
  }

  if (sent) {
    return (
      <div className="border-l-2 border-brand-600 pl-6">
        <b className="font-serif text-xl font-bold text-paper-ink">已收到，謝謝你</b>
        <p className="text-[15px] leading-loose text-paper-body mt-2.5">{note}</p>
        <button type="button" onClick={resetForm} className="mt-4 text-sm font-bold text-brand-600">
          再填一次
        </button>
      </div>
    )
  }

  const fieldClass =
    'bg-transparent border-0 border-b border-[#d8d3c9] px-0.5 py-2.5 text-[15px] text-paper-ink focus:outline-none focus:border-brand-500 transition-colors'

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">填表單與我們取得聯繫</h2>
      <p className="text-sm leading-relaxed text-paper-secondary mt-2.5">
        內容更正請附上文章網址與段落；合作請說明形式、時程與預算範圍，我們處理會快很多。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mt-7">
        <label className="grid gap-1.5">
          <span className="text-[13px] font-bold text-paper-ink">稱呼</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="怎麼稱呼你"
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[13px] font-bold text-paper-ink">品牌／單位</span>
          <input
            type="text"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="沒有可留空"
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[13px] font-bold text-paper-ink">信箱</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="回覆用的信箱"
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[13px] font-bold text-paper-ink">電話</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="方便的話留一個"
            className={fieldClass}
          />
        </label>
      </div>

      <div className="mt-[26px]">
        <span className="text-[13px] font-bold text-paper-ink">諮詢事項（可多選）</span>
        <div className="flex flex-wrap gap-2.5 mt-3">
          {TOPICS.map((t) => {
            const on = has(t.key)
            return (
              <button
                key={t.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(t.key)}
                className={`rounded-full px-[18px] py-2 text-sm transition-colors ${
                  on
                    ? 'bg-brand-600 border border-brand-600 text-white font-bold'
                    : 'bg-transparent border border-paper-border text-paper-secondary hover:border-paper-muted'
                }`}
              >
                {t.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-5 mt-[26px]">
        {has('correction') && (
          <label className="grid gap-1.5">
            <span className="text-[13px] font-bold text-paper-ink">相關文章網址</span>
            <input
              type="url"
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              placeholder="https://spacea.tw/..."
              className={fieldClass}
            />
          </label>
        )}
        {commercial && (
          <label className="grid gap-1.5">
            <span className="text-[13px] font-bold text-paper-ink">預算範圍與時程</span>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="例如：本季內、預算區間"
              className={fieldClass}
            />
          </label>
        )}
        <label className="grid gap-1.5">
          <span className="text-[13px] font-bold text-paper-ink">詢問內容</span>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            className={`${fieldClass} leading-loose resize-y`}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      <div className="flex items-center justify-between gap-5 flex-wrap mt-[26px] pt-[22px] border-t border-paper-border">
        <p className="text-xs leading-relaxed text-paper-muted max-w-xs">
          送出表示你同意我們用這個信箱或電話回覆你，資料不會用於行銷或提供給第三方。
        </p>
        <button
          type="submit"
          disabled={sending}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[15px] px-11 py-3.5 rounded-full transition-colors"
        >
          {sending ? '送出中...' : '送出'}
        </button>
      </div>
    </form>
  )
}
