import type { Metadata } from 'next'
import '../globals.css'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants'
import RootShell from '@/components/layout/RootShell'

export const revalidate = 3600

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: '%s', // 不加站名後綴：Google 自己會在標題上方顯示 spacea.com.tw，後綴只是吃掉標題字數
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
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

// 中文站的 root layout；英文站是 app/en/layout.tsx，兩邊共用 RootShell（見該檔說明）
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="zh">{children}</RootShell>
}
