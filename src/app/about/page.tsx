import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `關於我們 | ${SITE_NAME}`,
  description: `了解 ${SITE_NAME}，我們是一個專業 SEO 公司，為各行各業撰寫精選推薦文章。`,
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">關於我們</h1>
      <div className="prose prose-gray max-w-none">
        <p>
          {SITE_NAME} 是一個專業的推薦文內容平台，由經驗豐富的 SEO 團隊營運。
          我們為各行各業撰寫精選推薦文章，提供消費者最真實、最有價值的參考資訊。
        </p>
        <p>
          無論是 3C 數位產品、美食餐廳、生活居家，還是金融理財、健康醫療，
          我們都致力於提供深度、客觀的推薦內容，幫助你做出最適合的選擇。
        </p>
      </div>
    </div>
  )
}
