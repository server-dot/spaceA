import type { Metadata } from 'next'
import SearchView, { searchMetadata, type SearchRouteProps } from '@/views/SearchView'

export function generateMetadata(): Metadata {
  return searchMetadata('en')
}

export default function EnSearchPage(props: SearchRouteProps) {
  return <SearchView lang="en" {...props} />
}
