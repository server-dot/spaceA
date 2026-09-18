'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SITE_NAME, COMPANY_NAME, COMPANY_REG_NO, EDITORIAL_EMAIL } from '@/lib/constants'
import { categoryHref, homeHref, langPrefix, ui, type Lang } from '@/lib/i18n'
import { WPCategory } from '@/types/wordpress'


interface FooterProps {
  lang: Lang
  categories: WPCategory[]
}

export default function Footer({ lang, categories }: FooterProps) {
  const pathname = usePathname()
  const t = ui(lang)
  const prefix = langPrefix(lang)
  const isHome = pathname === homeHref(lang)
  const year = new Date().getFullYear()

  const browseColumn = {
    title: t.browse,
    links: [
      ...categories.slice(0, 3).map((c) => ({ label: c.name, href: categoryHref(lang, c.slug) })),
      t.nav[0],
    ],
  }
  const footerColumns = [...t.footerColumns, browseColumn]

  return (
    <footer className="bg-paper border-t border-paper-border mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14">
        <p className="max-w-3xl mx-auto text-center text-xs leading-loose text-paper-secondary">
          {t.footerDisclaimer}
        </p>

        <Link
          href={homeHref(lang)}
          className="flex items-center justify-center gap-3 text-2xl font-bold tracking-tight text-paper-ink hover:text-brand-600 transition-colors mt-11"
        >
          <Image src="/logo-sa-mark.png" alt={SITE_NAME} width={38} height={38} />
          {SITE_NAME}
        </Link>

        {isHome ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-11">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <div className="text-sm font-bold text-paper-ink mb-4">{col.title}</div>
                <ul className="grid gap-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}
                        className="text-xs text-paper-secondary hover:text-brand-600 transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <nav
            aria-label={t.footerNav}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-paper-secondary my-9"
          >
            {t.nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-paper-ink transition-colors">
                {item.label}
              </Link>
            ))}
            <Link href={`${prefix}/privacy`} className="hover:text-paper-ink transition-colors">
              {t.privacy}
            </Link>
            <Link href={`${prefix}/terms`} className="hover:text-paper-ink transition-colors">
              {t.terms}
            </Link>
          </nav>
        )}

        <div className="border-t border-paper-border pt-7 pb-14 text-center">
          <div className="text-xs text-paper-muted">
            © {year} {SITE_NAME}. All rights reserved.
          </div>
          <div className="text-xs text-paper-muted mt-2">
            {t.operatedBy(COMPANY_NAME, COMPANY_REG_NO)}
          </div>
          {/* 編輯部信箱露在頁尾：可查證的聯絡方式是 E-E-A-T 的一部分，之前只有文章頁底部有 */}
          <div className="text-xs text-paper-muted mt-2">
            <a href={`mailto:${EDITORIAL_EMAIL}`} className="hover:text-brand-600 transition-colors">{EDITORIAL_EMAIL}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
