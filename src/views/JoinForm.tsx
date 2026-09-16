'use client'

import { useState } from 'react'

// 專長領域的 chip；送進 Slack 通知時直接當 topics 用
const FIELDS = ['旅遊住宿', '美妝保養', '健康醫療', '美食', '行銷', '3C 數位', '親子', '寵物', '其他'] as const

const fieldClass =
  'bg-transparent border-0 border-b border-[#d8d3c9] px-0.5 py-2.5 text-[15px] text-paper-ink focus:outline-none focus:border-brand-500 transition-colors'

export default function JoinForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [fields, setFields] = useState<string[]>([])
  const [links, setLinks] = useState('')
  const [intro, setIntro] = useState('')
  const [topics, setTopics] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(field: string) {
    setFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : prev.concat(field)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return setError('請留一個回覆用的信箱')
    if (!intro.trim()) return setError('請寫一段自我介紹')
    setSending(true)
    setError(null)
    try {
      // 走現有的聯絡表單 API（會轉到 Slack），欄位對應：作品連結放 articleUrl，介紹＋想寫的主題合成 message
      const message = topics.trim() ? `${intro.trim()}\n\n想寫的主題：\n${topics.trim()}` : intro.trim()
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          articleUrl: links,
          message,
          topics: ['加入寫手／達人', ...fields],
          lang: 'zh',
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

  if (sent) {
    return (
      <div className="border-l-2 border-brand-600 pl-6">
        <b className="font-serif text-xl font-bold text-paper-ink">收到了，謝謝你</b>
        <p className="text-[15px] leading-loose text-paper-body mt-2.5">
          編輯部看過你的介紹與作品後會回信，約一個 20 分鐘的線上聊聊。通常在三個工作天內。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">投遞表單</h2>
      <p className="text-sm leading-relaxed text-paper-secondary mt-2.5">
        不用履歷。留下你的專長、作品或社群連結，再用幾句話介紹自己就好。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mt-7">
        <label className="grid gap-1.5">
          <span className="text-[13px] font-bold text-paper-ink">稱呼</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="怎麼稱呼你" className={fieldClass} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[13px] font-bold text-paper-ink">信箱</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="回覆用的信箱" className={fieldClass} required />
        </label>
      </div>

      <div className="mt-[26px]">
        <span className="text-[13px] font-bold text-paper-ink">專長領域（可多選）</span>
        <div className="flex flex-wrap gap-2.5 mt-3">
          {FIELDS.map((field) => {
            const on = fields.includes(field)
            return (
              <button
                key={field}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(field)}
                className={`rounded-full px-[18px] py-2 text-sm transition-colors ${
                  on
                    ? 'bg-brand-600 border border-brand-600 text-white font-bold'
                    : 'bg-transparent border border-paper-border text-paper-secondary hover:border-paper-muted'
                }`}
              >
                {field}
              </button>
            )
          })}
        </div>
      </div>

      <label className="grid gap-1.5 mt-[26px]">
        <span className="text-[13px] font-bold text-paper-ink">作品或社群連結</span>
        <input
          type="text"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="部落格、IG、Threads、Dcard 文章，一兩個就好"
          className={fieldClass}
        />
      </label>

      <label className="grid gap-1.5 mt-[26px]">
        <span className="text-[13px] font-bold text-paper-ink">自我介紹</span>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={5}
          placeholder="你在哪個領域花過最多錢、比較過什麼、最後選了什麼。寫得像跟朋友講就好。"
          className={`${fieldClass} resize-y`}
          required
        />
      </label>

      <label className="grid gap-1.5 mt-[26px]">
        <span className="text-[13px] font-bold text-paper-ink">想寫的主題（選填）</span>
        <textarea
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          rows={3}
          placeholder="例如：台北隆鼻診所怎麼挑、新手露營裝備清單"
          className={`${fieldClass} resize-y`}
        />
      </label>

      <p className="text-xs leading-relaxed text-paper-muted mt-6">
        送出表示你同意我們用這個信箱回覆你，資料只用於寫手合作聯繫，不會用於行銷或提供給第三方。
      </p>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="mt-6 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-sm px-8 py-3 rounded-full transition-colors"
      >
        {sending ? '送出中...' : '投遞'}
      </button>
    </form>
  )
}
