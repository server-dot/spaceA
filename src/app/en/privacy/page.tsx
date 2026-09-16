import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import Link from 'next/link'
import { SITE_NAME, EDITORIAL_EMAIL } from '@/lib/constants'

// 英文版隱私權政策。內容照 app/(zh)/privacy/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  'What data spaceA collects, how cookies and analytics are used, how article links and ads are tracked, and the rights you can exercise.'
const LAST_UPDATED = '2026-08-28'

const BREADCRUMBS = [
  { label: 'Home', href: '/en' },
  { label: 'Privacy Policy', href: '/en/privacy' },
]

const TOC_ITEMS = [
  { label: 'What we collect', href: '#collect' },
  { label: 'How it is used', href: '#use' },
  { label: 'Cookies and analytics', href: '#cookie' },
  { label: 'Link and ad tracking', href: '#affiliate' },
  { label: 'Your rights', href: '#rights' },
]

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: DESCRIPTION,
  alternates: staticAlternates('en', '/privacy'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
    title: 'Privacy Policy',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function EnPrivacyPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-14 pt-8 pb-20 items-start">
            <article className="max-w-3xl">
              <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px]">
                Privacy Policy
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 text-balance">
                We take your privacy seriously. This page explains what data spaceA collects, what it is used for, and how you
                can exercise your rights.
              </p>
              <p className="text-xs text-paper-muted mt-3">
                Last updated: <time dateTime={LAST_UPDATED}>August 28, 2026</time>
              </p>

              <section id="collect" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">What data do we collect?</h2>
                <ul className="grid mt-6 divide-y divide-[#eeeae2] text-base leading-loose text-paper-body">
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">Data you give us</b>: the name, email, phone number and message you
                    send through the contact form or by email.
                  </li>
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">Anonymous usage statistics</b>: pages visited, referrer, device and
                    browser type, used to understand which content helps.
                  </li>
                </ul>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  There is no membership system, and we never ask for national ID numbers, bank details or other sensitive
                  personal data.
                </p>
              </section>

              <section id="use" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">What is the data used for?</h2>
                <ul className="grid gap-[18px] mt-6 list-none">
                  {[
                    'Replying to your messages, including corrections, topic suggestions and partnership enquiries.',
                    'Improving site content and experience, such as deciding which topics need more coverage and which pages readers abandon.',
                    'Measuring clicks on article links, to understand whether our recommendations are useful to readers.',
                  ].map((text) => (
                    <li key={text} className="grid grid-cols-[8px_1fr] gap-4 items-start">
                      <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                      <span className="text-base leading-loose text-paper-body text-balance">{text}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  We do not add your data to marketing lists, and we do not sell or share it with third parties unless required by
                  law or with your separate consent.
                </p>
              </section>

              <section id="cookie" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">How do cookies and analytics work?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  This site uses third-party tools such as Google Analytics for traffic analysis. They record anonymous browsing
                  information through cookies. Advertising platforms may also set cookies when you click an ad, to record where
                  the visit came from.
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  You can disable or delete cookies in your browser settings. The site remains fully readable with cookies
                  disabled, though some tracking features will stop working.
                </p>
              </section>

              <section id="affiliate" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">What do article links and ads track?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  Links in articles go straight to brand or retailer pages and do not pass through any affiliate platform. spaceA
                  never receives your order details or payment information and earns nothing from them. Ad space is served by
                  advertising platforms, which may set a cookie when you click an ad.
                </p>
                <p className="text-sm leading-relaxed text-paper-secondary mt-3">
                  The full disclosure is in our{' '}
                  <Link href="/en/standards#disclosure" className="text-brand-600 font-bold">
                    editorial standards
                  </Link>
                  .
                </p>
              </section>

              <section id="rights" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">What rights can you exercise?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  You can ask to access, correct or delete the data we hold about you, or ask us to stop using it. Just email us;
                  we will verify your identity and act on it.
                </p>
                <div className="mt-6 border-l-2 border-brand-200 pl-[22px]">
                  <b className="text-xs font-bold tracking-wider text-brand-600">Contact</b>
                  <p className="text-base leading-loose text-paper-body mt-2 text-balance">
                    For privacy matters, email{' '}
                    <a href={`mailto:${EDITORIAL_EMAIL}`} className="text-brand-600 font-bold">
                      {EDITORIAL_EMAIL}
                    </a>{' '}
                    or use the{' '}
                    <Link href="/en/contact#form" className="text-brand-600 font-bold">
                      contact form
                    </Link>
                    .
                  </p>
                </div>
              </section>

              <section className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="text-xs font-bold tracking-wider text-paper-secondary">Changes to this policy</h2>
                <p className="text-[15px] leading-loose text-paper-secondary mt-2.5 text-balance">
                  If this policy changes, we update this page and its last-updated date. Major changes are announced on the home
                  page.
                </p>
              </section>
            </article>

            <PageToc
              items={TOC_ITEMS}
              title="On this page"
              extraLinks={[
                { label: 'Terms of Use', href: '/en/terms' },
                { label: 'Our Standards', href: '/en/standards' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  )
}
