import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `與我們聯絡 | ${SITE_NAME}`,
}

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">與我們聯絡</h1>
      <div className="prose prose-gray max-w-none">
        <p>若您有任何問題、合作提案或廣告洽詢，歡迎與我們聯繫。</p>
      </div>
    </div>
  )
}
