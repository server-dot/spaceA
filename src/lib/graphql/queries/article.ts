import { gql } from '@apollo/client'
import { SEO_FIELDS } from '../fragments/seoFields'

export const GET_ARTICLE = gql`
  ${SEO_FIELDS}
  query GetArticle($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      slug
      date
      modified
      content
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
      tags {
        nodes {
          name
          slug
        }
      }
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
