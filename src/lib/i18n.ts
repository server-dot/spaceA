/**
 * 雙語（中文／英文）的共用規則。
 *
 * 英文版沒有另裝 Polylang：英文文章就是 WordPress 裡另一篇文章，靠 slug 命名規則對應——
 *   - 英文分類 slug = 中文分類 slug + `-en`（例：travel → travel-en），名稱與描述直接在 WP 填英文
 *   - 英文文章 slug = 中文文章 slug + `-en`
 * 前台網址不露出 `-en`：`/en/travel/nantou-attractions-guide` 對應 WP 的 `travel-en` / `nantou-attractions-guide-en`。
 * 中文列表一律排除 `-en` 分類，英文列表只取 `-en` 分類，靠這條規則就能算出彼此的對照頁。
 * 建英文版用 `scripts/translate_post.py`。
 */
export type Lang = 'zh' | 'en'

export const LANGS: Lang[] = ['zh', 'en']
export const EN_SUFFIX = '-en'

/** HTML lang／hreflang 用的語言標籤 */
export const LANG_TAG: Record<Lang, string> = { zh: 'zh-TW', en: 'en' }
/** Open Graph locale */
export const OG_LOCALE: Record<Lang, string> = { zh: 'zh_TW', en: 'en_US' }

export function isEnSlug(slug: string) {
  return slug.endsWith(EN_SUFFIX)
}

/** 把 WordPress slug 換成前台網址用的 slug（英文版去掉 -en） */
export function toRouteSlug(slug: string) {
  return isEnSlug(slug) ? slug.slice(0, -EN_SUFFIX.length) : slug
}

/** 把前台網址的 slug 換成該語言在 WordPress 的 slug */
export function toWpSlug(lang: Lang, routeSlug: string) {
  return lang === 'en' ? `${routeSlug}${EN_SUFFIX}` : routeSlug
}

/** 這個 WordPress 分類 slug 屬於哪個語言 */
export function langOfCategorySlug(slug: string): Lang {
  return isEnSlug(slug) ? 'en' : 'zh'
}

/** 網址前綴：中文沒有、英文是 /en */
export function langPrefix(lang: Lang) {
  return lang === 'en' ? '/en' : ''
}

export function homeHref(lang: Lang) {
  return lang === 'en' ? '/en' : '/'
}

export function categoryHref(lang: Lang, categorySlug: string) {
  return `${langPrefix(lang)}/${toRouteSlug(categorySlug)}`
}

export function articleHref(lang: Lang, categorySlug: string, postSlug: string) {
  return `${langPrefix(lang)}/${toRouteSlug(categorySlug)}/${toRouteSlug(postSlug)}`
}

/** 從網址路徑判斷語言（client 端 usePathname 用） */
export function langFromPathname(pathname: string | null): Lang {
  return pathname === '/en' || pathname?.startsWith('/en/') ? 'en' : 'zh'
}

/**
 * 語言切換的目標網址：同一條路徑加上或拿掉 /en。
 * 文章頁的英文版還沒翻時會落到英文站的 404（那頁會說明英文版尚未提供）。
 */
export function switchLangHref(pathname: string | null, to: Lang): string {
  const current = langFromPathname(pathname)
  const bare = current === 'en' ? (pathname ?? '/en').replace(/^\/en/, '') || '/' : pathname ?? '/'
  if (bare === '/') return homeHref(to)
  return `${langPrefix(to)}${bare}`
}

/** 站上介面用字。內文本身來自 WordPress，這裡只管版面上的固定字串 */
const zh = {
  home: '首頁',
  siteTagline: '推薦文與選購指南，比完再決定',
  siteDescription:
    'spaceA 彙整網路真實聲量的推薦文與選購指南，涵蓋旅遊住宿、美妝保養、行銷服務等主題，每篇都標明資料來源與更新日期，幫你比完再決定買什麼、找誰。',
  switchLang: 'EN',
  switchLangTitle: 'Switch to English',
  mainNav: '主選單',
  breadcrumbs: '麵包屑',
  published: '發布',
  updated: '更新',
  readingTime: (min: number) => `閱讀約 ${min} 分鐘`,
  disclosure:
    '本文彙整網路公開討論、電商與訂房平台評論及品牌官方資訊，並由編輯部核對後撰寫。部分連結為聯盟連結，不影響推薦內容。價格與供貨請以通路頁面為準。',
  conclusionFirst: '先看結論',
  editorIntro: '編者介紹',
  toc: '本篇目錄',
  faq: '常見問題',
  provenance: '這篇怎麼寫出來的',
  knowledgeDisclosure: '本篇為知識分享，不含合作或聯盟連結。若未來加入，會在文章開頭揭露。',
  editorialPolicy: '編輯方針',
  readMore: '延伸閱讀',
  editorFooter: '我們彙整網路上公開的討論與評論，交叉核對後撰寫推薦，並標註每則資訊的來源與更新日期。發現內容有誤，歡迎',
  contactUs: '與我們聯絡',
  aboutKnowledge: '關於知識分享',
  aboutKnowledgeBody: '知識分享提供判斷方法與照護知識，不指定特定商品。想直接看整理好的選擇，請看推薦文。',
  seeRecommendations: '看推薦文列表',
  sameCategory: '同分類文章',
  seeMoreOf: (name: string) => `看更多${name}`,
  otherTopics: '換個主題看',
  otherCategories: '其他分類',
  postCount: (n: number) => `共 ${n} 篇`,
  postCountShort: (n: number) => `${n} 篇`,
  categoryMetaDesc: (name: string) =>
    `spaceA 的${name}推薦文與選購指南，每篇都標明資料來源與更新日期，幫你比完再決定。`,
  categoryCollection: (name: string) => `${name}推薦文章`,
  categoryCollectionDesc: (name: string) => `spaceA ${name}分類的推薦文章列表`,
  categoryList: (name: string) => `${name}文章列表`,
  articleTypeLabel: '文章類型',
  all: '全部',
  typeSummary: (parts: string) => `這個分類收錄 ${parts}`,
  typeCount: (n: number, label: string) => `${n} 篇${label}`,
  tagFilter: '主題篩選',
  filtering: (n: number) => `篩選中，共 ${n} 篇文章`,
  clearFilter: '清除篩選',
  noPosts: '找不到相關文章，試試其他主題',
  editorsPick: '編輯精選',
  loadMore: '載入更多',
  loading: '載入中...',
  // 首頁
  heroTitle: ['把選擇變簡單，', '把', '好物', '挑出來。'],
  heroSub: '從熱門商品到生活靈感，幫你快速找到真正值得買的選擇。',
  heroTags: ['精選推薦', '深度比較', '來源標註'],
  heroCta: '看熱門推薦',
  heroExplore: '探索分類',
  pickTopics: '想看哪些主題？',
  pickTopicsHint: '可複選，下方分區會即時篩選',
  homeH2: 'spaceA 推薦文：彙整網路真實聲量的選物指南',
  homeH2Sub: '精選推薦文章，幫你找到最值得的選擇。每篇推薦都標明資料來源與更新日期。',
  filteringCategories: (n: number) => `篩選中，顯示 ${n} 個分類`,
  noCategories: '找不到相關分類，試試其他主題',
  viewAll: '查看全部',
  howWePick: '我們怎麼挑',
  howWePickTitle: '彙整網路上最真實的聲量，再交給編輯核對',
  howWePickBody:
    '我們不假裝每樣東西都親手用過。spaceA 的做法是把公開討論整理起來——論壇、社群、電商評論與專業評測——找出被反覆提到的優點與缺點，再回到官方與通路資料核對，最後標明每則資訊的來源。',
  steps: [
    { n: '01', title: '蒐集聲量', body: '彙整論壇、社群與電商評論，記錄每個型號被提到的次數與正負評價比例。' },
    { n: '02', title: '交叉核對', body: '規格與價格一律回到官方與通路頁面確認，不採用單一來源的說法。' },
    { n: '03', title: '標註來源', body: '文中會說明資訊來自實測、使用者回饋或廠商提供，並附上最後更新日期。' },
  ],
  popular: '熱門排行',
  fullRanking: '完整排行',
  featuredTopic: '編輯精選專題',
  moreOf: (name: string) => `更多${name}推薦`,
  featuredBody: (name: string) =>
    `從怎麼挑到怎麼比，我們把${name}相關的推薦文整理成一條龍的決策流程，看完就知道自己該選哪一個。`,
  readTopic: '閱讀專題',
  categoryListName: 'spaceA 文章分類',
  // 頁尾
  footerDisclaimer:
    'spaceA 主打選物，提供閱讀者更多樣化選擇的資訊。本網站所載部分資訊亦有和合作廠商或相關單位合作，並由其提供產品相關資訊或第三方連結。為維護您的權益，請於使用本網站或閱讀本網站資訊時謹慎評估，資訊僅供參考之用。',
  browse: '逛逛 spaceA',
  footerNav: '頁尾連結',
  privacy: '隱私權保護政策',
  terms: '使用條款',
  operatedBy: (company: string, reg: string) => `營運公司：${company}（統編 ${reg}）`,
  notFoundTitle: '找不到此頁面',
  notFoundBody: '你要找的頁面可能已移除或網址有誤。',
  backHome: '回首頁',
  searchPlaceholder: '搜尋文章...',
  editorName: '阿康',
  editorRole: '內容編輯',
  editorBio:
    '現職 AI 流程開發工程師，曾任 IG 文章寫手、珠寶公司行銷文案編輯。習慣在下單前先問 AI，再開五六個分頁逐項比價，喜歡滑 Threads 看實際使用者的評價與心得。',
  articleTypes: { recommendation: '推薦文', knowledge: '知識分享' } as Record<string, string>,
  nav: [
    { label: '熱門排行', href: '/popular' },
    { label: '關於我們', href: '/about' },
    { label: '推薦標準', href: '/standards' },
    { label: '聯絡我們', href: '/contact' },
  ],
  footerColumns: [
    {
      title: '關於 spaceA',
      links: [
        { label: '關於我們', href: '/about' },
        { label: '推薦標準', href: '/standards' },
        { label: '編輯部分工', href: '/about#team' },
        { label: '聯絡我們', href: '/contact' },
      ],
    },
    {
      title: '合作與加入',
      links: [
        { label: '合作洽談', href: '/contact#form' },
        { label: '廣告刊登', href: '/contact#form' },
        { label: '內容授權', href: '/contact#form' },
      ],
    },
    {
      title: '條款與政策',
      links: [
        { label: '合作與聯盟連結揭露', href: '/standards#disclosure' },
        { label: '內容更正政策', href: '/standards#corrections' },
        { label: '評測守則', href: '/standards#limits' },
        { label: '隱私權政策', href: '/privacy' },
        { label: '使用條款', href: '/terms' },
      ],
    },
  ],
  onThisPage: '本頁內容',
  // 熱門排行
  popularTitle: '熱門排行',
  popularIntro: '目前依發布時間排序，帶你看最新上稿的推薦與知識內容。等實際閱讀數據串接完成，會改成依讀者行為排序。',
  popularDescription:
    'spaceA 最新上稿的推薦與知識分享文章，依發布時間排序；等實際閱讀數據串接完成後會改為依讀者行為的熱門排行。',
  popularPeriod: '統計期間：',
  popularAllTime: '全站累計',
  ranges: { week: '本週', month: '本月', all: '總排行' } as Record<string, string>,
  category: '分類',
  popularEmpty: '這個區間還沒有進榜的文章',
  otherTopicsHint: '點進分類，看該主題底下的全部文章。',
  uncategorized: '未分類',
  // 搜尋
  search: '搜尋',
  searchResultsFor: (q: string) => `「${q}」的搜尋結果`,
  searchCount: (n: number) => `共找到 ${n} 篇文章`,
  searchPrompt: '請輸入關鍵字搜尋',
  searchEmpty: '找不到相關文章，試試其他關鍵字',
  noArticles: '目前尚無文章。',
}

export type UIStrings = typeof zh

const en: UIStrings = {
  home: 'Home',
  siteTagline: 'Recommendations & buying guides, compared before you decide',
  siteDescription:
    'spaceA turns real online word-of-mouth into recommendation articles and buying guides across travel, beauty, food and more. Every article lists its sources and last update, so you can compare before you buy.',
  switchLang: '中文',
  switchLangTitle: '切換到中文',
  mainNav: 'Main menu',
  breadcrumbs: 'Breadcrumb',
  published: 'Published',
  updated: 'Updated',
  readingTime: (min: number) => `${min} min read`,
  disclosure:
    'This article compiles public online discussion, marketplace and booking-site reviews, and official brand information, verified by our editors. Some links are affiliate links; they do not affect our picks. Prices and availability are subject to the retailer.',
  conclusionFirst: 'Key Takeaways',
  editorIntro: 'About the Editor',
  toc: 'In This Article',
  faq: 'FAQ',
  provenance: 'How This Article Was Written',
  knowledgeDisclosure:
    'This is an educational article with no sponsored or affiliate links. If that changes, we will disclose it at the top.',
  editorialPolicy: 'Editorial policy',
  readMore: 'Further Reading',
  editorFooter:
    'We compile public discussion and reviews, cross-check them, and cite the source and update date of every claim. Spotted an error? Please',
  contactUs: 'contact us',
  aboutKnowledge: 'About educational articles',
  aboutKnowledgeBody:
    'Educational articles explain how to judge and care, without naming specific products. For curated picks, see our recommendations.',
  seeRecommendations: 'See recommendations',
  sameCategory: 'More in this category',
  seeMoreOf: (name: string) => `More ${name}`,
  otherTopics: 'Other topics',
  otherCategories: 'Other categories',
  postCount: (n: number) => `${n} ${n === 1 ? 'article' : 'articles'}`,
  postCountShort: (n: number) => `${n} ${n === 1 ? 'article' : 'articles'}`,
  categoryMetaDesc: (name: string) =>
    `spaceA's ${name} recommendations and buying guides. Every article lists its sources and last update, so you can compare before you decide.`,
  categoryCollection: (name: string) => `${name} Recommendations`,
  categoryCollectionDesc: (name: string) => `Recommendation articles in spaceA's ${name} category`,
  categoryList: (name: string) => `${name} articles`,
  articleTypeLabel: 'Article type',
  all: 'All',
  typeSummary: (parts: string) => `This category has ${parts}`,
  typeCount: (n: number, label: string) => `${n} ${label}`,
  tagFilter: 'Filter by topic',
  filtering: (n: number) => `Filtering: ${n} ${n === 1 ? 'article' : 'articles'}`,
  clearFilter: 'Clear filters',
  noPosts: 'No articles match. Try another topic.',
  editorsPick: "Editor's pick",
  loadMore: 'Load more',
  loading: 'Loading...',
  heroTitle: ['Make choosing simple.', 'Find the ', 'good stuff', '.'],
  heroSub: 'From trending products to everyday picks, we help you find what is actually worth buying.',
  heroTags: ['Curated picks', 'In-depth comparison', 'Sources cited'],
  heroCta: 'Browse articles',
  heroExplore: 'Explore categories',
  pickTopics: 'Which topics interest you?',
  pickTopicsHint: 'Pick several; the sections below filter instantly',
  homeH2: 'spaceA recommendations: buying guides built on real online word-of-mouth',
  homeH2Sub:
    'Curated recommendation articles to help you find what is worth it. Every article lists its sources and last update.',
  filteringCategories: (n: number) => `Filtering: showing ${n} ${n === 1 ? 'category' : 'categories'}`,
  noCategories: 'No categories match. Try another topic.',
  viewAll: 'View all',
  howWePick: 'How we pick',
  howWePickTitle: 'Gather the most honest voices online, then have editors verify them',
  howWePickBody:
    "We don't pretend to have tried everything ourselves. spaceA collects public discussion from forums, social media, marketplace reviews and expert tests, finds the pros and cons people keep mentioning, checks them against official and retailer data, and cites the source of every claim.",
  steps: [
    { n: '01', title: 'Collect', body: 'Gather forum, social and marketplace reviews and log how often each model is mentioned and how it is rated.' },
    { n: '02', title: 'Cross-check', body: 'Specs and prices are always verified against official and retailer pages, never a single source.' },
    { n: '03', title: 'Cite', body: 'Each article states whether a claim comes from testing, user feedback or the brand, with a last-updated date.' },
  ],
  popular: 'Popular',
  fullRanking: 'Full ranking',
  featuredTopic: 'Featured topic',
  moreOf: (name: string) => `More ${name} picks`,
  featuredBody: (name: string) =>
    `From how to choose to how to compare, our ${name} articles walk you through the whole decision so you know which one to pick.`,
  readTopic: 'Read the topic',
  categoryListName: 'spaceA categories',
  footerDisclaimer:
    'spaceA curates products and services to give readers more options. Some information on this site comes from partner brands or organisations, who may provide product details or third-party links. Please evaluate carefully; all information is for reference only.',
  browse: 'Browse spaceA',
  footerNav: 'Footer links',
  privacy: 'Privacy Policy',
  terms: 'Terms of Use',
  operatedBy: (company: string, reg: string) => `Operated by ${company} (Tax ID ${reg})`,
  notFoundTitle: 'Page not found',
  notFoundBody: 'This page may have been removed, or the English version is not available yet.',
  backHome: 'Back to home',
  searchPlaceholder: 'Search articles...',
  editorName: 'Kang',
  editorRole: 'Content Editor',
  editorBio:
    'AI workflow developer by day; formerly an Instagram copywriter and marketing copy editor at a jewellery company. Asks AI before ordering anything, then opens five or six tabs to compare line by line, and reads real user reviews on Threads.',
  articleTypes: { recommendation: 'Recommendation', knowledge: 'Guide' },
  nav: [
    { label: 'Popular', href: '/en/popular' },
    { label: 'About', href: '/en/about' },
    { label: 'Our Standards', href: '/en/standards' },
    { label: 'Contact', href: '/en/contact' },
  ],
  footerColumns: [
    {
      title: 'About spaceA',
      links: [
        { label: 'About us', href: '/en/about' },
        { label: 'Our standards', href: '/en/standards' },
        { label: 'Editorial team', href: '/en/about#team' },
        { label: 'Contact', href: '/en/contact' },
      ],
    },
    {
      title: 'Work with us',
      links: [
        { label: 'Partnerships', href: '/en/contact#form' },
        { label: 'Advertising', href: '/en/contact#form' },
        { label: 'Content licensing', href: '/en/contact#form' },
      ],
    },
    {
      title: 'Policies',
      links: [
        { label: 'Affiliate disclosure', href: '/en/standards#disclosure' },
        { label: 'Corrections policy', href: '/en/standards#corrections' },
        { label: 'Review principles', href: '/en/standards#limits' },
        { label: 'Privacy policy', href: '/en/privacy' },
        { label: 'Terms of use', href: '/en/terms' },
      ],
    },
  ],
  onThisPage: 'On this page',
  popularTitle: 'Popular Articles',
  popularIntro:
    'Currently sorted by publish date, so you see the newest recommendations and guides first. Once real readership data is connected, this will become a ranking by reader behavior.',
  popularDescription:
    "spaceA's newest recommendation and guide articles, sorted by publish date; this will become a popularity ranking once readership data is connected.",
  popularPeriod: 'Period: ',
  popularAllTime: 'All time',
  ranges: { week: 'This week', month: 'This month', all: 'All time' },
  category: 'Category',
  popularEmpty: 'No articles in this period yet',
  otherTopicsHint: 'Open a category to see every article on that topic.',
  uncategorized: 'Uncategorized',
  search: 'Search',
  searchResultsFor: (q: string) => `Search results for "${q}"`,
  searchCount: (n: number) => `${n} ${n === 1 ? 'article' : 'articles'} found`,
  searchPrompt: 'Enter a keyword to search',
  searchEmpty: 'No matching articles. Try another keyword.',
  noArticles: 'No articles yet.',
}

export const UI: Record<Lang, UIStrings> = { zh, en }

export function ui(lang: Lang): UIStrings {
  return UI[lang]
}

/** 文章類型（推薦文／知識分享）的顯示名稱：中文吃 WP taxonomy 的名字，英文換成字典裡的 */
export function articleTypeLabel(lang: Lang, type: { name: string; slug: string }) {
  return UI[lang].articleTypes[type.slug] ?? type.name
}
