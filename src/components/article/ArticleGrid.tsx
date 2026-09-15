import { WPPostCard } from '@/types/wordpress'
import ArticleCard from './ArticleCard'
import { ui, type Lang } from '@/lib/i18n'

interface ArticleGridProps {
  lang?: Lang
  posts: WPPostCard[]
}

export default function ArticleGrid({ lang = 'zh', posts }: ArticleGridProps) {
  if (posts.length === 0) {
    return <p className="text-center text-gray-500 py-16">{ui(lang).noArticles}</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <ArticleCard key={post.slug} lang={lang} post={post} />
      ))}
    </div>
  )
}
