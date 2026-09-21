import BrokenImageFallback from './BrokenImageFallback'
import SvgTextFit from './SvgTextFit'

interface ArticleBodyProps {
  content: string
}

export default function ArticleBody({ content }: ArticleBodyProps) {
  return (
    <>
      <BrokenImageFallback />
      <SvgTextFit />
      <div
        className="prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: content ?? '' }}
      />
    </>
  )
}
