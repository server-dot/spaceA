import type { Metadata } from 'next'
import ArticleView, {
  articleStaticParams,
  generateArticleMetadata,
  type ArticleRouteProps,
} from '@/views/ArticleView'

export const revalidate = 3600

export function generateStaticParams() {
  return articleStaticParams('en')
}

export function generateMetadata(props: ArticleRouteProps): Promise<Metadata> {
  return generateArticleMetadata('en', props)
}

export default function EnArticlePage(props: ArticleRouteProps) {
  return <ArticleView lang="en" {...props} />
}
