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

// 一次確認三個非中文語言的對照分類在不在（中文是來源，一定有）
export const GET_CATEGORY_TRANSLATIONS = gql`
  query GetCategoryTranslations($en: ID!, $ja: ID!, $ko: ID!) {
    en: category(id: $en, idType: SLUG) {
      slug
    }
    ja: category(id: $ja, idType: SLUG) {
      slug
    }
    ko: category(id: $ko, idType: SLUG) {
      slug
    }
  }
`
