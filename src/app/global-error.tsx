'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="zh-TW">
      <body className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 px-4 text-center">
        <h2 className="text-2xl font-bold mb-3">發生嚴重錯誤</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          應用程式發生未預期的錯誤，請重新整理頁面。
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors"
        >
          重試
        </button>
      </body>
    </html>
  )
}
