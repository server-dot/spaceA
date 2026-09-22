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
export const EDITOR_ROLE = '內容編輯'
// 文章上方「編者介紹」用的簡介。寫的是這個人怎麼買東西，不是編輯流程說明
// （流程已經寫在文章上方的揭露句，兩邊講一樣的事等於重複）。
// 姓名與職稱在版面上另外一行（職稱做成膠囊），所以這段只寫自介本身。
// 一樣不掛學歷、證照或年資，避免寫出無法查證的資歷
export const EDITOR_BIO =
  '現職 AI 流程開發工程師，曾任 IG 文章寫手、珠寶公司行銷文案編輯。習慣在下單前先問 AI，再開五六個分頁逐項比價，喜歡滑 Threads 看實際使用者的評價與心得。'

// JSON-LD 的 sameAs：讓搜尋引擎／AI 引擎把站上掛名的人和公司對到站外可查證的檔案（E-E-A-T 的「可驗證」那一半）。
// 空陣列就不輸出 sameAs 欄位。填的要是本人／本公司實際經營、公開可看的頁面，不要填沒在用的帳號。
// 使用者決定（2026-09-22）：不填 stack.com.tw——sameAs 等於跟 Google 說「spaceA ＝ 積木」，
// 讀者查到會覺得推薦文是代理商業配；頁尾的公司名是法規揭露，維持原樣就好
// 編輯本人的脆：講 AI 與 n8n，跟簡介「現職 AI 流程開發工程師」對得上，證明作者是真人。
// 使用者要低調：只在文章「編者介紹」職稱旁放一個小字連結（rel=me），首頁／關於頁不放
export const EDITOR_THREADS_URL = 'https://www.threads.com/@q_kangber'
export const EDITOR_SAME_AS: string[] = [EDITOR_THREADS_URL]
export const ORG_SAME_AS: string[] = []

// 「加入寫手團隊」的 Google 表單（跟 mybest 一樣直接連表單，不在站內做頁面）
export const JOIN_FORM_URL = process.env.NEXT_PUBLIC_JOIN_FORM_URL || 'https://docs.google.com/forms/d/1WI3WVzHp4443H7Z-Rh2okJPcL71EjLmcY3SKyRMs0A0/viewform'
