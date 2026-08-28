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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="bg-brand-50 border border-brand-500 rounded-2xl p-9">
        <b className="font-serif text-xl font-bold text-paper-ink">已收到，謝謝你</b>
        <p className="text-[15px] leading-loose text-paper-body mt-2.5">{note}</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 text-sm font-bold text-brand-600"
        >
          再填一次
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-paper-border rounded-2xl p-8 sm:p-9">
      <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">填表單與我們取得聯繫</h2>
      <p className="text-sm leading-relaxed text-paper-secondary mt-2.5">
        內容更正請附上文章網址與段落；合作請說明形式、時程與預算範圍，我們處理會快很多。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <label className="grid gap-2">
          <span className="text-[13px] font-bold">稱呼</span>
          <input
            type="text"
            placeholder="怎麼稱呼你"
            className="h-11 px-3.5 border border-paper-border rounded-lg bg-paper text-sm text-paper-ink focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-[13px] font-bold">品牌／單位</span>
          <input
            type="text"
            placeholder="沒有可留空"
            className="h-11 px-3.5 border border-paper-border rounded-lg bg-paper text-sm text-paper-ink focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-[13px] font-bold">信箱</span>
          <input
            type="email"
            placeholder="回覆用的信箱"
            className="h-11 px-3.5 border border-paper-border rounded-lg bg-paper text-sm text-paper-ink focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-[13px] font-bold">電話</span>
          <input
            type="tel"
            placeholder="方便的話留一個"
            className="h-11 px-3.5 border border-paper-border rounded-lg bg-paper text-sm text-paper-ink focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
          />
        </label>
      </div>

      <div className="mt-5">
        <span className="text-[13px] font-bold">諮詢事項（可多選）</span>
        <div className="flex flex-wrap gap-2.5 mt-3">
          {TOPICS.map((t) => {
            const on = has(t.key)
            return (
              <button
                key={t.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(t.key)}
                className={`rounded-full px-4.5 py-2 text-sm transition-colors ${
                  on
                    ? 'bg-brand-600 border border-brand-600 text-white font-bold'
                    : 'bg-paper border border-paper-border text-paper-secondary hover:border-paper-muted'
                }`}
              >
                {t.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 mt-5">
        {has('correction') && (
          <label className="grid gap-2">
            <span className="text-[13px] font-bold">相關文章網址</span>
            <input
              type="url"
              placeholder="https://spacea.tw/..."
              className="h-11 px-3.5 border border-paper-border rounded-lg bg-paper text-sm text-paper-ink focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            />
          </label>
        )}
        {commercial && (
          <label className="grid gap-2">
            <span className="text-[13px] font-bold">預算範圍與時程</span>
            <input
              type="text"
              placeholder="例如：本季內、預算區間"
              className="h-11 px-3.5 border border-paper-border rounded-lg bg-paper text-sm text-paper-ink focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            />
          </label>
        )}
        <label className="grid gap-2">
          <span className="text-[13px] font-bold">詢問內容</span>
          <textarea
            rows={6}
            placeholder={placeholder}
            className="p-3.5 border border-paper-border rounded-lg bg-paper text-sm leading-loose text-paper-ink resize-y focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-5 flex-wrap mt-5 pt-5 border-t border-paper-border">
        <p className="text-xs leading-relaxed text-paper-muted max-w-xs">
          送出表示你同意我們用這個信箱或電話回覆你，資料不會用於行銷或提供給第三方。
        </p>
        <button
          type="submit"
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-[15px] px-11 py-3.5 rounded-lg transition-colors"
        >
          送出
        </button>
      </div>
    </form>
  )
}
