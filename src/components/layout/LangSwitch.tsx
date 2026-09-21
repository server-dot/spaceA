'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { LANGS, LANG_NAME, LANG_TAG, switchLangHref, ui, type Lang } from '@/lib/i18n'

/**
 * 語言選單。目標網址由目前路徑推算（見 switchLangHref）：同一條路徑換掉語言前綴。
 * 該篇還沒翻成目標語言時會落到那個語言的 404，那頁會說明此語言版本尚未提供。
 * 四個語言並排在頁首會擠爆手機，所以收成下拉選單。
 */
export default function LangSwitch({ lang }: { lang: Lang }) {
  const pathname = usePathname()
  const t = ui(lang)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 點到選單外面或按 Esc 就關起來
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${LANG_NAME[lang]}（${t.langMenu}）`}
        className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-paper-secondary border border-paper-border rounded-full pl-3 pr-2.5 py-1.5 hover:text-brand-600 hover:border-brand-600 transition-colors"
      >
        <GlobeIcon />
        <span className="hidden sm:inline">{LANG_NAME[lang]}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full mt-2 z-50 min-w-[128px] bg-paper-card border border-paper-border rounded-xl py-1.5 shadow-[0_12px_28px_rgba(30,25,15,0.14)]"
        >
          {LANGS.map((l) => {
            const active = l === lang
            return (
              <li key={l} role="none">
                <Link
                  role="menuitem"
                  href={switchLangHref(pathname, l)}
                  hrefLang={LANG_TAG[l]}
                  lang={LANG_TAG[l]}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                    active ? 'font-bold text-brand-600' : 'text-paper-body hover:text-brand-600 hover:bg-paper-surface'
                  }`}
                >
                  {LANG_NAME[l]}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
