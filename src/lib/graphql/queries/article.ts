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

// 一次確認三個非中文語言的對照文章在不在（中文是來源，一定有）。
// 用別名一次查完，免得一篇文章要多打三次 GraphQL
export const GET_POST_TRANSLATIONS = gql`
  query GetPostTranslations($en: ID!, $ja: ID!, $ko: ID!) {
    en: post(id: $en, idType: SLUG) {
      slug
    }
    ja: post(id: $ja, idType: SLUG) {
      slug
    }
    ko: post(id: $ko, idType: SLUG) {
      slug
    }
  }
`
