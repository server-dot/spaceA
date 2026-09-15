import type { Metadata } from 'next'
import SearchView, { searchMetadata, type SearchRouteProps } from '@/views/SearchView'

export function generateMetadata(): Metadata {
  return searchMetadata('zh')
}

export default function SearchPage(props: SearchRouteProps) {
  return <SearchView lang="zh" {...props} />
}
