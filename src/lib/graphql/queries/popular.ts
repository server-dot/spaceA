import { gql } from '@apollo/client'
import { ARTICLE_CARD_FIELDS } from '../fragments/articleFields'

// 目前還沒有真實閱讀數據（GA4／WP 閱讀數統計尚未串接，見 TODO.md），
// 「熱門排行」先以發布時間排序頂替，等真實數據接上後再換成依閱讀量排序
export const GET_LATEST_POSTS = gql`
  ${ARTICLE_CARD_FIELDS}
  query GetLatestPosts($first: Int!) {
    posts(first: $first, where: { status: PUBLISH }) {
      nodes {
        ...ArticleCardFields
      }
    }
  }
`
