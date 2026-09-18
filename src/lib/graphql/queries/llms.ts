import { gql } from '@apollo/client'

// llms.txt 用：全站已發佈文章的標題、slug、摘要與分類，讓 AI 搜尋有單篇入口
export const GET_LLMS_ARTICLES = gql`
  query GetLlmsArticles {
    posts(first: 1000, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
      nodes {
        title
        slug
        excerpt
        modified
        categories {
          nodes {
            name
            slug
          }
        }
        seo {
          metaDesc
        }
      }
    }
  }
`
