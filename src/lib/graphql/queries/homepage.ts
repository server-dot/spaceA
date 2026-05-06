import { gql } from '@apollo/client'
import { ARTICLE_CARD_FIELDS } from '../fragments/articleFields'

export const GET_HOMEPAGE_POSTS = gql`
  ${ARTICLE_CARD_FIELDS}
  query GetHomepagePosts($first: Int!) {
    posts(first: $first, where: { status: PUBLISH }) {
      nodes {
        ...ArticleCardFields
      }
    }
  }
`
