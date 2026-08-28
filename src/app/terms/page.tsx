import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import PageToc from '@/components/layout/PageToc'

const DESCRIPTION = 'spaceA 內容的使用範圍、轉載與引用規則、免責聲明、第三方連結與條款修改方式。'
const LAST_UPDATED = '2026-08-28'

const BREADCRUMBS = [
  { label: '首頁', href: '/' },
  { label: '使用條款', href: '/terms' },
]

const TOC_ITEMS = [
  { label: '內容使用與轉載', href: '#content' },
  { label: '免責範圍', href: '#disclaimer' },
  { label: '第三方連結與廣告', href: '#thirdparty' },
  { label: '禁止行為', href: '#conduct' },
]

export const metadata: Metadata = {
  title: '使用條款',
  description: DESCRIPTION,
  alternates: { canonical: '/terms' },
  openGraph: {
    title: '使用條款',
    description: DESCRIPTION,
  },
}

export default function TermsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-14 pt-8 pb-20 items-start">
            <article className="max-w-3xl">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink">
                使用條款
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 text-balance">
                使用 spaceA 之前，請先看過以下說明。您繼續瀏覽本站，即表示同意這些條款。
              </p>
              <p className="text-xs text-paper-muted mt-3">
                最後更新：<time dateTime={LAST_UPDATED}>2026年8月28日</time>
              </p>

              <section id="content" className="mt-11">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  本站內容可以怎麼使用？
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  本站的文章、圖表與編輯整理成果，著作權屬 spaceA 與其授權人所有。歡迎個人閱讀、分享連結與在合理範圍內引用。
                </p>
                <ul className="grid gap-3 mt-4 pl-5 text-base leading-loose text-paper-body list-disc">
                  <li>
                    <b className="font-bold">可以</b>：引用單一段落或數據，並註明來源與原文連結。
                  </li>
                  <li>
                    <b className="font-bold">需要授權</b>：整篇轉載、翻譯、改寫、用於商業出版或訓練商業模型。
                  </li>
                  <li>
                    <b className="font-bold">不可以</b>：移除署名、修改結論後仍標示為 spaceA 的內容。
                  </li>
                </ul>
                <p className="text-sm leading-relaxed text-paper-secondary mt-3">
                  授權洽詢請走
                  <a href="/contact#form" className="text-brand-600 font-bold">
                    聯絡表單
                  </a>
                  並勾選「內容授權」。
                </p>
              </section>

              <section id="disclaimer" className="mt-11">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  推薦內容的免責範圍是什麼？
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  本站內容彙整公開資訊與使用者回饋，經編輯部核對後撰寫，目的是提供參考，並非個人化建議。產品規格、價格與供貨狀況可能隨時變動，請於購買前以通路與官方資訊為準。
                </p>
                <ul className="grid gap-3 mt-4 pl-5 text-base leading-loose text-paper-body list-disc">
                  <li>醫療、健康、法律與財務相關內容，不能取代專業人員的診斷或建議。</li>
                  <li>依本站內容所做的購買或其他決定，其結果由使用者自行承擔。</li>
                  <li>
                    若您發現內容有誤，歡迎依
                    <a href="/about#corrections" className="text-brand-600 font-bold">
                      更正流程
                    </a>
                    告訴我們，我們會核對後處理。
                  </li>
                </ul>
              </section>

              <section id="thirdparty" className="mt-11">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  第三方連結與廣告怎麼處理？
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  本站含有前往電商通路、品牌官網與其他網站的連結，部分為聯盟連結。這些網站的內容、交易條件與隱私政策由各網站自行負責，spaceA
                  無法控制也不承擔其責任。
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  廣告與編輯內容分開呈現。我們不接業配，推薦名單與排序不對外開放付費，詳見
                  <a href="/about#disclosure" className="text-brand-600 font-bold">
                    合作揭露
                  </a>
                  。
                </p>
              </section>

              <section id="conduct" className="mt-11">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  使用本站時請避免哪些行為？
                </h2>
                <ul className="grid gap-3 mt-4 pl-5 text-base leading-loose text-paper-body list-disc">
                  <li>以自動化程式大量抓取內容，或以其他方式影響網站正常運作。</li>
                  <li>偽造身分寄送不實的更正要求或合作洽詢。</li>
                  <li>將本站內容用於誤導消費者的宣傳。</li>
                </ul>
              </section>

              <section className="mt-11 bg-paper-surface rounded-2xl p-7">
                <h2 className="text-sm font-bold tracking-wider">條款修改與準據法</h2>
                <p className="text-sm leading-relaxed text-paper-secondary mt-3">
                  本條款如有修改，會更新本頁並修改最後更新日期。本條款以中華民國法律為準據法。
                </p>
              </section>
            </article>

            <PageToc
              items={TOC_ITEMS}
              extraLinks={[
                { label: '隱私權政策', href: '/privacy' },
                { label: '編輯方針', href: '/about' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  )
}
