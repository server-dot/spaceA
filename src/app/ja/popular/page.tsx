import type { Metadata } from 'next'
import PopularView, { popularMetadata } from '@/views/PopularView'

export const revalidate = 3600

export const metadata: Metadata = popularMetadata('ja')

export default function JaPopularPage() {
  return <PopularView lang="ja" />
}
