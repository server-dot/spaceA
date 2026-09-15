export default function CategoryLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-32 bg-gray-200 rounded-full" />
        <div className="h-7 w-40 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
            <div className="aspect-[16/9] bg-gray-200" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-16 bg-gray-200 rounded-full" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
