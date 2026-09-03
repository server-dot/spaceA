import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import { COMPANY_NAME, COMPANY_REG_NO, COMPANY_ADDRESS, EDITORIAL_EMAIL } from '@/lib/constants'

const DESCRIPTION = 'spaceA 是繁體中文的推薦文內容平台，這裡介紹編輯部分工與營運公司資訊。'
const LAST_UPDATED = '2026-08-28'

const BREADCRUMBS = [
  { label: '首頁', href: '/' },
  { label: '關於我們', href: '/about' },
]

const TOC_ITEMS = [
  { label: '編輯部分工', href: '#team' },
  { label: '營運資訊', href: '#company' },
]

const COMPANY_INFO = [
  { label: '營運公司', value: COMPANY_NAME },
  { label: '統一編號', value: COMPANY_REG_NO },
  { label: '辦公室地址', value: COMPANY_ADDRESS },
]

export const metadata: Metadata = {
  title: '關於我們',
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    title: '關於我們',
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
              <Breadcrumbs items={BREADCRUMBS} />

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px] text-balance">
                關於我們
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 max-w-2xl text-balance">
                spaceA 是繁體中文的推薦文內容平台。我們為各行各業撰寫精選推薦文章，提供消費者最真實、最有價值的參考資訊。
              </p>
              <p className="text-xs text-paper-muted mt-3">
                最後更新：<time dateTime={LAST_UPDATED}>2026年8月28日</time>
              </p>

              <section id="team" className="mt-14 pt-10 border-t border-paper-border">
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
              </section>

              <section id="company" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">營運資訊</h2>
                <ul className="grid mt-6 list-none max-w-2xl">
                  {COMPANY_INFO.map((item) => (
                    <li
                      key={item.label}
                      className="grid grid-cols-[128px_1fr] gap-5 text-base leading-loose py-3.5 border-b border-[#eeeae2]"
                    >
                      <span className="text-paper-muted">{item.label}</span>
                      <span className="text-paper-body">{item.value}</span>
                    </li>
                  ))}
                  <li className="grid grid-cols-[128px_1fr] gap-5 text-base leading-loose py-3.5">
                    <span className="text-paper-muted">聯絡信箱</span>
                    <a href={`mailto:${EDITORIAL_EMAIL}`} className="font-medium text-brand-600">
                      {EDITORIAL_EMAIL}
                    </a>
                  </li>
                </ul>
              </section>
            </article>

            <PageToc items={TOC_ITEMS} />
          </div>
        </div>
      </div>
    </>
  )
}
