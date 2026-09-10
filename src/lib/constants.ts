export const SITE_NAME = 'spaceA'
export const SITE_DESCRIPTION =
  'spaceA 彙整網路真實聲量的推薦文與選購指南，涵蓋旅遊住宿、美妝保養、行銷服務等主題，每篇都標明資料來源與更新日期，幫你比完再決定買什麼、找誰。'
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
  { label: '推薦標準', href: '/standards' },
  { label: '聯絡我們', href: '/contact' },
]

export const COMPANY_NAME = '積木媒體行銷股份有限公司'
export const COMPANY_REG_NO = '00206766'
export const COMPANY_PHONE = '02-2745-7601'
export const COMPANY_ADDRESS = '台北市信義區東興路49號11樓'
export const EDITORIAL_EMAIL = 'seo@stack.com.tw'
export const TECH_EMAIL = 'server@stack.com.tw'

// 站上實際掛名的編輯身分（WP 帳號目前只有一個「admin」，沒設大頭貼/簡介，
// 顯示名稱/頭像直接寫死，不吃 WP author 欄位，避免前台一直冒出「admin」+ 預設大頭貼
// 頭像放在 public/ 自己控制，不外連別的網域（原本連 aiqkangber.com，對方掛掉這裡就破圖）
export const EDITOR_NAME = '阿康'
export const EDITOR_AVATAR_URL = '/editor-avatar-akang.jpg'
export const EDITOR_ROLE = 'spaceA 編輯部主編'
// 文章上方「編者介紹」用的簡介。內容只寫編輯部實際在做的事（彙整、交叉核對、標註來源），
// 不掛任何學歷、證照或年資，避免寫出無法查證的資歷
export const EDITOR_BIO =
  '負責推薦文與選購指南的資料彙整與核對：從公開討論、電商評論與品牌官方資訊交叉比對後撰寫，並標註每則資訊的來源與更新日期。'
