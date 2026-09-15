import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ContactForm from '@/views/ContactForm'
import { SITE_NAME, COMPANY_ADDRESS, COMPANY_PHONE, EDITORIAL_EMAIL, TECH_EMAIL } from '@/lib/constants'
import Link from 'next/link'
import Reveal from '@/components/ui/Reveal'

// 日文版聯絡我們。內容照 app/(zh)/contact/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  '訂正、トピック提案、広告掲載、コンテンツライセンスについての spaceA への連絡方法。訂正を最優先で処理します。'

const BREADCRUMBS = [
  { label: 'ホーム', href: '/ja' },
  { label: 'お問い合わせ', href: '/ja/contact' },
]

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: DESCRIPTION,
  alternates: staticAlternates('ja', '/contact'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: SITE_NAME,
    title: 'お問い合わせ',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function JaContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <section className="pt-8 max-w-3xl">
            <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px]">
              お問い合わせ
            </h1>
            <p className="text-[17px] leading-loose text-paper-body mt-5 text-balance">
              誤りを見つけた、トピックを提案したい、あるいは広告やコンテンツライセンスについて相談したい場合はこちらです。
              訂正を最優先とします：確認のうえ記事を修正し、最終更新日を更新します。
            </p>
            <p className="text-sm leading-loose text-paper-secondary mt-3.5 text-balance">
              Editorial and commercial matters are handled separately at spaceA. Recommendation lists and rankings are not for
              sale, and we do not accept sponsored content. Details are in{' '}
              <Link href="/ja/standards" className="text-brand-600 font-bold">
                私たちの基準
              </Link>
              .
            </p>
          </section>

          <section
            id="form"
            className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 items-start mt-14 pt-10 border-t border-paper-border"
          >
            <div>
              <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">連絡先</h2>
              <ul className="grid mt-6 divide-y divide-[#eeeae2]">
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">編集方針</b>
                  <a href={`mailto:${EDITORIAL_EMAIL}`} className="text-[15px] font-medium text-brand-600">
                    {EDITORIAL_EMAIL}
                  </a>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">
                    訂正、トピックの提案、その他全て
                  </p>
                </li>
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">技術関連</b>
                  <a href={`mailto:${TECH_EMAIL}`} className="text-[15px] font-medium text-brand-600">
                    {TECH_EMAIL}
                  </a>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">
                    サイトの不具合、読み込めないページや表示エラー
                  </p>
                </li>
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">電話・受付時間</b>
                  <a href="tel:+886227457601" className="text-[15px] font-medium text-brand-600">
                    +886 {COMPANY_PHONE.replace(/^0/, '')}
                  </a>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">月〜金、10:00–19:00 (UTC+8)</p>
                </li>
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">オフィス</b>
                  <span className="text-[15px] text-paper-body">
                    11F, No. 49, Dongxing Rd., Xinyi District, Taipei, Taiwan ({COMPANY_ADDRESS})
                  </span>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">
                    対面での面会を希望される場合は、事前にメールで予約してください。
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

            <ContactForm lang="ja" />
          </section>

          <Reveal as="section" className="mt-14 pt-10 border-t border-paper-border">
            <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">メッセージの取り扱い方法</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 mt-7">
              <div className="border-t-2 border-brand-600 pt-3.5">
                <b className="text-base font-bold text-paper-ink">訂正を最優先します</b>
                <p className="text-[15px] leading-loose text-paper-secondary mt-1.5">
                  出典を確認し、記事を修正して最終更新日を更新します。元の結論が変更される場合は
                  訂正注記を追記します。
                </p>
              </div>
              <div className="border-t-2 border-brand-600 pt-3.5">
                <b className="text-base font-bold text-paper-ink">必ず返信します</b>
                <p className="text-[15px] leading-loose text-paper-secondary mt-1.5">
                  パートナーシップに関する問い合わせやトピックの提案にはすべて返信します。すでに予定されているトピックの場合は
                  スケジュールをお知らせします。
                </p>
              </div>
              <div className="border-t-2 border-brand-600 pt-3.5">
                <b className="text-base font-bold text-paper-ink">有料掲載は行いません</b>
                <p className="text-[15px] leading-loose text-paper-secondary mt-1.5">
                  推薦リストやランキングへの掲載、結論の変更を目的とした掲載の依頼は丁重にお断りします。
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  )
}
