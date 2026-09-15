import type { Metadata } from 'next'
import CategoryView, {
  categoryStaticParams,
  generateCategoryMetadata,
  type CategoryRouteProps,
} from '@/views/CategoryView'

export const revalidate = 3600

export function generateStaticParams() {
  return categoryStaticParams('en')
}

export function generateMetadata(props: CategoryRouteProps): Promise<Metadata> {
  return generateCategoryMetadata('en', props)
}

export default function EnCategoryPage(props: CategoryRouteProps) {
  return <CategoryView lang="en" {...props} />
}
