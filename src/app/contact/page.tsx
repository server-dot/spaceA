import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ContactForm from './ContactForm'
import { COMPANY_ADDRESS, COMPANY_PHONE, EDITORIAL_EMAIL, TECH_EMAIL } from '@/lib/constants'

const DESCRIPTION = '內容更正、選題建議、廣告與內容授權洽詢的聯絡方式。內容更正會優先處理。'

const BREADCRUMBS = [
  { label: '首頁', href: '/' },
  { label: '聯絡我們', href: '/contact' },
]

export const metadata: Metadata = {
  title: '聯絡我們',
  description: DESCRIPTION,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: '聯絡我們',
    description: DESCRIPTION,
  },
}

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <section className="pt-8 max-w-3xl">
            <Breadcrumbs items={BREADCRUMBS} />

            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px]">
              聯絡我們
            </h1>
            <p className="text-[17px] leading-loose text-paper-body mt-5 text-balance">
              內容有誤、想建議我們寫哪個主題，或要談廣告與內容授權，都可以從這裡告訴我們。內容更正會優先處理，我們核對後會更正文章並更新最後更新日期。
            </p>
            <p className="text-sm leading-loose text-paper-secondary mt-3.5 text-balance">
              spaceA 的編輯內容與商務往來分開處理，推薦名單與排序不對外開放付費，也不接業配。詳細作法寫在
              <a href="/standards" className="text-brand-600 font-bold">
                推薦標準
              </a>
              。
            </p>
          </section>

          <section
            id="form"
            className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 items-start mt-14 pt-10 border-t border-paper-border"
          >
            <div>
              <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">聯絡資訊</h2>
              <ul className="grid mt-6 divide-y divide-[#eeeae2]">
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">編輯部門</b>
                  <a href={`mailto:${EDITORIAL_EMAIL}`} className="text-[15px] font-medium text-brand-600">
                    {EDITORIAL_EMAIL}
                  </a>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">
                    內容更正、選題建議，其他問題也寄這裡
                  </p>
                </li>
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">技術部門</b>
                  <a href={`mailto:${TECH_EMAIL}`} className="text-[15px] font-medium text-brand-600">
                    {TECH_EMAIL}
                  </a>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">
                    網站異常、頁面打不開或顯示錯誤
                  </p>
                </li>
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">連絡電話與營業時間</b>
                  <a href="tel:0227457601" className="text-[15px] font-medium text-brand-600">
                    {COMPANY_PHONE}
                  </a>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">週一至週五 / 10:00 – 19:00</p>
                </li>
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">辦公室地址</b>
                  <span className="text-[15px] text-paper-body">{COMPANY_ADDRESS}</span>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">需要當面討論可先來信約時間</p>
                </li>
              </ul>

              <div className="mt-5 border border-paper-border rounded-2xl overflow-hidden">
                <iframe
                  title="積木媒體行銷位置地圖"
                  src="https://maps.google.com/maps?q=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%BF%A1%E7%BE%A9%E5%8D%80%E6%9D%B1%E8%88%88%E8%B7%AF49%E8%99%9F11%E6%A8%93&t=m&z=16&output=embed&iwloc=near"
                  width="100%"
                  height="300"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block border-0"
                />
              </div>
            </div>

            <ContactForm />
          </section>

          <section className="mt-14 pt-10 border-t border-paper-border">
            <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">我們怎麼處理來信</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 mt-7">
              <div className="border-t-2 border-brand-600 pt-3.5">
                <b className="text-base font-bold text-paper-ink">內容更正優先</b>
                <p className="text-[15px] leading-loose text-paper-secondary mt-1.5">
                  核對來源後更正，並更新文章的最後更新日期；若影響原本結論會加註修正說明。
                </p>
              </div>
              <div className="border-t-2 border-brand-600 pt-3.5">
                <b className="text-base font-bold text-paper-ink">一定回信</b>
                <p className="text-[15px] leading-loose text-paper-secondary mt-1.5">
                  合作洽詢與選題建議都會回覆，若主題已在規劃中會說明時程。
                </p>
              </div>
              <div className="border-t-2 border-brand-600 pt-3.5">
                <b className="text-base font-bold text-paper-ink">不做付費推薦</b>
                <p className="text-[15px] leading-loose text-paper-secondary mt-1.5">
                  希望購買推薦名單、排序或修改結論的來信，我們會直接婉拒。
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
