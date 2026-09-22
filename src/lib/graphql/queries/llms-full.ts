import { gql } from '@apollo/client'

// llms-full.txt 用：全站已發佈文章連內文一次拉齊，AI 引擎不用逐頁爬
export const GET_LLMS_FULL_ARTICLES = gql`
  query GetLlmsFullArticles {
    posts(first: 1000, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
      nodes {
        title
        slug
        content
        excerpt
        date
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
