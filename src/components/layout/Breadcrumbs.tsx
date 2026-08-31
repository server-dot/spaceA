import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href: string
  /** 文章類型（推薦文／知識分享）用膠囊樣式呈現，跟一般文字麵包屑分開 */
  pill?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="麵包屑" className="text-sm text-gray-500">
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && (
                <span aria-hidden="true" className="text-gray-300">/</span>
              )}
              {item.pill ? (
                <Link
                  href={item.href}
                  className="text-paper-secondary bg-paper-surface rounded-full px-2.5 py-0.5 text-[13px] hover:text-paper-ink transition-colors"
                >
                  {item.label}
                </Link>
              ) : isLast ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
