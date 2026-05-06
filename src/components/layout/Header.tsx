import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'
import Navigation from './Navigation'
import SearchBar from './SearchBar'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-brand-600 transition-colors shrink-0"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 text-white text-sm font-bold">
              S
            </span>
            {SITE_NAME}
          </Link>
          <div className="flex items-center gap-2">
            <Navigation />
            <SearchBar />
          </div>
        </div>
      </div>
    </header>
  )
}
