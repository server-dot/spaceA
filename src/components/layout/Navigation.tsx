'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/constants'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav aria-label="主選單">
      <ul className="flex items-center gap-1 flex-wrap h-16">
        {NAV_ITEMS.map((item) => {
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
