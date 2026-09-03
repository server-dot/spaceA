'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SITE_NAME, NAV_ITEMS, COMPANY_NAME, COMPANY_REG_NO } from '@/lib/constants'
import { WPCategory } from '@/types/wordpress'

const DISCLAIMER =
  'spaceA 主打選物，提供閱讀者更多樣化選擇的資訊。本網站所載部分資訊亦有和合作廠商或相關單位合作，並由其提供產品相關資訊或第三方連結。為維護您的權益，請於使用本網站或閱讀本網站資訊時謹慎評估，資訊僅供參考之用。'

const FOOTER_COLUMNS = [
  {
    title: '關於 spaceA',
    links: [
      { label: '關於我們', href: '/about' },
      { label: '推薦標準', href: '/standards' },
      { label: '編輯部分工', href: '/about#team' },
      { label: '聯絡我們', href: '/contact' },
    ],
  },
  {
    title: '合作與加入',
    links: [
      { label: '合作洽談', href: '/contact#form' },
      { label: '廣告刊登', href: '/contact#form' },
      { label: '內容授權', href: '/contact#form' },
    ],
  },
  {
    title: '條款與政策',
    links: [
      { label: '合作與聯盟連結揭露', href: '/standards#disclosure' },
      { label: '內容更正政策', href: '/standards#corrections' },
      { label: '評測守則', href: '/standards#limits' },
      { label: '隱私權政策', href: '/privacy' },
      { label: '使用條款', href: '/terms' },
    ],
  },
]

interface FooterProps {
  categories: WPCategory[]
}

export default function Footer({ categories }: FooterProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const year = new Date().getFullYear()

  const browseColumn = {
    title: '逛逛 spaceA',
    links: [
      ...categories.slice(0, 3).map((c) => ({ label: c.name, href: `/${c.slug}` })),
      { label: '熱門排行', href: '/popular' },
    ],
  }
  const footerColumns = [...FOOTER_COLUMNS, browseColumn]

  return (
    <footer className="bg-paper border-t border-paper-border mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14">
        <p className="max-w-3xl mx-auto text-center text-xs leading-loose text-paper-secondary">
          {DISCLAIMER}
        </p>

        <Link
          href="/"
          className="flex items-center justify-center gap-3 text-2xl font-bold tracking-tight text-paper-ink hover:text-brand-600 transition-colors mt-11"
        >
          <Image src="/logo-sa-mark.png" alt="" width={38} height={38} />
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
            aria-label="頁尾連結"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-paper-secondary my-9"
          >
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-paper-ink transition-colors">
                {item.label}
              </Link>
            ))}
            <Link href="/privacy" className="hover:text-paper-ink transition-colors">
              隱私權保護政策
            </Link>
            <Link href="/terms" className="hover:text-paper-ink transition-colors">
              使用條款
            </Link>
          </nav>
        )}

        <div className="border-t border-paper-border pt-7 pb-14 text-center">
          <div className="text-xs text-paper-muted">
            © {year} {SITE_NAME}. All rights reserved.
          </div>
          <div className="text-xs text-paper-muted mt-2">
            營運公司：{COMPANY_NAME}（統編 {COMPANY_REG_NO}）
          </div>
        </div>
      </div>
    </footer>
  )
}
