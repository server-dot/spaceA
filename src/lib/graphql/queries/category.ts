import { gql } from '@apollo/client'
import { ARTICLE_CARD_FIELDS } from '../fragments/articleFields'
import { TAXONOMY_SEO_FIELDS } from '../fragments/seoFields'

export const GET_CATEGORY = gql`
  ${ARTICLE_CARD_FIELDS}
  ${TAXONOMY_SEO_FIELDS}
  query GetCategory($slug: ID!, $first: Int!, $after: String) {
    category(id: $slug, idType: SLUG) {
      name
      slug
      description
      count
      seo {
        ...TaxonomySeoFields
      }
      posts(first: $first, after: $after, where: { status: PUBLISH }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...ArticleCardFields
        }
      }
    }
  }
`

export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    categories(first: 100, where: { hideEmpty: true }) {
      nodes {
        name
        slug
      }
    }
  }
`
