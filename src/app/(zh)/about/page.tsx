import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import { SITE_NAME, EDITORIAL_EMAIL } from '@/lib/constants'
import Link from 'next/link'
import Reveal from '@/components/ui/Reveal'

const DESCRIPTION =
  'spaceA 是繁體中文的推薦文內容平台，這裡介紹我們為什麼做這個網站、編輯部分工、常見問題與網站的進度。'
const LAST_UPDATED = '2026-10-02'

const BREADCRUMBS = [
  { label: '首頁', href: '/' },
  { label: '關於我們', href: '/about' },
]

const TOC_ITEMS = [
  { label: '為什麼做這個網站', href: '#why' },
  { label: '編輯部分工', href: '#team' },
  { label: '常見問題', href: '#faq' },
  { label: '網站的進度', href: '#timeline' },
]

const TIMELINE = [
  {
    date: '2026年5月',
    title: '開始建站',
    body: '規劃網站架構，決定先寫哪些主題。',
  },
  {
    date: '2026年8月',
    title: '第一篇文章',
    body: '〈SEO 行銷公司怎麼選〉上線。',
  },
  {
    date: '2026年9月11日',
    title: '網站上線',
    body: '網站對外開放。',
  },
  {
    date: '2026年9月15日',
    title: '推出英日韓版',
    body: '中文文章翻成英文、日文、韓文，各自有獨立網址。',
  },
  {
    date: '2026年9月16日',
    title: '第 10 篇文章',
    body: '〈台北隆鼻要多少錢〉上線，分類有行銷、旅遊住宿、美妝保養、美食、健康醫療。',
  },
]

const FAQ_ITEMS = [
  {
    question: '文章多久更新一次？',
    answer:
      '產品規格、價格與方案內容會隨時間變動，我們每季重新核對一次官方頁面與通路資訊；如果讀者回報內容有誤，會立即核實並更新，每篇文章開頭都標有「最後更新」日期，可以直接看到資訊新不新。',
  },
  {
    question: '怎麼決定要寫哪些主題？',
    answer:
      '優先寫選擇很多、公開資訊又很亂的題目，這類主題讀者最需要有人先整理過。挑題依據是讀者實際會搜尋、會拿來比較的問題。',
  },
  {
    question: '發現內容有誤或連結失效，該怎麼辦？',
    answer: `直接來信 ${EDITORIAL_EMAIL} 或透過聯絡頁回報即可，我們核實後會更正內容，並更新文章的「最後更新」日期。`,
  },
]

export const metadata: Metadata = {
  title: '關於我們',
  description: DESCRIPTION,
  alternates: staticAlternates('zh', '/about'),
  // 子頁的 openGraph 會整組蓋掉 layout 的，圖片與 siteName 要自己帶，不然分享出去沒有預覽圖
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    siteName: SITE_NAME,
    title: '關於我們',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <FaqJsonLd items={FAQ_ITEMS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-14 pt-8 pb-20 items-start">
            <article>
              <Breadcrumbs items={BREADCRUMBS} />

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px] text-balance">
                關於我們
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 max-w-2xl text-balance">
                spaceA 是繁體中文的推薦文內容平台。我們為各行各業撰寫精選推薦文章，提供消費者最真實、最有價值的參考資訊。
              </p>
              <p className="text-xs text-paper-muted mt-3">
                最後更新：<time dateTime={LAST_UPDATED}>2026年10月2日</time>
              </p>

              <Reveal as="section" id="why" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">為什麼做這個網站？</h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  網路上找資訊，難的是答案太多、立場太雜：業配文把每一家都寫成第一名，論壇留言真假難辨，比較清單常常只是湊字數。spaceA
                  把分散在各平台的公開討論、規格與價格收集起來，交叉核對後，用好讀的方式寫清楚這類選擇該怎麼判斷。
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  搜尋同一類商品或服務，常會看到十篇文章有九篇的「優點」幾乎一樣，只換了品牌名稱，多半是同一份通稿改寫。這種內容看起來資訊量很大，卻幫不了你做決定，還會讓人以為每一家都差不多。
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  我們把判斷依據攤開，選哪一個由你決定。資料不足以下結論時，文章會直接註明。完整流程寫在
                  <Link href="/standards" className="font-bold text-brand-600">
                    推薦標準
                  </Link>
                  頁。
                </p>
              </Reveal>

              <Reveal as="section" id="team" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">誰在寫這些文章？</h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  文章由 spaceA 編輯部撰寫，內容分成三種角色分工：蒐集與整理公開討論、核對規格與價格、審稿與發布。每篇文章都會署名負責的編輯。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 mt-7 max-w-2xl">
                  {[
                    { title: '資料整理', body: '彙整公開討論與評論，建立比較清單。' },
                    { title: '核對', body: '回到官方與通路頁面確認規格與價格。' },
                    { title: '審稿', body: '檢查結論是否有依據、來源是否標註完整。' },
                  ].map((role) => (
                    <div key={role.title} className="border-t-2 border-brand-600 pt-3.5">
                      <b className="text-base font-bold text-paper-ink">{role.title}</b>
                      <p className="text-sm leading-loose text-paper-secondary mt-1.5">{role.body}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal as="section" id="faq" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">常見問題</h2>
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
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">網站的進度</h2>
                <ol className="grid gap-8 mt-6 pl-[34px] border-l-2 border-brand-200 list-none max-w-2xl">
                  {TIMELINE.map((item, i) => (
                    <Reveal as="li" key={item.date} delay={i * 120} className="relative">
                      <span className="absolute -left-[43px] top-0.5 w-[18px] h-[18px] rounded-full bg-brand-600" />
                      <b className="block text-xs font-bold tracking-wider text-brand-600">{item.date}</b>
                      <b className="block text-lg font-bold text-paper-ink mt-1.5">{item.title}</b>
                      <p className="text-base leading-loose text-paper-body mt-2 text-pretty">{item.body}</p>
                    </Reveal>
                  ))}
                </ol>
              </Reveal>
            </article>

            <PageToc items={TOC_ITEMS} />
          </div>
        </div>
      </div>
    </>
  )
}
