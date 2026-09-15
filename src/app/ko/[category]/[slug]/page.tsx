import type { Metadata } from 'next'
import ArticleView, {
  articleStaticParams,
  generateArticleMetadata,
  type ArticleRouteProps,
} from '@/views/ArticleView'

export const revalidate = 3600

export function generateStaticParams() {
  return articleStaticParams('ko')
}

export function generateMetadata(props: ArticleRouteProps): Promise<Metadata> {
  return generateArticleMetadata('ko', props)
}

export default function KoArticlePage(props: ArticleRouteProps) {
  return <ArticleView lang="ko" {...props} />
}
