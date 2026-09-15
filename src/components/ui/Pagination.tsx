'use client'

interface PaginationProps {
  hasNextPage: boolean
  onLoadMore: () => void
  loading?: boolean
  labels?: { more: string; loading: string }
}

export default function Pagination({
  hasNextPage,
  onLoadMore,
  loading,
  labels = { more: '載入更多', loading: '載入中...' },
}: PaginationProps) {
  if (!hasNextPage) return null

  return (
    <div className="flex justify-center mt-10">
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="px-6 py-2.5 text-sm font-medium text-brand-600 border border-brand-200 rounded-full hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? labels.loading : labels.more}
      </button>
    </div>
  )
}
