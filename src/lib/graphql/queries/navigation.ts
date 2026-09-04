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

// 熱門排行頁「換個主題看」要展示全部主題（含還沒發文的 0 篇），跟站內導覽選單分開查，
// 避免導覽選單或 llms.txt 也連動跑出空分類連結
export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    categories(first: 50, where: { hideEmpty: false }) {
      nodes {
        name
        slug
        count
      }
    }
  }
`
