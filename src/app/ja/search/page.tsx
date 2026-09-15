import type { Metadata } from 'next'
import SearchView, { searchMetadata, type SearchRouteProps } from '@/views/SearchView'

export function generateMetadata(): Metadata {
  return searchMetadata('ja')
}

export default function JaSearchPage(props: SearchRouteProps) {
  return <SearchView lang="ja" {...props} />
}
