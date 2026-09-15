'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ui, type Lang } from '@/lib/i18n'

export default function Navigation({ lang }: { lang: Lang }) {
  const pathname = usePathname()
  const t = ui(lang)

  return (
    <nav aria-label={t.mainNav}>
      <ul className="flex items-center gap-1 flex-wrap h-16">
        {t.nav.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          return (
            <li key={item.href} className="h-full">
              <Link
                href={item.href}
                className={`h-full flex items-center px-3 text-sm border-b-2 transition-colors ${
                  active
                    ? 'text-brand-600 font-bold border-brand-600'
                    : 'text-paper-secondary font-medium border-transparent hover:text-paper-ink hover:border-paper-border'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
