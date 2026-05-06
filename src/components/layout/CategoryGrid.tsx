import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { fetchQuery } from '@/lib/graphql/client'
import { GET_NAVIGATION } from '@/lib/graphql/queries/navigation'
import { WPCategory } from '@/types/wordpress'
import CategoryImage from './CategoryImage'

interface NavigationData {
  categories: { nodes: WPCategory[] }
}

export default async function CategoryGrid() {
  const data = await fetchQuery<NavigationData>(GET_NAVIGATION)
  const allCategories = data?.categories?.nodes ?? []

  const categoriesDir = path.join(process.cwd(), 'public', 'categories')
  const categories = allCategories.filter((cat) =>
    fs.existsSync(path.join(categoriesDir, `${cat.slug}.jpg`))
  )

  if (categories.length === 0) return null

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">瀏覽分類</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 shadow-sm hover:shadow-lg transition-all duration-200"
              >
                <CategoryImage slug={cat.slug} name={cat.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-sm leading-tight">{cat.name}</p>
                  {cat.count != null && (
                    <p className="text-white/60 text-xs mt-0.5">{cat.count} 篇</p>
                  )}
                </div>
              </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
