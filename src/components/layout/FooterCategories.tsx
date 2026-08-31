import Link from 'next/link'
import { fetchQuery } from '@/lib/graphql/client'
import { GET_NAVIGATION } from '@/lib/graphql/queries/navigation'
import { EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import { WPCategory } from '@/types/wordpress'

interface NavigationData {
  categories: { nodes: WPCategory[] }
}

export default async function FooterCategories() {
  const data = await fetchQuery<NavigationData>(GET_NAVIGATION)
  const categories = (data?.categories?.nodes ?? []).filter(
    (cat) => !EXCLUDED_CATEGORY_SLUGS.includes(cat.slug)
  )

  return (
    <ul className="space-y-2 text-sm">
      {categories.map((cat) => (
        <li key={cat.slug}>
          <Link href={`/${cat.slug}`} className="hover:text-white transition-colors">
            {cat.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
