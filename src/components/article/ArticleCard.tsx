import Link from 'next/link'
import Image from 'next/image'
import { WPPostCard } from '@/types/wordpress'
import Badge from '@/components/ui/Badge'
import ArticleTypeBadge from '@/components/article/ArticleTypeBadge'
import TagChips from '@/components/article/TagChips'
import { resolveArticleType } from '@/lib/article-type'
import { formatDate, resolveSummary } from '@/lib/format'
import ArticleImageFallback from '@/components/article/ArticleImageFallback'
import { articleHref, articleTypeLabel, categoryHref, type Lang } from '@/lib/i18n'

interface ArticleCardProps {
  lang?: Lang
  post: WPPostCard
}

export default function ArticleCard({ lang = 'zh', post }: ArticleCardProps) {
  const category = post.categories.nodes[0]
  const href = articleHref(lang, category?.slug ?? '', post.slug)
  const type = resolveArticleType(post.articleTypes)

  return (
    <article className="group flex flex-col bg-paper-card rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200">
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
          <ArticleImageFallback size={40} />
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {category && <Badge label={category.name} href={categoryHref(lang, category.slug)} />}
          <ArticleTypeBadge type={{ ...type, name: articleTypeLabel(lang, type) }} size="sm" />
        </div>

        <Link href={href} className="flex-1">
          <h2 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors mt-1">
            {post.title}
          </h2>
        </Link>

        {resolveSummary(post.excerpt) && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {resolveSummary(post.excerpt)}
          </p>
        )}

        <time dateTime={post.date} className="text-xs text-gray-400 mt-1">
          {formatDate(post.date, lang)}
        </time>

        {post.tags.nodes.length > 0 && <TagChips tags={post.tags.nodes} max={3} />}
      </div>
    </article>
  )
}
