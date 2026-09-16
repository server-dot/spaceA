import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'

// 英文版推薦標準。內容照 app/(zh)/standards/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  'How spaceA gathers public discussion and reviews, how we cross-check, how partnerships are disclosed, and how to get an error corrected.'
const LAST_UPDATED = '2026-08-28'

const BREADCRUMBS = [
  { label: 'Home', href: '/en' },
  { label: 'Our Standards', href: '/en/standards' },
]

const TOC_ITEMS = [
  { label: 'How we gather data', href: '#how' },
  { label: 'What we do not do', href: '#limits' },
  { label: 'Ads and partnerships', href: '#disclosure' },
  { label: 'Corrections', href: '#corrections' },
]

export const metadata: Metadata = {
  title: 'Our Standards',
  description: DESCRIPTION,
  alternates: staticAlternates('en', '/standards'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
    title: 'Our Standards',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function EnStandardsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-14 pt-8 pb-20 items-start">
            <article>
              <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px] text-balance">
                Our Standards
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 max-w-2xl text-balance">
                spaceA is a recommendation site from Taiwan. We do not pretend to have tried everything ourselves. What we do is
                gather public online discussion, cross-check it, and have our editors turn it into advice you can act on, citing
                the source and update date of every claim.
              </p>
              <p className="text-xs text-paper-muted mt-3">
                Last updated: <time dateTime={LAST_UPDATED}>August 28, 2026</time>
              </p>

              <section id="how" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  How do we gather data and write recommendations?
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  Every article goes through the three steps below before it is published. If we could not find something,
                  we say so in the article instead of making up a number.
                </p>
                <ol className="grid gap-8 mt-8 pl-[34px] border-l-2 border-brand-200 list-none max-w-2xl">
                  {[
                    {
                      n: '01',
                      title: 'Collect',
                      body: 'Compile public reviews from forums, social media and marketplaces, log how often each model is mentioned and how it is rated, and find the pros and cons people keep repeating.',
                    },
                    {
                      n: '02',
                      title: 'Cross-check',
                      body: 'Specs, prices and service terms are always confirmed against official pages and retailers, never a single source. When sources contradict each other we say so in the article instead of picking the nicer one.',
                    },
                    {
                      n: '03',
                      title: 'Cite and update',
                      body: 'Each article lists its source types at the end and shows publish and last-updated dates. Prices and retailer details are re-checked every quarter.',
                    },
                  ].map((step) => (
                    <li key={step.n} className="relative">
                      <span className="absolute -left-[43px] top-0.5 w-[18px] h-[18px] rounded-full bg-brand-600" />
                      <b className="block text-xs font-bold tracking-wider text-brand-600">STEP {step.n}</b>
                      <b className="block text-lg font-bold text-paper-ink mt-1.5">{step.title}</b>
                      <p className="text-base leading-loose text-paper-body mt-2 text-balance">{step.body}</p>
                    </li>
                  ))}
                </ol>
              </section>

              <section id="limits" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">What do we not do?</h2>
                <ul className="grid mt-6 divide-y divide-[#eeeae2] text-base leading-loose text-paper-body max-w-2xl">
                  <li className="py-4 text-balance">
                    No sponsored content, no paid rankings. The only thing we sell is clearly labelled ad space. Brands cannot pay
                    for a recommendation, a ranking or a changed conclusion, and they do not get to review drafts.
                  </li>
                  <li className="py-4 text-balance">
                    No claiming tests we did not run. Each article states whether a conclusion comes from testing, user feedback
                    or the brand.
                  </li>
                  <li className="py-4 text-balance">
                    No unsupported numbers. When there is no verifiable figure we describe without numbers, or say the data is
                    insufficient.
                  </li>
                  <li className="py-4 text-balance">
                    No padding lists for ranking. If only three options are worth recommending, we list three.
                  </li>
                  <li className="py-4 text-balance">
                    No personalised medical, legal or investment advice. For health topics, defer to your clinician.
                  </li>
                </ul>
              </section>

              <section id="disclosure" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  How are ads and partnerships disclosed?
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  spaceA earns revenue from ad space. What we sell is ad placements labelled as such, never
                  the articles themselves:
                </p>
                <ul className="grid gap-[18px] mt-6 list-none max-w-2xl">
                  {[
                    'Links in articles go straight to brand or retailer pages. They are not affiliate links, and spaceA earns nothing when you click or buy.',
                    'Ad space is open for booking. Ads are labelled as ads and kept separate from articles; there are no ads dressed up as reviews. Buying an ad does not get a brand into a recommendation list or move it up.',
                    'No sponsored content, no paid rankings. Recommendation lists, rankings and conclusions are not for sale, and brands cannot review or edit drafts. If a product was loaned by a brand for testing, the article says so at the top.',
                  ].map((text) => (
                    <li key={text} className="grid grid-cols-[8px_1fr] gap-4 items-start">
                      <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                      <span className="text-base leading-loose text-paper-body text-balance">{text}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section id="corrections" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">Found an error?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  Please tell us. We check the source, correct the article if it is wrong and update the last-updated date. If a
                  change affects the original recommendation, we add a correction note at the end rather than editing silently.
                </p>
                <div className="flex gap-3 flex-wrap mt-6">
                  <Link
                    href="/en/contact#form"
                    className="inline-flex items-center bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors"
                  >
                    Report an error
                  </Link>
                  <Link
                    href="/en/contact#form"
                    className="inline-flex items-center bg-paper-card hover:border-brand-600 hover:text-brand-600 text-paper-ink font-bold text-sm px-6 py-3 border border-paper-border rounded-lg transition-colors"
                  >
                    Partnerships and advertising
                  </Link>
                </div>
              </section>
            </article>

            <PageToc items={TOC_ITEMS} title="On this page" />
          </div>
        </div>
      </div>
    </>
  )
}
