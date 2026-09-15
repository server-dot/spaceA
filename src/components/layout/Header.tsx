import Link from 'next/link'
import Image from 'next/image'
import { SITE_NAME } from '@/lib/constants'
import { homeHref, type Lang } from '@/lib/i18n'
import Navigation from './Navigation'
import SearchBar from './SearchBar'
import LangSwitch from './LangSwitch'
import MobileMenu from './MobileMenu'

export default function Header({ lang }: { lang: Lang }) {
  return (
    // sticky 本身就是定位元素，手機選單面板可以直接對它絕對定位（不要再加 relative，會跟 sticky 搶 position）
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b border-paper-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          <Link
            href={homeHref(lang)}
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-paper-ink hover:text-brand-600 transition-colors shrink-0"
          >
            <Image src="/logo-sa-mark.png" alt="" width={30} height={30} className="block" />
            {SITE_NAME}
          </Link>
          <div className="flex items-center gap-2 md:gap-5">
            {/* 桌機才把選單與搜尋排在同一列，手機收進漢堡（見 MobileMenu） */}
            <div className="hidden md:flex md:items-center md:gap-5">
              <Navigation lang={lang} />
              <SearchBar lang={lang} />
            </div>
            <LangSwitch lang={lang} />
            <MobileMenu lang={lang} />
          </div>
        </div>
      </div>
    </header>
  )
}
