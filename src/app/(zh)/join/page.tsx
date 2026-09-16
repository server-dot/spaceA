import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import JoinForm from '@/views/JoinForm'
import Reveal from '@/components/ui/Reveal'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

const DESCRIPTION =
  'spaceA 在找各領域的達人與寫手，把實際用過、比較過的東西寫成推薦清單。文章署名、稿費依篇計算、規格與價格由編輯部核對。'

const BREADCRUMBS = [
  { label: '首頁', href: '/' },
  { label: '加入寫手團隊', href: '/join' },
]

// 這頁目前只有中文版，其他語言的「加入」入口先導到各自的聯絡表單
export const metadata: Metadata = {
  title: '加入寫手團隊',
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/join` },
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    siteName: SITE_NAME,
    title: '加入 spaceA 寫手團隊',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

const LOOKING_FOR = [
  {
    title: '在某個領域真的花過錢',
    body: '你自己選過飯店、比過保養品、換過三台吸塵器。文章要的是這種「選過」的經驗，不是查資料整理出來的。',
  },
  {
    title: '寫得出為什麼選 A 不選 B',
    body: '不用文筆好，但要講得出差在哪。「這款比較貴，但夏天不會悶」比「質感很好」有用一百倍。',
  },
  {
    title: '願意掛名',
    body: '文章會放你的名字、介紹與社群連結。真名或穩定使用的筆名都可以，匿名不行。',
  },
]

const PERKS = [
  { title: '署名與介紹', body: '每篇文章掛你的名字，附個人介紹與社群連結，累積的是你自己的作品。' },
  { title: '稿費依篇計算', body: '主題由你提，也可以接編輯部開的題目。稿費在試寫通過後談定，按篇結算。' },
  { title: '編輯部幫你核對', body: '規格、價格、地址這些由編輯部回官方頁面確認，你只管寫你懂的部分。' },
]

const STEPS = [
  { n: '01', title: '投遞表單', body: '填下面的表單，留專長領域、作品或社群連結，加幾句自我介紹。' },
  { n: '02', title: '線上聊 20 分鐘', body: '編輯部看過後回信約時間，聊你熟的領域和想寫的題目。' },
  { n: '03', title: '試寫一篇', body: '挑一個你最熟的主題寫一篇，通過後正式合作，稿費也在這時談定。' },
]

export default function JoinPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <section className="pt-8 max-w-3xl">
            <Breadcrumbs items={BREADCRUMBS} />
            <div className="text-xs tracking-wider text-brand-600 font-bold mt-[18px]">專家・達人招募</div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-3">
              把你的專業寫成一份推薦清單
            </h1>
            <p className="text-[17px] leading-loose text-paper-body mt-5 text-balance">
              spaceA 在找各領域的達人與寫手。你熟旅遊、美妝、健康、美食或行銷，願意把自己實際用過、比較過的東西整理成清單，就適合投遞。
            </p>
            <Link
              href="#form"
              className="inline-block w-fit mt-6 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors"
            >
              直接填表單
            </Link>
          </section>

          <Reveal as="section" className="mt-14 pt-10 border-t border-paper-border">
            <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">我們在找什麼樣的人</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 mt-7">
              {LOOKING_FOR.map((item) => (
                <div key={item.title} className="border-t-2 border-brand-600 pt-3.5">
                  <b className="text-base font-bold text-paper-ink">{item.title}</b>
                  <p className="text-[15px] leading-loose text-paper-secondary mt-1.5">{item.body}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal as="section" className="mt-14 pt-10 border-t border-paper-border">
            <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">合作方式</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7 list-none">
              {PERKS.map((perk, i) => (
                <li key={perk.title} className="bg-brand-50 border border-brand-100 rounded-xl px-6 py-5">
                  <b className="font-serif text-sm font-bold text-brand-600 tracking-wider">0{i + 1}</b>
                  <b className="block text-base font-bold text-paper-ink mt-1.5">{perk.title}</b>
                  <p className="text-[15px] leading-loose text-paper-secondary mt-2">{perk.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal as="section" className="mt-14 pt-10 border-t border-paper-border">
            <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">投遞之後會發生什麼</h2>
            <ol className="grid gap-8 mt-8 pl-[34px] border-l-2 border-brand-200 list-none max-w-2xl">
              {STEPS.map((step) => (
                <li key={step.n} className="relative">
                  <span className="absolute -left-[43px] top-0.5 w-[18px] h-[18px] rounded-full bg-brand-600" />
                  <b className="block text-xs font-bold tracking-wider text-brand-600">STEP {step.n}</b>
                  <b className="block text-lg font-bold text-paper-ink mt-1.5">{step.title}</b>
                  <p className="text-base leading-loose text-paper-body mt-2 text-balance">{step.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <section id="form" className="mt-14 pt-10 border-t border-paper-border max-w-2xl">
            <JoinForm />
          </section>
        </div>
      </div>
    </>
  )
}
