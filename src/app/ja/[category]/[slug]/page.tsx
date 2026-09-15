import type { Metadata } from 'next'
import ArticleView, {
  articleStaticParams,
  generateArticleMetadata,
  type ArticleRouteProps,
} from '@/views/ArticleView'

export const revalidate = 3600

export function generateStaticParams() {
  return articleStaticParams('ja')
}

export function generateMetadata(props: ArticleRouteProps): Promise<Metadata> {
  return generateArticleMetadata('ja', props)
}

export default function JaArticlePage(props: ArticleRouteProps) {
  return <ArticleView lang="ja" {...props} />
}
