import Link from 'next/link'
import { NAV_ITEMS } from '@/lib/constants'

export default function Navigation() {
  return (
    <nav aria-label="主選單">
      <ul className="flex items-center gap-1 flex-wrap">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
