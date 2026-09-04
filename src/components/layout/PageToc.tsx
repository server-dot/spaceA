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
    <aside className="lg:sticky lg:top-24 bg-white border border-paper-border rounded-2xl p-[22px]">
      <div className="flex items-center gap-2">
        <span className="w-[18px] h-0.5 bg-brand-600" />
        <div className="text-xs tracking-wider text-paper-muted font-bold">本頁內容</div>
      </div>
      <ul className="grid mt-3.5 text-sm">
        {items.map((item) => (
          <li key={item.href} className="border-t border-paper-border">
            <Link href={item.href} className="block py-2.5 text-paper-body hover:text-brand-600 transition-colors">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      {extraLinks && extraLinks.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-paper-border grid gap-2.5 text-sm">
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
