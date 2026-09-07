import Image from 'next/image'
import Link from 'next/link'

const CROWN = (
  <path d="M2 5.2l2.6 2 2.4-3.6 2.4 3.6 2.6-2-.9 6.3H2.9L2 5.2z" />
)
const BARS = <path d="M2.4 12V7.2h2.2V12H2.4zm3.5 0V3.4h2.2V12H5.9zm3.5 0V5.6h2.2V12H9.4z" />
const DOC = (
  <path d="M3.4 1.8h5l3.2 3.2v7.2H3.4V1.8zm4.7.9v2.7h2.7L8.1 2.7zM5.2 7.6h5.1v1H5.2v-1zm0 2.2h5.1v1H5.2v-1z" />
)

const TAGS = [
  { icon: CROWN, label: '精選推薦' },
  { icon: BARS, label: '深度比較' },
  { icon: DOC, label: '來源標註' },
]

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#cad3dc]">
      <div className="relative w-full aspect-[16/10] sm:aspect-[2.4/1] max-h-[680px]">
        {/* 動態背景：靜音自動循環，不吃互動；使用者開啟「減少動態」時整段換成靜態圖 */}
        <video
          className="absolute inset-0 w-full h-full object-cover object-[center_32%] motion-reduce:hidden"
          poster="/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* poster 同一支檔案，影片與靜態圖共用同一份快取，priority 讓它成為可預測的 LCP */}
        <Image
          src="/hero-poster.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden motion-reduce:block object-cover object-[center_32%]"
        />

        {/* 底部淡出到頁面白底，避免冷灰影片和內容區之間出現一條硬邊 */}
        <div className="absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.75)_55%,#ffffff_100%)] z-[1]" />

        {/* 左側柔化，讓文字在任何一幀上都讀得到 */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(202,211,220,0.78)_0%,rgba(202,211,220,0.66)_30%,rgba(202,211,220,0.32)_52%,rgba(202,211,220,0)_74%)]" />

        <div className="relative h-full max-w-6xl mx-auto px-6 sm:px-8 flex flex-col justify-center pb-14 sm:pb-16">
          <h1 className="font-serif font-bold text-paper-ink text-[32px] sm:text-[46px] lg:text-[56px] leading-[1.2] tracking-tight">
            把選擇變簡單，
            <br />把<span className="text-brand-600">好物</span>挑出來。
          </h1>

          {/* 手繪金線收尾，帶一個小繞圈，呼應標題的「挑出來」 */}
          <svg
            viewBox="0 -4 300 40"
            className="mt-3 sm:mt-4 w-[210px] sm:w-[268px] h-auto"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 26C60 14 110 9 140 8C158 8 162 18 148 21C134 24 128 12 141 5C160 -2 230 6 294 16"
              stroke="#0284c7"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <p className="mt-5 sm:mt-6 text-[14px] sm:text-[16px] leading-relaxed text-paper-body max-w-[26rem]">
            從熱門商品到生活靈感，幫你快速找到真正值得買的選擇。
          </p>

          <ul className="flex items-center flex-wrap gap-x-3 gap-y-2 mt-4 sm:mt-5 text-[13px] sm:text-sm font-medium text-paper-secondary">
            {TAGS.map((tag, i) => (
              <li key={tag.label} className="flex items-center gap-3">
                {i > 0 && <span className="text-paper-muted/70">/</span>}
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 14 14" className="w-3.5 h-3.5 fill-brand-600 shrink-0" aria-hidden="true">
                    {tag.icon}
                  </svg>
                  {tag.label}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3 mt-6 sm:mt-8">
            <Link
              href="/popular"
              className="group inline-flex items-center gap-2 bg-brand-600 text-white text-[13px] sm:text-sm font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-[0_10px_24px_rgba(2,132,199,0.25)] hover:bg-brand-700 transition-colors"
            >
              看熱門推薦
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              href="#topics"
              className="inline-flex items-center bg-white text-paper-ink text-[13px] sm:text-sm font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-full border border-paper-border hover:bg-paper-surface transition-colors"
            >
              探索分類
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
