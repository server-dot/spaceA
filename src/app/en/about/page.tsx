import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import { SITE_NAME, EDITORIAL_EMAIL } from '@/lib/constants'
import Link from 'next/link'
import Reveal from '@/components/ui/Reveal'

// 英文版關於我們。內容照 app/(zh)/about/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  'spaceA is a Traditional Chinese recommendation site from Taiwan, now with English editions. Why we built it, how the editorial team is organised, FAQ and site progress.'
const LAST_UPDATED = '2026-09-04'

const BREADCRUMBS = [
  { label: 'Home', href: '/en' },
  { label: 'About', href: '/en/about' },
]

const TOC_ITEMS = [
  { label: 'Why this site exists', href: '#why' },
  { label: 'Editorial team', href: '#team' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Site progress', href: '#timeline' },
]

const TIMELINE = [
  {
    date: 'May 2026',
    title: 'Started building',
    body: 'Planned the site structure and content direction, starting from topics readers actually search and compare rather than filling pages.',
  },
  {
    date: 'August 2026',
    title: 'First article published',
    body: 'The first recommendation article went live, and we ran the full collect-verify-review process for real, adjusting as we went.',
  },
  {
    date: 'September 2026',
    title: 'Public launch and English editions',
    body: 'Laying the content foundation first, then expanding to more categories. We will not stuff in large batches of articles just to hit a number.',
  },
]

const FAQ_ITEMS = [
  {
    question: 'How often are articles updated?',
    answer:
      'Specs, prices and plans change over time, so we re-check official pages and retailer information every quarter. If a reader reports an error we verify and update immediately. Every article shows a last-updated date at the top.',
  },
  {
    question: 'How do you decide which topics to cover?',
    answer:
      'We prioritise topics with many options but messy public information, where readers most need someone to organise things first. Topics are chosen by what readers actually search and compare, not by which brands want exposure.',
  },
  {
    question: 'Can brands pay to change the content?',
    answer:
      'No. The only thing spaceA sells is clearly labelled ad space. We do not accept sponsored content or sell placements in recommendation lists, rankings or conclusions. The full rules are on the Our Standards page.',
  },
  {
    question: 'What if I find an error or a broken link?',
    answer: `Email ${EDITORIAL_EMAIL} or use the contact page. We verify, correct the article and update its last-updated date.`,
  },
]

export const metadata: Metadata = {
  title: 'About',
  description: DESCRIPTION,
  alternates: staticAlternates('en', '/about'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
    title: 'About',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function EnAboutPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <FaqJsonLd items={FAQ_ITEMS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-14 pt-8 pb-20 items-start">
            <article>
              <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px] text-balance">
                About spaceA
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 max-w-2xl text-balance">
                spaceA is a recommendation site from Taiwan. We write curated recommendation articles across industries, giving
                consumers honest, useful reference information before they decide.
              </p>
              <p className="text-xs text-paper-muted mt-3">
                Last updated: <time dateTime={LAST_UPDATED}>September 4, 2026</time>
              </p>

              <Reveal as="section" id="why" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">Why build this site?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  The problem with finding information online is rarely that there is no answer. It is that there are too many
                  answers from too many angles: sponsored posts crown every brand number one, forum comments are hard to verify,
                  and comparison lists are often padded for length rather than built to help you decide. spaceA exists to fix
                  that: we gather the public discussion, specs and prices scattered across platforms, cross-check them, and write
                  down how to judge the decision in a way you can actually read.
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  A common example: search for any product category and nine out of ten articles list nearly identical &quot;pros&quot;
                  with only the brand name swapped. That usually means they share one press release rather than doing their own
                  checking. It looks like a lot of information, but it does nothing to help you choose, and it can even make every
                  option look equally good.
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  We are not telling you what you should pick. We lay out the criteria and let you decide whether to follow them.
                  When we cannot reach a confident conclusion, we say the data is insufficient instead of forcing a tidy answer. The
                  full process is on the{' '}
                  <Link href="/en/standards" className="font-bold text-brand-600">
                    Our Standards
                  </Link>{' '}
                  page.
                </p>
              </Reveal>

              <Reveal as="section" id="team" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">Who writes these articles?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  Articles are written by the spaceA editorial team, split into three roles: collecting and organising public
                  discussion, verifying specs and prices, and reviewing and publishing. Every article names the editor
                  responsible.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 mt-7 max-w-2xl">
                  {[
                    { title: 'Research', body: 'Compile public discussion and reviews into a comparison list.' },
                    { title: 'Verification', body: 'Confirm specs and prices against official and retailer pages.' },
                    { title: 'Review', body: 'Check that every conclusion has a basis and every source is cited.' },
                  ].map((role) => (
                    <div key={role.title} className="border-t-2 border-brand-600 pt-3.5">
                      <b className="text-base font-bold text-paper-ink">{role.title}</b>
                      <p className="text-sm leading-loose text-paper-secondary mt-1.5">{role.body}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal as="section" id="faq" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">FAQ</h2>
                <div className="grid mt-6 divide-y divide-[#eeeae2] max-w-2xl">
                  {FAQ_ITEMS.map((item) => (
                    <div key={item.question} className="py-5">
                      <b className="block text-base font-bold text-paper-ink">{item.question}</b>
                      <p className="text-base leading-loose text-paper-body mt-2 text-balance">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal as="section" id="timeline" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">Site progress</h2>
                <ol className="grid gap-8 mt-6 pl-[34px] border-l-2 border-brand-200 list-none max-w-2xl">
                  {TIMELINE.map((item, i) => (
                    <Reveal as="li" key={item.date} delay={i * 120} className="relative">
                      <span className="absolute -left-[43px] top-0.5 w-[18px] h-[18px] rounded-full bg-brand-600" />
                      <b className="block text-xs font-bold tracking-wider text-brand-600">{item.date}</b>
                      <b className="block text-lg font-bold text-paper-ink mt-1.5">{item.title}</b>
                      <p className="text-base leading-loose text-paper-body mt-2 text-balance">{item.body}</p>
                    </Reveal>
                  ))}
                </ol>
              </Reveal>
            </article>

            <PageToc items={TOC_ITEMS} title="On this page" />
          </div>
        </div>
      </div>
    </>
  )
}
