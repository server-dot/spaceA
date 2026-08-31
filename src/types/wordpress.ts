export interface WPImage {
  sourceUrl: string
  altText: string
  mediaDetails?: {
    width: number
    height: number
  }
}

export interface WPCategory {
  name: string
  slug: string
  description?: string
  count?: number
}

export interface WPTag {
  name: string
  slug: string
}

export interface WPArticleType {
  name: string
  slug: string
}

export interface WPAuthor {
  name: string
  avatar?: {
    url: string
  }
}

import type { WPSeo } from './seo'

export interface WPPost {
  id: string
  databaseId: number
  title: string
  slug: string
  date: string
  modified: string
  excerpt: string
  content: string
  featuredImage?: {
    node: WPImage
  }
  categories: {
    nodes: WPCategory[]
  }
  tags: {
    nodes: WPTag[]
  }
  articleTypes?: {
    nodes: WPArticleType[]
  }
  author: {
    node: WPAuthor
  }
  seo: WPSeo
}

export interface WPPostCard {
  title: string
  slug: string
  date: string
  excerpt: string
  featuredImage?: {
    node: WPImage
  }
  categories: {
    nodes: WPCategory[]
  }
  tags: {
    nodes: WPTag[]
  }
  articleTypes?: {
    nodes: WPArticleType[]
  }
}

export interface WPPageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string
  endCursor: string
}
