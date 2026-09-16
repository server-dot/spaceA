import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'

// 日文版推薦標準。內容照 app/(zh)/standards/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  'spaceAが公開された議論やレビューをどのように収集し、どのように照合するか、提携関係をどのように開示するか、誤りをどのように訂正するかについて。'
const LAST_UPDATED = '2026-08-28'

const BREADCRUMBS = [
  { label: 'ホーム', href: '/ja' },
  { label: '基準', href: '/ja/standards' },
]

const TOC_ITEMS = [
  { label: 'データ収集の方法', href: '#how' },
  { label: '行わないこと（要約）', href: '#limits' },
  { label: '広告と提携の開示', href: '#disclosure' },
  { label: '訂正', href: '#corrections' },
]

export const metadata: Metadata = {
  title: '基準',
  description: DESCRIPTION,
  alternates: staticAlternates('ja', '/standards'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: SITE_NAME,
    title: '基準',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function JaStandardsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-14 pt-8 pb-20 items-start">
            <article>
              <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px] text-balance">
                基準
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 max-w-2xl text-balance">
                spaceAは台湾発のおすすめサイトです。私たちがすべてを自ら試したと主張することはありません。行っているのは、公開されているオンラインの議論を集め、照合し、編集者がそれを実行可能な助言にまとめることです。すべての主張について出典と更新日を明記します。
              </p>
              <p className="text-xs text-paper-muted mt-3">
                最終更新日： <time dateTime={LAST_UPDATED}>2026年8月28日</time>
              </p>

              <section id="how" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  データはどのように収集し、推奨はどのように作成していますか？
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  どの記事も公開前に次の三つのステップを通します。調べても分からなかったことは「分からなかった」と書き、数字を推測で補うことはしません。
                </p>
                <ol className="grid gap-8 mt-8 pl-[34px] border-l-2 border-brand-200 list-none max-w-2xl">
                  {[
                    {
                      n: '01',
                      title: '収集',
                      body: 'フォーラム、ソーシャルメディア、マーケットプレイスから公開レビューを収集し、各モデルがどれほど言及されているかや評価を記録し、繰り返し挙げられる長所と短所を抽出します。',
                    },
                    {
                      n: '02',
                      title: '照合',
                      body: '仕様、価格、サービス条件は常に公式ページや販売業者と照合し、単一の情報源に依存することはありません。情報源同士が矛盾する場合は、一方を好んで採用するのではなく、その旨を記事内で明示します。',
                    },
                    {
                      n: '03',
                      title: '出典の明示と更新',
                      body: '各記事は末尾に出典の種類を記載し、公開日と最終更新日を表示します。価格や販売業者の情報は四半期ごとに再確認します。',
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
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">行わないこと</h2>
                <ul className="grid mt-6 divide-y divide-[#eeeae2] text-base leading-loose text-paper-body max-w-2xl">
                  <li className="py-4 text-balance">
                    スポンサーコンテンツや順位の販売は行いません。販売しているのは「広告」と明示した広告枠のみで、ブランドが推薦、ランキング、結論の変更に対して金銭を支払うことはできず、ドラフトの確認権もありません。
                  </li>
                  <li className="py-4 text-balance">
                    当社が実施していないテストを行ったと主張することはありません。各記事には、結論がテスト、ユーザーの意見、またはブランド情報のいずれに基づくものかを明示します。
                  </li>
                  <li className="py-4 text-balance">
                    裏付けのない数値は掲載しません。検証可能な数値がない場合は数値を用いず記述するか、データが不十分であると明記します。
                  </li>
                  <li className="py-4 text-balance">
                    ランキングのために無理に項目を増やすことはしません。推奨に値する選択肢が三つしかないなら、三つだけ掲載します。
                  </li>
                  <li className="py-4 text-balance">
                    個別の医療・法律・投資アドバイスは行いません。健康に関する事項は担当の医療従事者にご相談ください。
                  </li>
                </ul>
              </section>

              <section id="disclosure" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  広告や提携関係はどのように開示していますか？
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  spaceAの収益は広告枠からです。販売しているのは「広告」と明示した枠であり、記事そのものは販売しません：
                </p>
                <ul className="grid gap-[18px] mt-6 list-none max-w-2xl">
                  {[
                    '記事内のリンクはブランド公式サイトや販売ページに直接つながります。アフィリエイトリンクではなく、クリックや購入によってspaceAが報酬を得ることはありません。',
                    '広告枠は掲載を受け付けています。広告は「広告」と表示し、記事とは分けて掲載します。レビューを装った広告はありません。広告を出稿しても、おすすめリストに入ったり順位が上がったりすることはありません。',
                    'スポンサーコンテンツや順位の販売は行いません。おすすめリスト、ランキング、結論は販売せず、ブランドがドラフトをレビューまたは編集することはできません。ブランドから製品を貸与してテストした場合は、記事の冒頭にその旨を明記します。',
                  ].map((text) => (
                    <li key={text} className="grid grid-cols-[8px_1fr] gap-4 items-start">
                      <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                      <span className="text-base leading-loose text-paper-body text-balance">{text}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section id="corrections" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">誤りを見つけましたか？</h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  ぜひお知らせください。出典を確認し、誤りがあれば記事を訂正し最終更新日を更新します。元の推奨に影響を与える変更がある場合は、内容をこっそり編集するのではなく、末尾に訂正注記を追加します。
                </p>
                <div className="flex gap-3 flex-wrap mt-6">
                  <Link
                    href="/ja/contact#form"
                    className="inline-flex items-center bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors"
                  >
                    誤りを報告する
                  </Link>
                  <Link
                    href="/ja/contact#form"
                    className="inline-flex items-center bg-paper-card hover:border-brand-600 hover:text-brand-600 text-paper-ink font-bold text-sm px-6 py-3 border border-paper-border rounded-lg transition-colors"
                  >
                    提携および広告
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
