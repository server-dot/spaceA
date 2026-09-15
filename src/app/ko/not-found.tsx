import Link from 'next/link'
import { ui } from '@/lib/i18n'

const t = ui('ko')

// 韓文站的 404：多半是那篇文章還沒翻成韓文（語言切換直接用網址推算，不先確認對照頁存不存在）
export default function KoNotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
      <p className="text-5xl font-bold text-gray-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">{t.notFoundTitle}</h1>
      <p className="text-gray-500 mb-8">{t.notFoundBody}</p>
      <Link
        href="/en"
        className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-full hover:bg-brand-700 transition-colors"
      >
        {t.backHome}
      </Link>
    </div>
  )
}
