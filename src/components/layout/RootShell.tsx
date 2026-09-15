import { Noto_Sans_TC, Noto_Serif_TC } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'
import { GA_ID, EXCLUDED_CATEGORY_SLUGS } from '@/lib/constants'
import { LANG_TAG, langOfCategorySlug, type Lang } from '@/lib/i18n'
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

interface NavigationData {
  categories: { nodes: WPCategory[] }
}

/**
 * 中文（app/(zh)/layout.tsx）與英文（app/en/layout.tsx）各自是一個 root layout，
 * 兩邊共用這個殼：<html lang> 依語言換，Header／Footer 也吃同一個 lang。
 * 拆成兩個 root layout 是為了讓 <html lang> 在伺服器端就正確——爬蟲不用等 JS。
 */
export default async function RootShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const navData = await fetchQuery<NavigationData>(GET_NAVIGATION)
  const categories = (navData?.categories?.nodes ?? []).filter(
    (c) => !EXCLUDED_CATEGORY_SLUGS.includes(c.slug) && langOfCategorySlug(c.slug) === lang
  )

  // suppressHydrationWarning：js-flag 會在 hydration 前把 class="js" 加到 <html>，React 比對時會差這一個 class
  return (
    <html lang={LANG_TAG[lang]} className={`${notoSansTC.variable} ${notoSerifTC.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-paper text-paper-ink">
        {/* 標記 JS 可用，globals.css 的進場動畫（.reveal／.hero-in）只在有 JS 時才先把元素藏起來 */}
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- App Router 的 root layout 可以用，規則只認 pages/_document */}
        <Script id="js-flag" strategy="beforeInteractive">{`document.documentElement.classList.add('js')`}</Script>
        <WebsiteJsonLd lang={lang} />
        <OrganizationJsonLd />
        <Header lang={lang} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} categories={categories} />
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  )
}
