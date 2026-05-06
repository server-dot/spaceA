import { WPPostCard } from '@/types/wordpress'
import ArticleCard from './ArticleCard'

interface ArticleGridProps {
  posts: WPPostCard[]
}

export default function ArticleGrid({ posts }: ArticleGridProps) {
  if (posts.length === 0) {
    return (
      <p className="text-center text-gray-500 py-16">目前尚無文章。</p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <ArticleCard key={post.slug} post={post} />
      ))}
    </div>
  )
}
