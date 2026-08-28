import { gql } from '@apollo/client'
import { ARTICLE_CARD_FIELDS } from '../fragments/articleFields'

export const GET_HOMEPAGE_BLOCKS = gql`
  ${ARTICLE_CARD_FIELDS}
  query GetHomepageBlocks($first: Int!, $postsPerCategory: Int!) {
    categories(first: $first, where: { hideEmpty: true }) {
      nodes {
        name
        slug
        count
        posts(first: $postsPerCategory, where: { status: PUBLISH }) {
          nodes {
            ...ArticleCardFields
          }
        }
      }
    }
  }
`
