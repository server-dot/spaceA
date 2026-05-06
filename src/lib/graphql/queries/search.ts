import { gql } from '@apollo/client'
import { ARTICLE_CARD_FIELDS } from '../fragments/articleFields'

export const GET_SEARCH_POSTS = gql`
  ${ARTICLE_CARD_FIELDS}
  query SearchPosts($query: String!, $first: Int!) {
    posts(first: $first, where: { search: $query, status: PUBLISH }) {
      nodes {
        ...ArticleCardFields
      }
    }
  }
`
