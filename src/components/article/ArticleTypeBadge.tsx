import Link from 'next/link'

interface BadgeEntity {
  name: string
  slug: string
}

interface ArticleTypeBadgeProps {
  category?: BadgeEntity
  categoryHref?: string
  type?: BadgeEntity
  size?: 'sm' | 'md'
}

export default function ArticleTypeBadge({ category, categoryHref, type, size = 'md' }: ArticleTypeBadgeProps) {
  const categoryClass = size === 'sm' ? 'text-[11px]' : 'text-xs'
  const typeClass = size === 'sm' ? 'text-[11px] px-[9px] py-[2px]' : 'text-xs px-[11px] py-[3px]'

  if (!category && !type) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {category &&
        (categoryHref ? (
          <Link href={categoryHref} className={`font-bold text-brand-600 ${categoryClass}`}>
            {category.name}
          </Link>
        ) : (
          <span className={`font-bold text-brand-600 ${categoryClass}`}>{category.name}</span>
        ))}
      {type && (
        <span
          className={`inline-block whitespace-nowrap rounded-full bg-paper-surface leading-normal text-paper-secondary ${typeClass}`}
        >
          {type.name}
        </span>
      )}
    </div>
  )
}
