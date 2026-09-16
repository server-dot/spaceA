import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import Link from 'next/link'
import { SITE_NAME, EDITORIAL_EMAIL } from '@/lib/constants'

// 日文版隱私權政策。內容照 app/(zh)/privacy/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  'spaceAが収集するデータ、クッキーや解析の利用方法、記事内リンクと広告の追跡方法、ならびに行使可能な権利について。'
const LAST_UPDATED = '2026-08-28'

const BREADCRUMBS = [
  { label: 'ホーム', href: '/ja' },
  { label: 'プライバシーポリシー', href: '/ja/privacy' },
]

const TOC_ITEMS = [
  { label: '収集するデータ', href: '#collect' },
  { label: '利用目的', href: '#use' },
  { label: 'クッキーと解析', href: '#cookie' },
  { label: 'リンクと広告の追跡', href: '#affiliate' },
  { label: '皆様の権利', href: '#rights' },
]

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: DESCRIPTION,
  alternates: staticAlternates('ja', '/privacy'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: SITE_NAME,
    title: 'プライバシーポリシー',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function JaPrivacyPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-14 pt-8 pb-20 items-start">
            <article className="max-w-3xl">
              <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px]">
                プライバシーポリシー
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 text-balance">
                私たちは皆様のプライバシーを重視しています。本ページでは、spaceAが収集するデータ、その利用目的、ならびに皆様がどのような権利を行使できるかを説明します。
              </p>
              <p className="text-xs text-paper-muted mt-3">
                最終更新日: <time dateTime={LAST_UPDATED}>2026年8月28日</time>
              </p>

              <section id="collect" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">どのようなデータを収集しますか？</h2>
                <ul className="grid mt-6 divide-y divide-[#eeeae2] text-base leading-loose text-paper-body">
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">ご提供いただくデータ</b>: お問い合わせフォームまたはメールでご送信いただくお名前、メールアドレス、電話番号、メッセージ。
                  </li>
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">匿名の利用統計</b>: 訪問したページ、リファラー、端末やブラウザの種類など。どのコンテンツが有益かを把握するために使用します。
                  </li>
                </ul>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  会員制度は設けておらず、国民識別番号や銀行口座情報、その他の機微な個人データを求めることは一切ありません。
                </p>
              </section>

              <section id="use" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">データは何に使われますか？</h2>
                <ul className="grid gap-[18px] mt-6 list-none">
                  {[
                    '訂正、トピックの提案、提携に関するお問い合わせを含む、皆様からのメッセージへの返信。',
                    'どのトピックにより注力すべきかや、どのページで離脱が起きているかなどを把握し、サイトのコンテンツや体験を改善すること。',
                    '記事内リンクのクリック数を計測し、当社のおすすめが読者にとって有益かどうかを評価すること。',
                  ].map((text) => (
                    <li key={text} className="grid grid-cols-[8px_1fr] gap-4 items-start">
                      <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                      <span className="text-base leading-loose text-paper-body text-balance">{text}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  お客様のデータをマーケティング用リストに追加することはなく、法令に基づく場合やお客様の明示的な同意がある場合を除き、第三者に販売または提供することはありません。
                </p>
              </section>

              <section id="cookie" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">クッキーと解析はどのように機能しますか？</h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  当サイトでは、Google Analytics等のサードパーティー製ツールをトラフィック解析のために使用しています。これらはクッキーを通じて匿名の閲覧情報を記録します。また、広告プラットフォームは、広告をクリックした際にクッキーを設定し、訪問元を記録することがあります。
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  ブラウザの設定でクッキーを無効化または削除することができます。クッキーを無効にしても当サイトは問題なく閲覧できますが、一部のトラッキング機能は動作しなくなります。
                </p>
              </section>

              <section id="affiliate" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">記事内リンクと広告は何を追跡しますか？</h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  記事内のリンクはブランド公式サイトや販売ページに直接つながり、アフィリエイトプラットフォームを経由しません。spaceAが注文情報や支払い情報を受け取ることはなく、報酬も得ていません。広告枠は広告プラットフォームが配信しており、広告をクリックした際にクッキーが設定される場合があります。
                </p>
                <p className="text-sm leading-relaxed text-paper-secondary mt-3">
                  詳細な開示は
                  <Link href="/ja/standards#disclosure" className="text-brand-600 font-bold">
                    編集基準
                  </Link>
                  をご覧ください。
                </p>
              </section>

              <section id="rights" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">どのような権利を行使できますか？</h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  当社が保有するご自身のデータへのアクセス、訂正、削除、または利用停止を請求できます。ご依頼はメールでお知らせください。本人確認のうえ、対応いたします。
                </p>
                <div className="mt-6 border-l-2 border-brand-200 pl-[22px]">
                  <b className="text-xs font-bold tracking-wider text-brand-600">お問い合わせ</b>
                  <p className="text-base leading-loose text-paper-body mt-2 text-balance">
                    For privacy matters, email{' '}
                    <a href={`mailto:${EDITORIAL_EMAIL}`} className="text-brand-600 font-bold">
                      {EDITORIAL_EMAIL}
                    </a>{' '}
                    or use the{' '}
                    <Link href="/ja/contact#form" className="text-brand-600 font-bold">
                      お問い合わせフォーム
                    </Link>
                    .
                  </p>
                </div>
              </section>

              <section className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="text-xs font-bold tracking-wider text-paper-secondary">本ポリシーの変更</h2>
                <p className="text-[15px] leading-loose text-paper-secondary mt-2.5 text-balance">
                  本ポリシーを変更する場合は、本ページと最終更新日を更新します。重大な変更についてはホームページで告知します。
                </p>
              </section>
            </article>

            <PageToc
              items={TOC_ITEMS}
              title="On this page"
              extraLinks={[
                { label: '利用規約', href: '/ja/terms' },
                { label: '当社の基準', href: '/ja/standards' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  )
}
