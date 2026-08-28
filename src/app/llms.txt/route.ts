import { fetchQuery } from '@/lib/graphql/client'
import { GET_NAVIGATION } from '@/lib/graphql/queries/navigation'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants'

export const revalidate = 3600

interface NavigationData {
  categories: {
    nodes: Array<{ name: string; slug: string }>
  }
}

export async function GET() {
  const data = await fetchQuery<NavigationData>(GET_NAVIGATION)
  const categories = data?.categories?.nodes ?? []

  const categoryLines = categories.length
    ? categories.map((cat) => `- [${cat.name}](${SITE_URL}/${cat.slug})`).join('\n')
    : '- （分類資料暫時無法取得）'

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} 由專業 SEO 團隊營運，為各行各業撰寫精選推薦文章，並提供依實際閱讀數據排序的熱門排行。

## 熱門內容

- [熱門排行](${SITE_URL}/popular): 依實際閱讀數據排序的推薦文章排行，每週一更新

## 分類

${categoryLines}

## 關於

- [關於我們與編輯方針](${SITE_URL}/about): 推薦內容如何產生、是否有業配合作、排行如何計算
- [聯絡我們](${SITE_URL}/contact)
- [隱私權政策](${SITE_URL}/privacy)
- [使用條款](${SITE_URL}/terms)
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
