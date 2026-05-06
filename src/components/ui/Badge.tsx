import Link from 'next/link'

interface BadgeProps {
  label: string
  href?: string
}

export default function Badge({ label, href }: BadgeProps) {
  const className =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors'

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    )
  }

  return <span className={className}>{label}</span>
}
