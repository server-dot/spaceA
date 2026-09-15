import type { Metadata } from 'next'
import ArticleView, {
  articleStaticParams,
  generateArticleMetadata,
  type ArticleRouteProps,
} from '@/views/ArticleView'

// 文章頁少了這行，部署完內容就凍在 build 當下：WordPress 改了字要等下次部署才會更新。
// 首頁、分類頁、sitemap 都是 3600，這裡跟著一致（之後接上 on-demand webhook 可以再縮短）
export const revalidate = 3600

export function generateStaticParams() {
  return articleStaticParams('zh')
}

export function generateMetadata(props: ArticleRouteProps): Promise<Metadata> {
  return generateArticleMetadata('zh', props)
}

export default function ArticlePage(props: ArticleRouteProps) {
  return <ArticleView lang="zh" {...props} />
}
