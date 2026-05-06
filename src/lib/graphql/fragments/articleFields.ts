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
  }
`
