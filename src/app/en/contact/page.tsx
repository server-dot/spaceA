import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ContactForm from '@/views/ContactForm'
import { SITE_NAME, COMPANY_ADDRESS, COMPANY_PHONE, EDITORIAL_EMAIL, TECH_EMAIL } from '@/lib/constants'
import Link from 'next/link'
import Reveal from '@/components/ui/Reveal'

// 英文版聯絡我們。內容照 app/(zh)/contact/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  'How to reach spaceA for corrections, topic suggestions, advertising and content licensing. Corrections are handled first.'

const BREADCRUMBS = [
  { label: 'Home', href: '/en' },
  { label: 'Contact', href: '/en/contact' },
]

export const metadata: Metadata = {
  title: 'Contact',
  description: DESCRIPTION,
  alternates: {
    canonical: '/en/contact',
    languages: { 'zh-TW': '/contact', en: '/en/contact', 'x-default': '/contact' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
    title: 'Contact',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function EnContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <section className="pt-8 max-w-3xl">
            <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px]">
              Contact us
            </h1>
            <p className="text-[17px] leading-loose text-paper-body mt-5 text-balance">
              Spotted an error, want to suggest a topic, or talk about advertising and content licensing? This is the place.
              Corrections come first: after checking, we fix the article and update its last-updated date.
            </p>
            <p className="text-sm leading-loose text-paper-secondary mt-3.5 text-balance">
              Editorial and commercial matters are handled separately at spaceA. Recommendation lists and rankings are not for
              sale, and we do not accept sponsored content. Details are in{' '}
              <Link href="/en/standards" className="text-brand-600 font-bold">
                Our Standards
              </Link>
              .
            </p>
          </section>

          <section
            id="form"
            className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 items-start mt-14 pt-10 border-t border-paper-border"
          >
            <div>
              <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">Contact details</h2>
              <ul className="grid mt-6 divide-y divide-[#eeeae2]">
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">Editorial</b>
                  <a href={`mailto:${EDITORIAL_EMAIL}`} className="text-[15px] font-medium text-brand-600">
                    {EDITORIAL_EMAIL}
                  </a>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">
                    Corrections, topic suggestions, and anything else
                  </p>
                </li>
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">Technical</b>
                  <a href={`mailto:${TECH_EMAIL}`} className="text-[15px] font-medium text-brand-600">
                    {TECH_EMAIL}
                  </a>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">
                    Site problems, pages that will not load or display errors
                  </p>
                </li>
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">Phone and office hours</b>
                  <a href="tel:+886227457601" className="text-[15px] font-medium text-brand-600">
                    +886 {COMPANY_PHONE.replace(/^0/, '')}
                  </a>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">Mon–Fri, 10:00–19:00 (UTC+8)</p>
                </li>
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">Office</b>
                  <span className="text-[15px] text-paper-body">
                    11F, No. 49, Dongxing Rd., Xinyi District, Taipei, Taiwan ({COMPANY_ADDRESS})
                  </span>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">
                    Email first to book a time if you would like to meet in person
                  </p>
                </li>
              </ul>

              <div className="mt-5 border border-paper-border rounded-2xl overflow-hidden">
                <iframe
                  title="Stack Media Marketing office map"
                  src="https://maps.google.com/maps?q=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%BF%A1%E7%BE%A9%E5%8D%80%E6%9D%B1%E8%88%88%E8%B7%AF49%E8%99%9F11%E6%A8%93&t=m&z=16&hl=en&output=embed&iwloc=near"
                  width="100%"
                  height="300"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block border-0"
                />
              </div>
            </div>

            <ContactForm lang="en" />
          </section>

          <Reveal as="section" className="mt-14 pt-10 border-t border-paper-border">
            <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">How we handle messages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 mt-7">
              <div className="border-t-2 border-brand-600 pt-3.5">
                <b className="text-base font-bold text-paper-ink">Corrections first</b>
                <p className="text-[15px] leading-loose text-paper-secondary mt-1.5">
                  We check the source, correct the article and update its last-updated date; if the original conclusion changes
                  we add a correction note.
                </p>
              </div>
              <div className="border-t-2 border-brand-600 pt-3.5">
                <b className="text-base font-bold text-paper-ink">We always reply</b>
                <p className="text-[15px] leading-loose text-paper-secondary mt-1.5">
                  Partnership enquiries and topic suggestions all get a reply; if a topic is already planned we will share the
                  timeline.
                </p>
              </div>
              <div className="border-t-2 border-brand-600 pt-3.5">
                <b className="text-base font-bold text-paper-ink">No paid placements</b>
                <p className="text-[15px] leading-loose text-paper-secondary mt-1.5">
                  Requests to buy a spot in a recommendation list, a ranking or a changed conclusion are politely declined.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  )
}
