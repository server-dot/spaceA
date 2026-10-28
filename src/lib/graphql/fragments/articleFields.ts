import { gql } from '@apollo/client'

export const ARTICLE_CARD_FIELDS = gql`
  fragment ArticleCardFields on Post {
    title
    slug
    date
    excerpt
    featuredImage {
      node {
        sourceUrl
        # 卡片用 WP 自己切好的 768 寬縮圖，不經前台圖片優化器（Zeabur 抓 WP 圖常超過 7 秒逾時變空白）
        cardUrl: sourceUrl(size: MEDIUM_LARGE)
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    categories {
      nodes {
        name
        slug
      }
    }
    tags {
      nodes {
        name
        slug
      }
    }
    articleTypes {
      nodes {
        name
        slug
      }
    }
  }
`
