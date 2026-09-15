'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { langPrefix, ui, type Lang } from '@/lib/i18n'

// 搜尋框常駐展開（2026-09-15 使用者要求），不再是點放大鏡才打開；× 只清空字串
interface SearchBarProps {
  lang: Lang
  /** 手機選單面板裡要撐滿一整列 */
  fullWidth?: boolean
  /** 送出後通知外層（手機選單送出就收起來） */
  onSubmitted?: () => void
}

export default function SearchBar({ lang, fullWidth, onSubmitted }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const t = ui(lang)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`${langPrefix(lang)}/search?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
    onSubmitted?.()
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={`flex items-center gap-1 ${fullWidth ? 'w-full' : ''}`}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.searchPlaceholder}
        aria-label={t.search}
        className={`px-3 py-2 text-sm bg-paper-card border border-paper-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all [&::-webkit-search-cancel-button]:hidden ${
          fullWidth ? 'flex-1 min-w-0' : 'w-40 lg:w-52 py-1.5'
        }`}
      />
      <button
        type="submit"
        className="p-1.5 text-paper-secondary hover:text-brand-600 transition-colors"
        aria-label={t.search}
      >
        <SearchIcon />
      </button>
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="p-1.5 text-paper-muted hover:text-paper-ink transition-colors"
          aria-label={t.clearFilter}
        >
          <CloseIcon />
        </button>
      )}
    </form>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
