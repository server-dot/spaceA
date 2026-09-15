'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ui, type Lang } from '@/lib/i18n'
import SearchBar from './SearchBar'

/**
 * 手機版的選單。桌機把 logo、四個選單、搜尋框、語言鈕排成一列要 600px 以上，
 * 390px 的手機一定橫向溢出（Google 行動裝置可用性會報「內容寬度超過螢幕」），
 * 所以 md 以下改成漢堡：頁首只留 logo 與語言鈕，其餘收進展開面板。
 */
export default function MobileMenu({ lang }: { lang: Lang }) {
  const pathname = usePathname()
  const t = ui(lang)
  const [open, setOpen] = useState(false)

  // 面板展開時按 Esc 收起來
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={t.mainNav}
        className="md:hidden p-2 -mr-1 text-paper-secondary hover:text-brand-600 transition-colors"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="md:hidden absolute left-0 right-0 top-16 bg-paper border-b border-paper-border shadow-[0_12px_24px_rgba(30,25,15,0.08)]"
        >
          <div className="px-4 py-4 grid gap-1">
            <div className="pb-2">
              <SearchBar lang={lang} fullWidth onSubmitted={() => setOpen(false)} />
            </div>
            {t.nav.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`py-2.5 text-[15px] border-b border-paper-border last:border-0 ${
                    active ? 'text-brand-600 font-bold' : 'text-paper-body'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
