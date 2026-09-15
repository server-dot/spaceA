export default function ArticleLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="mb-8 space-y-4">
        <div className="h-3 w-48 bg-gray-200 rounded-full" />
        <div className="h-9 bg-gray-200 rounded" />
        <div className="h-9 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded-full" />
      </div>
      <div className="aspect-[16/9] bg-gray-200 rounded-xl mb-10" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`h-4 bg-gray-200 rounded ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  )
}
