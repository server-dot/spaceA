import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
      <p className="text-5xl font-bold text-gray-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">找不到此頁面</h1>
      <p className="text-gray-500 mb-8">你要找的頁面可能已移除或網址有誤。</p>
      <Link
        href="/"
        className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-full hover:bg-brand-700 transition-colors"
      >
        回首頁
      </Link>
    </div>
  )
}
