'use client'

import { useState } from 'react'
import type { Lang } from '@/lib/i18n'

const TOPIC_KEYS = ['correction', 'suggest', 'ad', 'license', 'media', 'other'] as const

// 表單字串只有這裡用，就放在這個檔案，不塞進 i18n 的大字典
const STRINGS = {
  zh: {
    topics: { correction: '內容更正', suggest: '選題建議', ad: '廣告合作', license: '內容授權', media: '媒體聯繫', other: '其他' },
    noteDefault: '我們會盡快回信。',
    noteCorrection: '內容更正會優先處理。我們核對來源後會更正文章，並更新最後更新日期。',
    noteCommercial: '我們會評估合作形式後回信。提醒一下，推薦名單與排序不對外開放付費。',
    noteSuggest: '謝謝你的建議。選題會納入編輯會議討論，若已在規劃中我們會回信說明時程。',
    phDefault: '請簡單說明你的問題或需求。',
    phCorrection: '請說明哪一篇、哪一段有誤，以及你看到的正確資訊或來源。',
    phCommercial: '請說明合作形式、預期時程，以及希望達成的目標。',
    phSuggest: '想看什麼主題？正在猶豫的幾個選項也可以一起告訴我們。',
    required: '請填寫詢問內容',
    failed: '送出失敗，請稍後再試',
    sentTitle: '已收到，謝謝你',
    again: '再填一次',
    formTitle: '填表單與我們取得聯繫',
    formHint: '內容更正請附上文章網址與段落；合作請說明形式、時程與預算範圍，我們處理會快很多。',
    name: '稱呼',
    namePh: '怎麼稱呼你',
    org: '品牌／單位',
    orgPh: '沒有可留空',
    email: '信箱',
    emailPh: '回覆用的信箱',
    phone: '電話',
    phonePh: '方便的話留一個',
    topicsLabel: '諮詢事項（可多選）',
    articleUrl: '相關文章網址',
    budget: '預算範圍與時程',
    budgetPh: '例如：本季內、預算區間',
    message: '詢問內容',
    consent: '送出表示你同意我們用這個信箱或電話回覆你，資料不會用於行銷或提供給第三方。',
    sending: '送出中...',
    submit: '送出',
  },
  en: {
    topics: { correction: 'Correction', suggest: 'Topic suggestion', ad: 'Advertising', license: 'Content licensing', media: 'Press', other: 'Other' },
    noteDefault: 'We will reply as soon as we can.',
    noteCorrection: 'Corrections are handled first. After checking the source we will fix the article and update its last-updated date.',
    noteCommercial: 'We will review the proposed format and get back to you. Note that our recommendation lists and rankings are not for sale.',
    noteSuggest: 'Thanks for the suggestion. Topics go to our editorial meeting; if it is already planned we will let you know the timeline.',
    phDefault: 'Briefly describe your question or request.',
    phCorrection: 'Tell us which article and paragraph is wrong, and the correct information or source you found.',
    phCommercial: 'Describe the type of partnership, expected timeline, and what you hope to achieve.',
    phSuggest: 'What topic would you like to see? Feel free to list the options you are weighing.',
    required: 'Please enter your message',
    failed: 'Failed to send. Please try again later.',
    sentTitle: 'Received, thank you',
    again: 'Send another',
    formTitle: 'Get in touch with the form',
    formHint: 'For corrections, include the article URL and paragraph; for partnerships, describe the format, timeline and budget range. It speeds things up a lot.',
    name: 'Name',
    namePh: 'How should we address you?',
    org: 'Brand / organisation',
    orgPh: 'Optional',
    email: 'Email',
    emailPh: 'Email for our reply',
    phone: 'Phone',
    phonePh: 'Optional',
    topicsLabel: 'What is this about? (pick any)',
    articleUrl: 'Article URL',
    budget: 'Budget range and timeline',
    budgetPh: 'e.g. this quarter, budget range',
    message: 'Message',
    consent: 'By sending, you agree that we may use this email or phone number to reply. Your details are never used for marketing or shared with third parties.',
    sending: 'Sending...',
    submit: 'Send',
  },
}

export default function ContactForm({ lang = 'zh' }: { lang?: Lang }) {
  const t = STRINGS[lang]
  const TOPICS = TOPIC_KEYS.map((key) => ({ key, name: t.topics[key] }))
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

  let note = t.noteDefault
  if (has('correction')) note = t.noteCorrection
  else if (commercial) note = t.noteCommercial
  else if (has('suggest')) note = t.noteSuggest

  let placeholder = t.phDefault
  if (has('correction')) placeholder = t.phCorrection
  else if (commercial) placeholder = t.phCommercial
  else if (has('suggest')) placeholder = t.phSuggest

  function toggle(key: string) {
    setPicked((prev) => (prev.includes(key) ? prev.filter((v) => v !== key) : prev.concat(key)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) {
      setError(t.required)
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
          // 通知到 Slack 的事項名稱固定用中文，不管表單是哪個語言
          topics: picked.map((key) => STRINGS.zh.topics[key as (typeof TOPIC_KEYS)[number]] ?? key),
          lang,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || t.failed)
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failed)
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
        <b className="font-serif text-xl font-bold text-paper-ink">{t.sentTitle}</b>
        <p className="text-[15px] leading-loose text-paper-body mt-2.5">{note}</p>
        <button type="button" onClick={resetForm} className="mt-4 text-sm font-bold text-brand-600">
          {t.again}
        </button>
      </div>
    )
  }

  const fieldClass =
    'bg-transparent border-0 border-b border-[#d8d3c9] px-0.5 py-2.5 text-[15px] text-paper-ink focus:outline-none focus:border-brand-500 transition-colors'

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">{t.formTitle}</h2>
      <p className="text-sm leading-relaxed text-paper-secondary mt-2.5">{t.formHint}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mt-7">
        <label className="grid gap-1.5">
          <span className="text-[13px] font-bold text-paper-ink">{t.name}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePh}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[13px] font-bold text-paper-ink">{t.org}</span>
          <input
            type="text"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder={t.orgPh}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[13px] font-bold text-paper-ink">{t.email}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPh}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[13px] font-bold text-paper-ink">{t.phone}</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phonePh}
            className={fieldClass}
          />
        </label>
      </div>

      <div className="mt-[26px]">
        <span className="text-[13px] font-bold text-paper-ink">{t.topicsLabel}</span>
        <div className="flex flex-wrap gap-2.5 mt-3">
          {TOPICS.map((topic) => {
            const on = has(topic.key)
            return (
              <button
                key={topic.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(topic.key)}
                className={`rounded-full px-[18px] py-2 text-sm transition-colors ${
                  on
                    ? 'bg-brand-600 border border-brand-600 text-white font-bold'
                    : 'bg-transparent border border-paper-border text-paper-secondary hover:border-paper-muted'
                }`}
              >
                {topic.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-5 mt-[26px]">
        {has('correction') && (
          <label className="grid gap-1.5">
            <span className="text-[13px] font-bold text-paper-ink">{t.articleUrl}</span>
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
            <span className="text-[13px] font-bold text-paper-ink">{t.budget}</span>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder={t.budgetPh}
              className={fieldClass}
            />
          </label>
        )}
        <label className="grid gap-1.5">
          <span className="text-[13px] font-bold text-paper-ink">{t.message}</span>
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
          {t.consent}
        </p>
        <button
          type="submit"
          disabled={sending}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[15px] px-11 py-3.5 rounded-full transition-colors"
        >
          {sending ? t.sending : t.submit}
        </button>
      </div>
    </form>
  )
}
