import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import PopularRankingJsonLd from '@/components/seo/PopularRankingJsonLd'
import PopularRankingClient from './PopularRankingClient'
import { RANKED_ARTICLES, POPULAR_PAGE_DESCRIPTION } from './data'

const BREADCRUMBS = [
  { label: '首頁', href: '/' },
  { label: '熱門排行', href: '/popular' },
]

export const metadata: Metadata = {
  title: '熱門排行',
  description: POPULAR_PAGE_DESCRIPTION,
  alternates: { canonical: '/popular' },
  openGraph: {
    title: '熱門排行',
    description: POPULAR_PAGE_DESCRIPTION,
  },
}

export default function PopularPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <PopularRankingJsonLd
        items={RANKED_ARTICLES}
        description={POPULAR_PAGE_DESCRIPTION}
        dateModified="2026-08-28"
      />
      <PopularRankingClient />
    </>
  )
}
