import type { Metadata } from 'next'
import CategoryView, {
  categoryStaticParams,
  generateCategoryMetadata,
  type CategoryRouteProps,
} from '@/views/CategoryView'

export const revalidate = 3600

export function generateStaticParams() {
  return categoryStaticParams('zh')
}

export function generateMetadata(props: CategoryRouteProps): Promise<Metadata> {
  return generateCategoryMetadata('zh', props)
}

export default function CategoryPage(props: CategoryRouteProps) {
  return <CategoryView lang="zh" {...props} />
}
