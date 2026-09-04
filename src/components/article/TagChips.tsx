interface TagChipsProps {
  tags: { name: string; slug: string }[]
  max?: number
  size?: 'sm' | 'md'
}

export default function TagChips({ tags, max, size = 'sm' }: TagChipsProps) {
  if (!tags.length) return null

  const shown = max ? tags.slice(0, max) : tags
  const extra = max && tags.length > max ? tags.length - max : 0
  const chipClass = size === 'sm' ? 'text-[13px] px-2.5 py-1' : 'text-sm px-2.5 py-1'

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((tag) => (
        <span
          key={tag.slug}
          className={`inline-block whitespace-nowrap rounded-full border border-paper-border text-paper-secondary ${chipClass}`}
        >
          {tag.name}
        </span>
      ))}
      {extra > 0 && <span className={`inline-block text-paper-muted ${chipClass}`}>+{extra}</span>}
    </div>
  )
}
