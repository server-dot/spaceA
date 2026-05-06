import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `隱私權保護政策 | ${SITE_NAME}`,
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">隱私權保護政策</h1>
      <div className="prose prose-gray max-w-none">
        <p>本站重視您的隱私權，以下說明本網站如何蒐集、使用及保護您的個人資訊。</p>
        <h2>資料蒐集</h2>
        <p>本站僅蒐集您主動提供的資料，以及網站流量分析所需的匿名統計資訊。</p>
        <h2>Cookie 使用</h2>
        <p>本站使用 Google Analytics 等工具進行流量分析，相關資料均為匿名處理。</p>
        <h2>聯絡我們</h2>
        <p>若您對本隱私政策有任何疑問，歡迎透過聯絡頁面與我們聯繫。</p>
      </div>
    </div>
  )
}
