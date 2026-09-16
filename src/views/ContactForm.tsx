'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Lang } from '@/lib/i18n'

const TOPIC_KEYS = ['correction', 'suggest', 'join', 'ad', 'license', 'media', 'other'] as const

// 表單字串只有這裡用，就放在這個檔案，不塞進 i18n 的大字典
const STRINGS = {
  zh: {
    topics: { correction: '內容更正', suggest: '選題建議', join: '加入寫手／達人', ad: '廣告合作', license: '內容授權', media: '媒體聯繫', other: '其他' },
    noteDefault: '我們會盡快回信。',
    noteCorrection: '內容更正會優先處理。我們核對來源後會更正文章，並更新最後更新日期。',
    noteCommercial: '我們會評估後回信。提醒一下，開放刊登的是廣告版面，推薦名單與排序不販售。',
    noteSuggest: '謝謝你的建議。選題會納入編輯會議討論，若已在規劃中我們會回信說明時程。',
    noteJoin: '謝謝你有興趣。留下你的專長領域與作品連結，編輯部看過會回信約時間聊聊。',
    phDefault: '請簡單說明你的問題或需求。',
    phCorrection: '請說明哪一篇、哪一段有誤，以及你看到的正確資訊或來源。',
    phCommercial: '請說明合作形式、預期時程，以及希望達成的目標。',
    phSuggest: '想看什麼主題？正在猶豫的幾個選項也可以一起告訴我們。',
    phJoin: '你的專長領域、寫過的文章或社群連結，想寫的主題也可以先提。',
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
    topics: { correction: 'Correction', suggest: 'Topic suggestion', join: 'Join as a writer', ad: 'Advertising', license: 'Content licensing', media: 'Press', other: 'Other' },
    noteDefault: 'We will reply as soon as we can.',
    noteCorrection: 'Corrections are handled first. After checking the source we will fix the article and update its last-updated date.',
    noteCommercial: 'We will review the proposal and get back to you. What we sell is labelled ad space; recommendation lists and rankings are not for sale.',
    noteSuggest: 'Thanks for the suggestion. Topics go to our editorial meeting; if it is already planned we will let you know the timeline.',
    noteJoin: 'Thanks for your interest. Leave your area of expertise and links to your work; the editors will reply to set up a chat.',
    phDefault: 'Briefly describe your question or request.',
    phCorrection: 'Tell us which article and paragraph is wrong, and the correct information or source you found.',
    phCommercial: 'Describe the type of partnership, expected timeline, and what you hope to achieve.',
    phSuggest: 'What topic would you like to see? Feel free to list the options you are weighing.',
    phJoin: 'Your area of expertise, links to articles or social accounts, and topics you would like to write.',
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
  ja: {
    topics: { correction: '内容の訂正', suggest: 'テーマの提案', join: 'ライター・達人として参加', ad: '広告掲載', license: 'コンテンツ利用許諾', media: '取材のご依頼', other: 'その他' },
    noteDefault: 'できるだけ早くお返事します。',
    noteCorrection: '内容の訂正は最優先で対応します。出典を確認したうえで記事を修正し、最終更新日を更新します。',
    noteCommercial: '内容を検討したうえでご連絡します。販売しているのは「広告」と明示した広告枠のみで、掲載順やおすすめ枠は販売していません。',
    noteSuggest: 'ご提案ありがとうございます。編集会議で検討し、すでに予定がある場合は時期をお知らせします。',
    noteJoin: 'ご関心ありがとうございます。得意分野と作品のリンクを残してください。編集部が確認のうえ、お話しする日時をご連絡します。',
    phDefault: 'ご質問やご要望を簡単にお書きください。',
    phCorrection: 'どの記事のどの段落に誤りがあるか、正しい情報や出典と合わせてお書きください。',
    phCommercial: '協業の形、想定スケジュール、達成したい目標をお書きください。',
    phSuggest: 'どんなテーマが読みたいですか。迷っている選択肢があれば一緒にお書きください。',
    phJoin: '得意分野、過去の記事やSNSのリンク、書きたいテーマがあればそれもお書きください。',
    required: 'お問い合わせ内容をご記入ください',
    failed: '送信に失敗しました。しばらくしてからもう一度お試しください。',
    sentTitle: '受け付けました。ありがとうございます',
    again: 'もう一度送る',
    formTitle: 'フォームからお問い合わせ',
    formHint: '訂正のご連絡は記事の URL と該当箇所を、協業のご相談は形式・時期・予算の目安を添えていただけると、対応が早くなります。',
    name: 'お名前',
    namePh: 'お呼びする名前',
    org: 'ブランド・団体',
    orgPh: '任意',
    email: 'メールアドレス',
    emailPh: '返信用のメールアドレス',
    phone: '電話番号',
    phonePh: '任意',
    topicsLabel: 'ご用件（複数選択可）',
    articleUrl: '該当記事の URL',
    budget: '予算の目安とスケジュール',
    budgetPh: '例：今四半期中、予算帯',
    message: 'お問い合わせ内容',
    consent: '送信すると、このメールアドレスまたは電話番号での返信に同意したものとみなします。いただいた情報をマーケティングに使ったり第三者に提供したりすることはありません。',
    sending: '送信中...',
    submit: '送信',
  },
  ko: {
    topics: { correction: '내용 정정', suggest: '주제 제안', join: '작가·전문가로 참여', ad: '광고 문의', license: '콘텐츠 이용 허락', media: '취재 문의', other: '기타' },
    noteDefault: '최대한 빨리 답장드리겠습니다.',
    noteCorrection: '내용 정정은 가장 먼저 처리합니다. 출처를 확인한 뒤 글을 고치고 최종 업데이트 날짜를 갱신합니다.',
    noteCommercial: '검토 후 연락드리겠습니다. 판매하는 것은 광고로 표시된 광고 지면뿐이며, 추천 목록이나 노출 순서는 판매하지 않습니다.',
    noteSuggest: '제안 감사합니다. 편집 회의에서 검토하며, 이미 예정된 주제라면 일정을 알려드리겠습니다.',
    noteJoin: '관심 가져 주셔서 감사합니다. 전문 분야와 작품 링크를 남겨 주시면 편집부가 확인 후 이야기 나눌 시간을 잡아 연락드리겠습니다.',
    phDefault: '문의하실 내용이나 요청을 간단히 적어주세요.',
    phCorrection: '어느 글의 어느 부분이 잘못되었는지, 확인하신 올바른 정보나 출처와 함께 적어주세요.',
    phCommercial: '협업 형태와 예상 일정, 이루고 싶은 목표를 적어주세요.',
    phSuggest: '어떤 주제를 보고 싶으신가요? 고민 중인 선택지가 있다면 함께 적어주세요.',
    phJoin: '전문 분야, 쓴 글이나 SNS 링크, 쓰고 싶은 주제가 있으면 함께 적어 주세요.',
    required: '문의 내용을 입력해 주세요',
    failed: '전송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    sentTitle: '접수되었습니다. 감사합니다',
    again: '다시 보내기',
    formTitle: '양식으로 문의하기',
    formHint: '정정 문의는 글 주소와 해당 문단을, 협업 문의는 형태와 일정, 예산 범위를 함께 적어주시면 훨씬 빠르게 처리됩니다.',
    name: '성함',
    namePh: '어떻게 불러드릴까요',
    org: '브랜드·기관',
    orgPh: '선택 사항',
    email: '이메일',
    emailPh: '답장받을 이메일',
    phone: '전화번호',
    phonePh: '선택 사항',
    topicsLabel: '문의 유형(복수 선택 가능)',
    articleUrl: '해당 글 주소',
    budget: '예산 범위와 일정',
    budgetPh: '예: 이번 분기 안, 예산 구간',
    message: '문의 내용',
    consent: '보내시면 이 이메일이나 전화번호로 답장하는 데 동의하신 것으로 봅니다. 받은 정보는 마케팅에 쓰거나 제3자에게 제공하지 않습니다.',
    sending: '전송 중...',
    submit: '보내기',
  },
}

// useSearchParams 要有 Suspense 邊界，包在這層，四個語言的 contact 頁不用各自處理
export default function ContactForm(props: { lang?: Lang }) {
  return (
    <Suspense fallback={null}>
      <ContactFormInner {...props} />
    </Suspense>
  )
}

function ContactFormInner({ lang = 'zh' }: { lang?: Lang }) {
  const t = STRINGS[lang]
  const TOPICS = TOPIC_KEYS.map((key) => ({ key, name: t.topics[key] }))
  // 首頁的招募區塊與頁尾連結帶 ?topic=join 進來，預先勾好對應事項
  const initialTopic = useSearchParams().get('topic')
  const [picked, setPicked] = useState<string[]>(
    initialTopic && (TOPIC_KEYS as readonly string[]).includes(initialTopic) ? [initialTopic] : ['correction'],
  )
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
  else if (has('join')) note = t.noteJoin
  else if (has('suggest')) note = t.noteSuggest

  let placeholder = t.phDefault
  if (has('correction')) placeholder = t.phCorrection
  else if (commercial) placeholder = t.phCommercial
  else if (has('join')) placeholder = t.phJoin
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
