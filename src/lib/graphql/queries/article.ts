import { gql } from '@apollo/client'
import { SEO_FIELDS } from '../fragments/seoFields'
import { ARTICLE_CARD_FIELDS } from '../fragments/articleFields'

export const GET_ARTICLE = gql`
  ${SEO_FIELDS}
  ${ARTICLE_CARD_FIELDS}
  query GetArticle($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      modified
      content
      ...ArticleCardFields
      author {
        node {
          name
          avatar {
            url
          }
        }
      }
      seo {
        ...SeoFields
      }
    }
  }
`

export const GET_ALL_POST_SLUGS = gql`
  query GetAllPostSlugs {
    posts(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
        modified
        categories {
          nodes {
            slug
          }
        }
      }
    }
  }
`

// 只確認某個 slug 的文章存不存在（文章頁拿來判斷另一語言的對照頁有沒有翻）
export const GET_POST_EXISTS = gql`
  query GetPostExists($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      slug
    }
  }
`
