import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'

// 英文版使用條款。內容照 app/(zh)/terms/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  'How spaceA content may be used, rules for reposting and quoting, disclaimers, third-party links, and how these terms change.'
const LAST_UPDATED = '2026-08-28'

const BREADCRUMBS = [
  { label: 'Home', href: '/en' },
  { label: 'Terms of Use', href: '/en/terms' },
]

const TOC_ITEMS = [
  { label: 'Using and reposting content', href: '#content' },
  { label: 'Disclaimer', href: '#disclaimer' },
  { label: 'Third-party links and ads', href: '#thirdparty' },
  { label: 'Prohibited conduct', href: '#conduct' },
]

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: DESCRIPTION,
  alternates: staticAlternates('en', '/terms'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
    title: 'Terms of Use',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function EnTermsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-14 pt-8 pb-20 items-start">
            <article className="max-w-3xl">
              <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px]">
                Terms of Use
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 text-balance">
                Please read the following before using spaceA. By continuing to browse the site you agree to these terms.
              </p>
              <p className="text-xs text-paper-muted mt-3">
                Last updated: <time dateTime={LAST_UPDATED}>August 28, 2026</time>
              </p>

              <section id="content" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">How may the content be used?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  The articles, charts and editorial work on this site are copyright of spaceA and its licensors. You are welcome
                  to read, share links and quote within reasonable limits.
                </p>
                <ul className="grid mt-6 divide-y divide-[#eeeae2] text-base leading-loose text-paper-body">
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">Allowed</b>: quoting a single paragraph or figure with attribution and
                    a link to the original.
                  </li>
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">Requires a licence</b>: reposting a full article, translating,
                    rewriting, commercial publication, or training commercial models.
                  </li>
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">Not allowed</b>: removing attribution, or altering conclusions while
                    still presenting the content as spaceA&apos;s.
                  </li>
                </ul>
                <p className="text-sm leading-relaxed text-paper-secondary mt-3">
                  For licensing, use the{' '}
                  <Link href="/en/contact#form" className="text-brand-600 font-bold">
                    contact form
                  </Link>{' '}
                  and select &quot;Content licensing&quot;.
                </p>
              </section>

              <section id="disclaimer" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  What is the scope of the disclaimer?
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  Our content compiles public information and user feedback, verified by our editors, and is provided for
                  reference. It is not personalised advice. Specs, prices and availability can change at any time; check the
                  retailer and official information before buying.
                </p>
                <ul className="grid gap-[18px] mt-6 list-none">
                  <li className="grid grid-cols-[8px_1fr] gap-4 items-start">
                    <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                    <span className="text-base leading-loose text-paper-body text-balance">
                      Medical, health, legal and financial content is no substitute for a professional&apos;s diagnosis or advice.
                    </span>
                  </li>
                  <li className="grid grid-cols-[8px_1fr] gap-4 items-start">
                    <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                    <span className="text-base leading-loose text-paper-body text-balance">
                      Purchases or other decisions made based on this site are at the user&apos;s own risk.
                    </span>
                  </li>
                  <li className="grid grid-cols-[8px_1fr] gap-4 items-start">
                    <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                    <span className="text-base leading-loose text-paper-body text-balance">
                      If you find an error, please follow the{' '}
                      <Link href="/en/standards#corrections" className="text-brand-600 font-bold">
                        corrections process
                      </Link>{' '}
                      and we will verify and act on it.
                    </span>
                  </li>
                </ul>
              </section>

              <section id="thirdparty" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  How are third-party links and ads handled?
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  This site links to marketplaces, brand websites and other sites, some through affiliate links. Their content,
                  terms and privacy policies are the responsibility of those sites; spaceA has no control over them and accepts
                  no liability for them.
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  Ads are kept separate from editorial content. The only thing we sell is clearly labelled ad space; we do not accept
                  sponsored content, and recommendation lists and rankings are not for sale. See the{' '}
                  <Link href="/en/standards#disclosure" className="text-brand-600 font-bold">
                    partnership disclosure
                  </Link>
                  .
                </p>
              </section>

              <section id="conduct" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">What should you avoid on this site?</h2>
                <ul className="grid mt-6 divide-y divide-[#eeeae2] text-base leading-loose text-paper-body">
                  <li className="py-4">Bulk scraping content with automated tools, or otherwise interfering with normal operation.</li>
                  <li className="py-4">Impersonating others to send false correction requests or partnership enquiries.</li>
                  <li className="py-4">Using this site&apos;s content in marketing that misleads consumers.</li>
                </ul>
              </section>

              <section className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="text-xs font-bold tracking-wider text-paper-secondary">Changes and governing law</h2>
                <p className="text-[15px] leading-loose text-paper-secondary mt-2.5 text-balance">
                  If these terms change, we update this page and its last-updated date. These terms are governed by the laws of
                  the Republic of China (Taiwan). The Traditional Chinese version prevails if the two versions differ.
                </p>
              </section>
            </article>

            <PageToc
              items={TOC_ITEMS}
              title="On this page"
              extraLinks={[
                { label: 'Privacy Policy', href: '/en/privacy' },
                { label: 'Our Standards', href: '/en/standards' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  )
}
