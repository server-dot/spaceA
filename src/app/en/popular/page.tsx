import type { Metadata } from 'next'
import PopularView, { popularMetadata } from '@/views/PopularView'

export const revalidate = 3600

export const metadata: Metadata = popularMetadata('en')

export default function EnPopularPage() {
  return <PopularView lang="en" />
}
