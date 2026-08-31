export const SITE_NAME = 'spaceA'
export const SITE_DESCRIPTION = '精選推薦文章，幫你找到最值得的選擇'
export const POSTS_PER_PAGE = 12
export const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL!
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID

// WordPress 預設分類，發文時忘記選分類就會落到這裡 — 前端一律視為未上架，不顯示、不產生路由
export const EXCLUDED_CATEGORY_SLUGS = ['uncategorized']

// 文章類型 taxonomy（獨立於「分類/主題」），對應 WordPress custom taxonomy `article_type`
// 沒有指定類型的文章（taxonomy 尚未在 WP 設定，或該篇忘記選）一律當作既有的「推薦文」，維持原本行為
export const DEFAULT_ARTICLE_TYPE_SLUG = 'recommendation'
export const ARTICLE_TYPE_LABELS: Record<string, string> = {
  recommendation: '推薦文',
  knowledge: '知識分享',
}

export const NAV_ITEMS = [
  { label: '熱門排行', href: '/popular' },
  { label: '關於我們', href: '/about' },
  { label: '最新消息', href: '/news' },
]

export const COMPANY_NAME = '積木媒體行銷股份有限公司'
export const COMPANY_REG_NO = '00206766'
export const COMPANY_PHONE = '02-2745-7601'
export const COMPANY_ADDRESS = '台北市信義區東興路49號11樓'
export const EDITORIAL_EMAIL = 'seo@stack.com.tw'
export const TECH_EMAIL = 'server@stack.com.tw'
