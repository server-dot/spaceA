import type { Metadata } from 'next'
import '../globals.css'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { ui } from '@/lib/i18n'
import RootShell from '@/components/layout/RootShell'

export const revalidate = 3600

const t = ui('ja')

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: t.siteDescription,
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: SITE_NAME,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// 日文站的 root layout，跟 app/(zh)/layout.tsx 平行；<html lang="ja"> 在 RootShell 裡
export default function JaRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="ja">{children}</RootShell>
}
