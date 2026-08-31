import Link from 'next/link'
import Image from 'next/image'
import { WPPostCard } from '@/types/wordpress'
import Badge from '@/components/ui/Badge'
import ArticleTypeBadge from '@/components/article/ArticleTypeBadge'
import { resolveArticleType } from '@/lib/article-type'

interface ArticleCardProps {
  post: WPPostCard
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ArticleCard({ post }: ArticleCardProps) {
  const category = post.categories.nodes[0]
  const href = category ? `/${category.slug}/${post.slug}` : `/${post.slug}`

  return (
    <article className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200">
      {/* Thumbnail */}
      <Link href={href} className="block relative aspect-[16/9] bg-gray-100 overflow-hidden">
        {post.featuredImage?.node ? (
          <Image
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-400 text-sm">spaceA</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {category && <Badge label={category.name} href={`/${category.slug}`} />}
          <ArticleTypeBadge type={resolveArticleType(post.articleTypes)} size="sm" />
        </div>

        <Link href={href} className="flex-1">
          <h2 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors mt-1">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p
            className="text-sm text-gray-500 line-clamp-2 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: post.excerpt.replace(/<[^>]*>/g, ''),
            }}
          />
        )}

        <time dateTime={post.date} className="text-xs text-gray-400 mt-1">
          {formatDate(post.date)}
        </time>
      </div>
    </article>
  )
}
