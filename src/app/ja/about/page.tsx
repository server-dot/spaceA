import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import { SITE_NAME, EDITORIAL_EMAIL } from '@/lib/constants'
import Link from 'next/link'
import Reveal from '@/components/ui/Reveal'

// 日文版關於我們。內容照 app/(zh)/about/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  'spaceAは台湾発の繁体字中国語によるおすすめサイトで、現在は英語版も展開しています。なぜ作ったか、編集チームの体制、FAQ、サイトの進捗についてご案内します。'
const LAST_UPDATED = '2026-09-04'

const BREADCRUMBS = [
  { label: 'ホーム', href: '/ja' },
  { label: 'サイトについて', href: '/ja/about' },
]

const TOC_ITEMS = [
  { label: 'このサイトの目的', href: '#why' },
  { label: '編集チーム', href: '#team' },
  { label: 'よくある質問', href: '#faq' },
  { label: 'サイトの進捗', href: '#timeline' },
]

const TIMELINE = [
  {
    date: '2026年5月',
    title: '構築開始',
    body: 'サイト構成とコンテンツ方針を計画しました。ページを埋めるためではなく、読者が実際に検索し比較するトピックを起点としています。',
  },
  {
    date: '2026年8月',
    title: '最初の記事公開',
    body: '初のおすすめ記事を公開し、収集・検証・レビューの一連プロセスを実運用で実施しながら調整しました。',
  },
  {
    date: '2026年9月',
    title: '一般公開と英語版開始',
    body: 'まずコンテンツの基盤を築き、その後カテゴリを拡張します。数を合わせるために大量の記事を乱雑に追加することは行いません。',
  },
]

const FAQ_ITEMS = [
  {
    question: '記事の更新頻度はどれくらいですか？',
    answer:
      '仕様や価格、プランは時間とともに変わるため、公式ページや販売者情報を四半期ごとに再確認します。読者から誤りの報告があれば、検証のうえ速やかに更新します。各記事の冒頭には最終更新日を表示します。',
  },
  {
    question: 'どのトピックを扱うかはどう決めますか？',
    answer:
      '選定は、選択肢が多く公開情報が散在しているために読者が情報整理を最も必要とするトピックを優先します。トピックはブランドの露出要望ではなく、読者が実際に検索・比較している内容を基準に決めます。',
  },
  {
    question: 'ブランドが料金を払って内容を変更できますか？',
    answer:
      'いいえ。spaceAはスポンサーコンテンツを受け入れず、推奨リストやランキング、結論内の掲載枠を販売しません。詳細な規定は運用基準のページをご覧ください。',
  },
  {
    question: '誤りやリンク切れを見つけた場合は？',
    answer: `Email ${EDITORIAL_EMAIL} or use the contact page. We verify, correct the article and update its last-updated date.`,
  },
]

export const metadata: Metadata = {
  title: 'サイトについて',
  description: DESCRIPTION,
  alternates: staticAlternates('ja', '/about'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: SITE_NAME,
    title: 'サイトについて',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function JaAboutPage() {
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
                spaceAについて
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 max-w-2xl text-balance">
                spaceAは台湾発のおすすめ情報サイトです。各業界を横断して厳選したおすすめ記事を作成し、消費者が判断を下す前に正直で有用な参考情報を提供します。
              </p>
              <p className="text-xs text-paper-muted mt-3">
                最終更新日： <time dateTime={LAST_UPDATED}>2026年9月4日</time>
              </p>

              <Reveal as="section" id="why" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">なぜこのサイトを作ったのか</h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  オンラインで情報を探す際の問題は、答えがないことではなく、あまりに多くの角度から多すぎる答えが出てくることです。スポンサー記事がどのブランドも一位にしてしまったり、掲示板の書き込みは検証が難しかったり、比較リストが判断の助けになるよりも量を埋めるために作られていることがよくあります。spaceAはその状況を是正するために存在します。プラットフォームに散在する公開情報や仕様、価格を収集し、突き合わせて検証し、読みやすい形で判断基準を書き下ろします。
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  よくある例として、ある製品カテゴリを検索すると、10本中9本の文章がブランド名だけを差し替えたほぼ同一の「利点」を列挙しています。これは独自の確認をしていないために同一のプレスリリースを共有していることが多いのです。情報量は多く見えますが、選択の助けにはならず、むしろ全ての選択肢が同じように良く見えてしまうことがあります。
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  We are not telling you what you should pick. We lay out the criteria and let you decide whether to follow them.
                  When we cannot reach a confident conclusion, we say the data is insufficient instead of forcing a tidy answer. The
                  full process is on the{' '}
                  <Link href="/ja/standards" className="font-bold text-brand-600">
                    運用基準
                  </Link>{' '}
                  page.
                </p>
              </Reveal>

              <Reveal as="section" id="team" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">記事は誰が書いているのか</h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  記事はspaceAの編集チームが作成します。チームは公開議論の収集・整理、仕様や価格の検証、レビューと公開という三つの役割に分かれており、各記事には担当編集者の氏名を明記します。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 mt-7 max-w-2xl">
                  {[
                    { title: '調査', body: '公開されている議論やレビューを集めて比較リストを作成します。' },
                    { title: '検証', body: '公式ページや販売者情報と照合して仕様や価格を確認します。' },
                    { title: 'レビュー', body: '全ての結論に根拠があり、出典が明示されていることを確認します。' },
                  ].map((role) => (
                    <div key={role.title} className="border-t-2 border-brand-600 pt-3.5">
                      <b className="text-base font-bold text-paper-ink">{role.title}</b>
                      <p className="text-sm leading-loose text-paper-secondary mt-1.5">{role.body}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal as="section" id="faq" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">よくある質問</h2>
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
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">サイトの進捗</h2>
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
