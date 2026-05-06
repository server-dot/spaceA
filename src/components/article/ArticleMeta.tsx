import { WPPost } from '@/types/wordpress'
import Badge from '@/components/ui/Badge'

interface ArticleMetaProps {
  post: WPPost
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ArticleMeta({ post }: ArticleMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
      <span>{post.author?.node?.name}</span>
      <span>·</span>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      {(post.tags?.nodes?.length ?? 0) > 0 && (
        <>
          <span>·</span>
          <div className="flex flex-wrap gap-1.5">
            {post.tags.nodes.map((tag) => (
              <Badge key={tag.slug} label={tag.name} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
