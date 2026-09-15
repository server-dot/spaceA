'use client'

import { useEffect } from 'react'

export default function Error({
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-3">發生錯誤</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        頁面載入時出現問題，請稍後再試。
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors"
      >
        重新載入
      </button>
    </div>
  )
}
