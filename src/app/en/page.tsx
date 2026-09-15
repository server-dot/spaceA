import type { Metadata } from 'next'
import HomeView, { homeMetadata } from '@/views/HomeView'

export const revalidate = 3600

export const metadata: Metadata = homeMetadata('en')

export default function EnHomePage() {
  return <HomeView lang="en" />
}
