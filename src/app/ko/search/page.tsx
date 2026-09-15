import type { Metadata } from 'next'
import SearchView, { searchMetadata, type SearchRouteProps } from '@/views/SearchView'

export function generateMetadata(): Metadata {
  return searchMetadata('ko')
}

export default function KoSearchPage(props: SearchRouteProps) {
  return <SearchView lang="ko" {...props} />
}
