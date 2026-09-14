import type { Metadata } from 'next'
import { Noto_Sans_TC, Noto_Serif_TC } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'
import './globals.css'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, GA_ID, EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WebsiteJsonLd from '@/components/seo/WebsiteJsonLd'
import OrganizationJsonLd from '@/components/seo/OrganizationJsonLd'
import { fetchQuery } from '@/lib/graphql/client'
import { GET_NAVIGATION } from '@/lib/graphql/queries/navigation'
import { WPCategory } from '@/types/wordpress'

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
})

const notoSerifTC = Noto_Serif_TC({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-noto-serif-tc',
  display: 'swap',
})

export const revalidate = 3600

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
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

interface NavigationData {
  categories: { nodes: WPCategory[] }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navData = await fetchQuery<NavigationData>(GET_NAVIGATION)
  const categories = (navData?.categories?.nodes ?? []).filter(
    (c) => !EXCLUDED_CATEGORY_SLUGS.includes(c.slug)
  )

  // suppressHydrationWarning：js-flag 會在 hydration 前把 class="js" 加到 <html>，React 比對時會差這一個 class
  return (
    <html lang="zh-TW" className={`${notoSansTC.variable} ${notoSerifTC.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-paper text-paper-ink">
        {/* 標記 JS 可用，globals.css 的進場動畫（.reveal／.hero-in）只在有 JS 時才先把元素藏起來 */}
        <Script id="js-flag" strategy="beforeInteractive">{`document.documentElement.classList.add('js')`}</Script>
        <WebsiteJsonLd />
        <OrganizationJsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer categories={categories} />
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  )
}
