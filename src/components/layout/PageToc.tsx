import Link from 'next/link'

interface TocItem {
  label: string
  href: string
}

interface PageTocProps {
  items: TocItem[]
  extraLinks?: TocItem[]
}

export default function PageToc({ items, extraLinks }: PageTocProps) {
  return (
    <aside className="lg:sticky lg:top-24 bg-white border border-paper-border rounded-2xl p-6">
      <div className="text-xs tracking-wider text-paper-muted font-bold">本頁內容</div>
      <ul className="grid gap-3 mt-4 text-sm">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-paper-body hover:text-brand-600 transition-colors">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      {extraLinks && extraLinks.length > 0 && (
        <div className="mt-5 pt-4 border-t border-paper-border grid gap-3 text-sm">
          {extraLinks.map((item) => (
            <Link key={item.href} href={item.href} className="font-bold text-brand-600">
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </aside>
  )
}
