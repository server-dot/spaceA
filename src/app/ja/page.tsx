import type { Metadata } from 'next'
import HomeView, { homeMetadata } from '@/views/HomeView'

export const revalidate = 3600

export const metadata: Metadata = homeMetadata('ja')

export default function JaHomePage() {
  return <HomeView lang="ja" />
}
