import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import PageToc from '@/components/layout/PageToc'

const DESCRIPTION =
  'spaceA 蒐集哪些資料、如何使用 Cookie 與分析工具、聯盟連結的追蹤方式，以及您可以行使的權利。'
const LAST_UPDATED = '2026-08-28'

const BREADCRUMBS = [
  { label: '首頁', href: '/' },
  { label: '隱私權政策', href: '/privacy' },
]

const TOC_ITEMS = [
  { label: '蒐集哪些資料', href: '#collect' },
  { label: '資料用途', href: '#use' },
  { label: 'Cookie 與分析工具', href: '#cookie' },
  { label: '聯盟連結追蹤', href: '#affiliate' },
  { label: '您的權利', href: '#rights' },
]

export const metadata: Metadata = {
  title: '隱私權政策',
  description: DESCRIPTION,
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: '隱私權政策',
    description: DESCRIPTION,
  },
}

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-14 pt-8 pb-20 items-start">
            <article className="max-w-3xl">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink">
                隱私權政策
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 text-balance">
                本站重視您的隱私權。這頁說明 spaceA 蒐集哪些資料、用途是什麼，以及您可以怎麼行使權利。
              </p>
              <p className="text-xs text-paper-muted mt-3">
                最後更新：<time dateTime={LAST_UPDATED}>2026年8月28日</time>
              </p>

              <section id="collect" className="mt-11">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  我們蒐集哪些資料？
                </h2>
                <ul className="grid gap-3 mt-4 pl-5 text-base leading-loose text-paper-body list-disc">
                  <li>
                    <b className="font-bold">您主動提供的資料</b>：透過聯絡表單或電子郵件寄給我們的稱呼、信箱、電話與內容。
                  </li>
                  <li>
                    <b className="font-bold">瀏覽行為的匿名統計</b>：造訪頁面、來源、裝置與瀏覽器類型，用於了解哪些內容有幫助。
                  </li>
                </ul>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  本站不設會員系統，也不會要求您提供身分證號、金融帳號或其他敏感個人資料。
                </p>
              </section>

              <section id="use" className="mt-11">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  這些資料用在什麼地方？
                </h2>
                <ul className="grid gap-3 mt-4 pl-5 text-base leading-loose text-paper-body list-disc">
                  <li>回覆您的來信，包括內容更正、選題建議與合作洽詢。</li>
                  <li>改善網站內容與體驗，例如判斷哪些主題該補充、哪些頁面讀者看不完。</li>
                  <li>統計聯盟連結的點擊與成效，用於了解推薦內容是否對讀者有用。</li>
                </ul>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  我們不會將您的資料用於行銷名單，也不會出售或提供給第三方，除法律要求或您另行同意者外。
                </p>
              </section>

              <section id="cookie" className="mt-11">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  Cookie 與分析工具怎麼運作？
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  本站使用 Google Analytics 等第三方工具進行流量分析，這些工具會透過 Cookie
                  記錄匿名的瀏覽資訊。廣告與聯盟平台也可能在您點擊連結時，透過 Cookie 記錄轉換來源。
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  您可以在瀏覽器設定中停用或刪除 Cookie。停用後仍可正常閱讀本站內容，但部分功能的紀錄會失效。
                </p>
              </section>

              <section id="affiliate" className="mt-11">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  聯盟連結會追蹤什麼？
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  文章中的購買連結可能是聯盟連結。您點擊後，通路或聯盟平台會記錄這筆造訪來自 spaceA，用於計算分潤。價格與您直接前往通路相同，我們不會取得您的訂單明細或付款資訊。
                </p>
                <p className="text-sm leading-relaxed text-paper-secondary mt-3">
                  完整的合作揭露寫在
                  <a href="/about#disclosure" className="text-brand-600 font-bold">
                    編輯方針
                  </a>
                  。
                </p>
              </section>

              <section id="rights" className="mt-11">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  您可以行使哪些權利？
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  您可以要求查詢、更正或刪除我們保有的您的資料，也可以要求停止使用。來信說明即可，我們核對身分後處理。
                </p>
                <div className="mt-5 bg-white border border-paper-border rounded-2xl p-6">
                  <b className="text-base font-bold text-paper-ink">聯絡方式</b>
                  <p className="text-base leading-loose text-paper-body mt-2">
                    隱私權相關請寄{' '}
                    <a href="mailto:seo@stack.com.tw" className="text-brand-600 font-bold">
                      seo@stack.com.tw
                    </a>
                    ，或透過
                    <a href="/contact#form" className="text-brand-600 font-bold">
                      聯絡表單
                    </a>
                    告訴我們。
                  </p>
                </div>
              </section>

              <section className="mt-11 bg-paper-surface rounded-2xl p-7">
                <h2 className="text-sm font-bold tracking-wider">政策修改</h2>
                <p className="text-sm leading-relaxed text-paper-secondary mt-3">
                  本政策如有調整，會更新本頁並修改最後更新日期。重大變更會在首頁公告。
                </p>
              </section>
            </article>

            <PageToc
              items={TOC_ITEMS}
              extraLinks={[
                { label: '使用條款', href: '/terms' },
                { label: '編輯方針', href: '/about' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  )
}
