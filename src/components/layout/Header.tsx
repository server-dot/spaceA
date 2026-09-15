import Link from 'next/link'
import Image from 'next/image'
import { SITE_NAME } from '@/lib/constants'
import { homeHref, type Lang } from '@/lib/i18n'
import Navigation from './Navigation'
import SearchBar from './SearchBar'
import LangSwitch from './LangSwitch'

export default function Header({ lang }: { lang: Lang }) {
  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b border-paper-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link
            href={homeHref(lang)}
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-paper-ink hover:text-brand-600 transition-colors shrink-0"
          >
            <Image src="/logo-sa-mark.png" alt="" width={30} height={30} className="block" />
            {SITE_NAME}
          </Link>
          <div className="flex items-center gap-5">
            <Navigation lang={lang} />
            <SearchBar lang={lang} />
            <LangSwitch lang={lang} />
          </div>
        </div>
      </div>
    </header>
  )
}
