import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'

// 日文版使用條款。內容照 app/(zh)/terms/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  'spaceA のコンテンツの利用方法、転載・引用のルール、免責事項、第三者リンク、ならびに本規約の変更に関する事項。'
const LAST_UPDATED = '2026-08-28'

const BREADCRUMBS = [
  { label: 'ホーム', href: '/ja' },
  { label: '利用規約', href: '/ja/terms' },
]

const TOC_ITEMS = [
  { label: 'コンテンツの利用と転載', href: '#content' },
  { label: '免責事項', href: '#disclaimer' },
  { label: '第三者リンクと広告', href: '#thirdparty' },
  { label: '禁止行為', href: '#conduct' },
]

export const metadata: Metadata = {
  title: '利用規約',
  description: DESCRIPTION,
  alternates: staticAlternates('ja', '/terms'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: SITE_NAME,
    title: '利用規約',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function JaTermsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-14 pt-8 pb-20 items-start">
            <article className="max-w-3xl">
              <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px]">
                利用規約
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 text-balance">
                spaceA をご利用いただく前に以下をお読みください。本サイトの閲覧を継続することにより、これらの条件に同意したものとみなされます。
              </p>
              <p className="text-xs text-paper-muted mt-3">
                最終更新日： <time dateTime={LAST_UPDATED}>2026年8月28日</time>
              </p>

              <section id="content" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">コンテンツはどのように利用できますか？</h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  本サイトの記事、図表および編集物は spaceA およびそのライセンサーの著作物です。閲覧、リンクの共有、合理的範囲での引用はご自由に行えます。
                </p>
                <ul className="grid mt-6 divide-y divide-[#eeeae2] text-base leading-loose text-paper-body">
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">許可される行為</b>：出典の明示と原文へのリンクを付けて、段落や図表を1つ引用すること。
                  </li>
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">ライセンスが必要な行為</b>：記事全文の転載、翻訳、書き換え、商業出版、または商用モデルの学習への利用。
                  </li>
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">禁止される行為</b>：出典表示を削除すること、または結論を書き換えてなお spaceA の内容として提示すること。
                  </li>
                </ul>
                <p className="text-sm leading-relaxed text-paper-secondary mt-3">
                  For licensing, use the{' '}
                  <Link href="/ja/contact#form" className="text-brand-600 font-bold">
                    お問い合わせフォーム
                  </Link>{' '}
                  and select &quot;Content licensing&quot;.
                </p>
              </section>

              <section id="disclaimer" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  免責事項の範囲は何ですか？
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  当社のコンテンツは公開情報や利用者のフィードバックを編集者が確認してまとめたもので、参考情報として提供しています。個別の助言を目的としたものではありません。仕様、価格、在庫状況は随時変更される可能性があるため、購入前に販売元や公式情報を必ずご確認ください。
                </p>
                <ul className="grid gap-[18px] mt-6 list-none">
                  <li className="grid grid-cols-[8px_1fr] gap-4 items-start">
                    <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                    <span className="text-base leading-loose text-paper-body text-balance">
                      医療、健康、法務、金融に関する情報は専門家による診断や助言の代替にはなりません。
                    </span>
                  </li>
                  <li className="grid grid-cols-[8px_1fr] gap-4 items-start">
                    <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                    <span className="text-base leading-loose text-paper-body text-balance">
                      本サイトに基づいて行う購入やその他の判断は、利用者ご自身の責任となります。
                    </span>
                  </li>
                  <li className="grid grid-cols-[8px_1fr] gap-4 items-start">
                    <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                    <span className="text-base leading-loose text-paper-body text-balance">
                      If you find an error, please follow the{' '}
                      <Link href="/ja/standards#corrections" className="text-brand-600 font-bold">
                        訂正手続き
                      </Link>{' '}
                      and we will verify and act on it.
                    </span>
                  </li>
                </ul>
              </section>

              <section id="thirdparty" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  第三者のリンクおよび広告はどのように扱われますか？
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  本サイトはマーケットプレイス、ブランドサイト、他のウェブサイトへのリンクを含み、一部はアフィリエイトリンクです。それらのコンテンツ、利用規約、プライバシーポリシーは各サイトの責任であり、spaceA はそれらを管理せず、一切の責任を負いません。
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  広告は編集コンテンツと分けて掲載します。販売しているのは「広告」と明示した広告枠のみで、スポンサーコンテンツは受け付けず、おすすめリストや順位も販売しません。詳細は{' '}
                  <Link href="/ja/standards#disclosure" className="text-brand-600 font-bold">
                    提携に関する開示
                  </Link>
                  をご覧ください。
                </p>
              </section>

              <section id="conduct" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">本サイトで避けるべき行為は何ですか？</h2>
                <ul className="grid mt-6 divide-y divide-[#eeeae2] text-base leading-loose text-paper-body">
                  <li className="py-4">自動ツールによる大量のスクレイピングや、その他本サイトの通常の運用を妨げる行為。</li>
                  <li className="py-4">他者になりすまして虚偽の訂正要請や提携に関する問い合わせを行うこと。</li>
                  <li className="py-4">本サイトのコンテンツを、消費者を誤認させるようなマーケティングに利用すること。</li>
                </ul>
              </section>

              <section className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="text-xs font-bold tracking-wider text-paper-secondary">変更および準拠法</h2>
                <p className="text-[15px] leading-loose text-paper-secondary mt-2.5 text-balance">
                  本規約を変更した場合は、本ページおよび最終更新日を更新します。本規約は中華民国（台湾）の法令に準拠します。繁体字中国語版と本版で差異がある場合は、繁体字中国語版が優先します。
                </p>
              </section>
            </article>

            <PageToc
              items={TOC_ITEMS}
              title="On this page"
              extraLinks={[
                { label: 'プライバシーポリシー', href: '/ja/privacy' },
                { label: '当社の基準', href: '/ja/standards' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  )
}
