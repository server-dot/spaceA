import { gql } from '@apollo/client'

// 用於文章 (PostTypeSEO)
export const SEO_FIELDS = gql`
  fragment SeoFields on PostTypeSEO {
    title
    metaDesc
    opengraphTitle
    opengraphDescription
    opengraphImage {
      sourceUrl
      altText
    }
    canonical
    schema {
      raw
    }
  }
`

// 用於分類 (TaxonomySEO)
export const TAXONOMY_SEO_FIELDS = gql`
  fragment TaxonomySeoFields on TaxonomySEO {
    title
    metaDesc
    opengraphTitle
    opengraphDescription
    opengraphImage {
      sourceUrl
      altText
    }
    canonical
    schema {
      raw
    }
  }
`
