import type { Metadata } from 'next'
import HomeView, { homeMetadata } from '@/views/HomeView'

export const revalidate = 3600

export const metadata: Metadata = homeMetadata('zh')

export default function HomePage() {
  return <HomeView lang="zh" />
}
