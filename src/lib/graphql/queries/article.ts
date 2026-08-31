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
