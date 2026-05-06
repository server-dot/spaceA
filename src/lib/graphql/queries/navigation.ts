import { gql } from '@apollo/client'

export const GET_NAVIGATION = gql`
  query GetNavigation {
    categories(first: 20, where: { hideEmpty: true }) {
      nodes {
        name
        slug
        count
      }
    }
  }
`
