'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleOpen() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleClose() {
    setOpen(false)
    setQuery('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    handleClose()
  }

  if (open) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => { if (!query.trim()) handleClose() }}
          placeholder="搜尋文章..."
          className="w-44 sm:w-60 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
        />
        <button
          type="submit"
          className="p-1.5 text-gray-500 hover:text-sky-500 transition-colors"
          aria-label="搜尋"
        >
          <SearchIcon />
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="關閉搜尋"
        >
          <CloseIcon />
        </button>
      </form>
    )
  }

  return (
    <button
      onClick={handleOpen}
      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      aria-label="搜尋"
    >
      <SearchIcon />
    </button>
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
