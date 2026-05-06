import Link from 'next/link'
import { SITE_NAME, SITE_DESCRIPTION, NAV_ITEMS } from '@/lib/constants'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="text-xl font-bold text-white hover:text-brand-400 transition-colors">
              {SITE_NAME}
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">{SITE_DESCRIPTION}</p>
          </div>

          {/* Nav links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              快速連結
            </h3>
            <ul className="space-y-2 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              法律聲明
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  隱私權保護政策
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  與我們聯絡
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-sm text-gray-500 text-center">
          © {year} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
