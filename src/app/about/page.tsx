import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import PageToc from '@/components/layout/PageToc'

const DESCRIPTION =
  'spaceA 如何彙整網路上公開的討論與評論、如何交叉核對、如何揭露合作關係，以及讀者發現內容有誤時的更正流程。'
const LAST_UPDATED = '2026-08-28'

const BREADCRUMBS = [
  { label: '首頁', href: '/' },
  { label: '關於我們與編輯方針', href: '/about' },
]

const TOC_ITEMS = [
  { label: '我們怎麼取得資料', href: '#how' },
  { label: '哪些事我們不做', href: '#limits' },
  { label: '合作與聯盟連結揭露', href: '#disclosure' },
  { label: '內容更正流程', href: '#corrections' },
  { label: '編輯部分工', href: '#team' },
]

export const metadata: Metadata = {
  title: '關於我們與編輯方針',
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    title: '關於我們與編輯方針',
    description: DESCRIPTION,
  },
}

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-14 pt-8 pb-20 items-start">
            <article>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink text-balance">
                關於我們與編輯方針
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 max-w-2xl text-balance">
                spaceA 是繁體中文的推薦文內容平台。我們不假裝每樣東西都親手用過，做的是把網路上公開的討論彙整起來、交叉核對，再由編輯部寫成能照著做的建議，並標明每則資訊的來源與更新日期。
              </p>
              <p className="text-xs text-paper-muted mt-3">
                最後更新：<time dateTime={LAST_UPDATED}>2026年8月28日</time>
              </p>

              <section id="how" className="mt-12">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  我們怎麼取得資料、怎麼寫推薦？
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  流程固定三步。每篇文章都跑完這三步才會發布，遇到資料不足就不寫，不用推測補齊。
                </p>
                <ol className="grid gap-3.5 mt-5">
                  {[
                    {
                      n: '01',
                      title: '蒐集聲量',
                      body: '彙整論壇、社群與電商平台上的公開評論，記錄每個型號被提到的次數與正負評價比例，找出被反覆提到的優點與缺點。',
                    },
                    {
                      n: '02',
                      title: '交叉核對',
                      body: '規格、價格與服務條件一律回到官方頁面與銷售通路確認，不採用單一來源的說法。說法互相矛盾時，我們會在文中寫出來，而不是選一個看起來好的。',
                    },
                    {
                      n: '03',
                      title: '標註來源與更新',
                      body: '每篇文末列出資料來源類型，並標示發布與最後更新日期。價格與通路資訊每季重新確認一次。',
                    },
                  ].map((step) => (
                    <li
                      key={step.n}
                      className="bg-white border border-paper-border rounded-2xl p-6 grid grid-cols-[34px_1fr] gap-4"
                    >
                      <b className="font-serif text-lg text-brand-600">{step.n}</b>
                      <div>
                        <b className="text-base font-bold text-paper-ink">{step.title}</b>
                        <p className="text-[15px] leading-loose text-paper-secondary mt-2">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section id="limits" className="mt-12">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">哪些事我們不做？</h2>
                <ul className="grid gap-3 mt-4.5 pl-5 text-base leading-loose text-paper-body max-w-2xl list-disc">
                  <li>不做業配。廠商無法付費換取推薦、排序或修改結論，也不提供稿件審閱。</li>
                  <li>不宣稱做過沒做過的實測。文章會寫清楚結論來自實測、使用者回饋還是廠商提供。</li>
                  <li>不寫沒有依據的數字。找不到可核對的數據時，用非數值的描述，或直接說明資料不足。</li>
                  <li>不為了排名硬湊清單長度。值得推薦的只有三款就寫三款。</li>
                  <li>不提供醫療、法律或投資的個人化建議。健康相關內容以看診專業人員的判斷為準。</li>
                </ul>
              </section>

              <section id="disclosure" className="mt-12">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  合作與聯盟連結怎麼揭露？
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  spaceA 的收入來自聯盟行銷與廣告合作。這會影響網站怎麼經營，但不影響推薦內容本身：
                </p>
                <div className="mt-5 bg-brand-50 rounded-2xl p-6 max-w-2xl">
                  <ul className="grid gap-3 pl-5 text-[15px] leading-loose text-paper-ink list-disc">
                    <li>文章中的購買連結可能是聯盟連結，你透過它購買我們會取得分潤，價格與你直接前往通路相同。</li>
                    <li>我們不接業配。推薦名單與排序不對外開放付費，廠商也不能審閱或修改稿件。</li>
                    <li>廣告與編輯內容分開呈現，不會有看起來像評測的廣告。若曾借測廠商提供的產品，會在文章開頭標示。</li>
                  </ul>
                </div>
              </section>

              <section id="corrections" className="mt-12">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">發現內容有誤怎麼辦？</h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  歡迎直接告訴我們。收到指正後我們會核對來源，確認有誤即更正並更新「最後更新」日期；若更動影響原本的推薦結論，會在文末加註修正說明，不會默默改掉。
                </p>
                <div className="flex gap-3 flex-wrap mt-5">
                  <a
                    href="/contact#form"
                    className="inline-flex items-center bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors"
                  >
                    回報內容問題
                  </a>
                  <a
                    href="/contact#form"
                    className="inline-flex items-center bg-white hover:border-brand-600 hover:text-brand-600 text-paper-ink font-bold text-sm px-6 py-3 border border-paper-border rounded-lg transition-colors"
                  >
                    合作與廣告洽詢
                  </a>
                </div>
              </section>

              <section id="team" className="mt-12">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">誰在寫這些文章？</h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  文章由 spaceA 編輯部撰寫，內容分成三種角色分工：蒐集與整理公開討論、核對規格與價格、審稿與發布。每篇文章都會署名負責的編輯。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 max-w-2xl">
                  {[
                    { title: '資料整理', body: '彙整公開討論與評論，建立比較清單。' },
                    { title: '核對', body: '回到官方與通路頁面確認規格與價格。' },
                    { title: '審稿', body: '檢查結論是否有依據、來源是否標註完整。' },
                  ].map((role) => (
                    <div key={role.title} className="bg-white border border-paper-border rounded-2xl p-5">
                      <b className="text-[15px] font-bold text-paper-ink">{role.title}</b>
                      <p className="text-sm leading-loose text-paper-secondary mt-2">{role.body}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-12 bg-paper-surface rounded-2xl p-7 max-w-2xl">
                <h2 className="text-sm font-bold tracking-wider">這頁怎麼維護</h2>
                <p className="text-sm leading-relaxed text-paper-secondary mt-3">
                  編輯方針有調整就會更新本頁並改寫最後更新日期。若你對某篇文章的作法有疑問，可以直接引用該頁網址寄給我們。
                </p>
              </section>
            </article>

            <PageToc items={TOC_ITEMS} />
          </div>
        </div>
      </div>
    </>
  )
}
