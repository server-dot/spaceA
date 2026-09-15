import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { articleHref, categoryHref, homeHref, langOfCategorySlug } from '@/lib/i18n'

/**
 * WordPress 端送來的是 WP 的分類／文章 slug（英日韓版帶 -en／-ja／-ko），
 * 前台網址不露後綴、改用語言前綴，所以要先換算再清快取。
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const body = await request.json()
  const { slug, category } = body

  if (!slug || !category) {
    return NextResponse.json({ message: 'Missing slug or category' }, { status: 400 })
  }

  const lang = langOfCategorySlug(category)
  const paths = [articleHref(lang, category, slug), categoryHref(lang, category), homeHref(lang)]
  paths.forEach((p) => revalidatePath(p))

  return NextResponse.json({ revalidated: true, lang, paths })
}
