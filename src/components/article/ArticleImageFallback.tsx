import Image from 'next/image'

export default function ArticleImageFallback({ size = 32 }: { size?: number }) {
  return (
    <div className="absolute inset-0 bg-paper-surface flex items-center justify-center">
      <Image src="/logo-sa-mark.png" alt="" width={size} height={size} className="opacity-20" />
    </div>
  )
}
