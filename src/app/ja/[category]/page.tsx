import type { Metadata } from 'next'
import CategoryView, {
  categoryStaticParams,
  generateCategoryMetadata,
  type CategoryRouteProps,
} from '@/views/CategoryView'

export const revalidate = 3600

export function generateStaticParams() {
  return categoryStaticParams('ja')
}

export function generateMetadata(props: CategoryRouteProps): Promise<Metadata> {
  return generateCategoryMetadata('ja', props)
}

export default function JaCategoryPage(props: CategoryRouteProps) {
  return <CategoryView lang="ja" {...props} />
}
