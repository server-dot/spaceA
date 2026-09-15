import type { Metadata } from 'next'
import CategoryView, {
  categoryStaticParams,
  generateCategoryMetadata,
  type CategoryRouteProps,
} from '@/views/CategoryView'

export const revalidate = 3600

export function generateStaticParams() {
  return categoryStaticParams('ko')
}

export function generateMetadata(props: CategoryRouteProps): Promise<Metadata> {
  return generateCategoryMetadata('ko', props)
}

export default function KoCategoryPage(props: CategoryRouteProps) {
  return <CategoryView lang="ko" {...props} />
}
