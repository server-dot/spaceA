import { gql } from '@apollo/client'

export const GET_SITEMAP_DATA = gql`
  query GetSitemapData {
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
    categories(first: 100, where: { hideEmpty: true }) {
      nodes {
        slug
      }
    }
  }
`
