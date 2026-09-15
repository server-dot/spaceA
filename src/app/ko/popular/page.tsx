import type { Metadata } from 'next'
import PopularView, { popularMetadata } from '@/views/PopularView'

export const revalidate = 3600

export const metadata: Metadata = popularMetadata('ko')

export default function KoPopularPage() {
  return <PopularView lang="ko" />
}
