import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

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

  revalidatePath(`/${category}/${slug}`)
  revalidatePath(`/${category}`)
  revalidatePath('/')

  return NextResponse.json({ revalidated: true, slug, category })
}
