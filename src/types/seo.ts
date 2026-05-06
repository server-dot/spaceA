export interface WPSeo {
  title: string
  metaDesc: string
  opengraphTitle: string
  opengraphDescription: string
  opengraphImage?: {
    sourceUrl: string
    altText: string
  }
  canonical: string
  schema?: {
    raw: string
  }
}
