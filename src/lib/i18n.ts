/**
 * 多語系（中文／英文／日文／韓文）的共用規則。
 *
 * 沒有裝 Polylang：各語言版本就是 WordPress 裡另一篇文章，靠 slug 命名規則對應——
 *   - 分類 slug = 中文分類 slug + 語言後綴（travel → travel-en／travel-ja／travel-ko），名稱與描述直接在 WP 填該語言
 *   - 文章 slug = 中文 slug + 同一組後綴
 * 前台網址不露出後綴：`/ja/travel/nantou-attractions-guide` 對應 WP 的 `travel-ja` / `nantou-attractions-guide-ja`。
 * 中文列表只取沒有後綴的分類，其他語言只取自己後綴的分類，靠這條規則就能算出彼此的對照頁。
 * 建各語言版本用 `scripts/translate_post.py --lang ja`。
 */
export type Lang = 'zh' | 'en' | 'ja' | 'ko'

/** 中文是主站（沒有後綴、沒有網址前綴），其餘語言照這個順序排在語言選單裡 */
export const LANGS: Lang[] = ['zh', 'en', 'ja', 'ko']

/** WordPress slug 的語言後綴。中文是空字串＝沒有後綴 */
export const LANG_SUFFIX: Record<Lang, string> = { zh: '', en: '-en', ja: '-ja', ko: '-ko' }

/** HTML lang／hreflang 用的語言標籤 */
export const LANG_TAG: Record<Lang, string> = { zh: 'zh-TW', en: 'en', ja: 'ja', ko: 'ko' }

/** Open Graph locale */
export const OG_LOCALE: Record<Lang, string> = { zh: 'zh_TW', en: 'en_US', ja: 'ja_JP', ko: 'ko_KR' }

/** 除了中文以外的語言後綴，比對時用（長度都一樣，順序無所謂） */
const SUFFIXES = LANGS.filter((l) => l !== 'zh').map((l) => LANG_SUFFIX[l])

/** 把 WordPress slug 換成前台網址用的 slug（去掉語言後綴） */
export function toRouteSlug(slug: string) {
  const hit = SUFFIXES.find((s) => slug.endsWith(s))
  return hit ? slug.slice(0, -hit.length) : slug
}

/** 把前台網址的 slug 換成該語言在 WordPress 的 slug */
export function toWpSlug(lang: Lang, routeSlug: string) {
  return `${routeSlug}${LANG_SUFFIX[lang]}`
}

/** 這個 WordPress 分類 slug 屬於哪個語言 */
export function langOfCategorySlug(slug: string): Lang {
  return LANGS.find((l) => l !== 'zh' && slug.endsWith(LANG_SUFFIX[l])) ?? 'zh'
}

/** 網址前綴：中文沒有，其餘是 /en、/ja、/ko */
export function langPrefix(lang: Lang) {
  return lang === 'zh' ? '' : `/${lang}`
}

export function homeHref(lang: Lang) {
  return lang === 'zh' ? '/' : `/${lang}`
}

export function categoryHref(lang: Lang, categorySlug: string) {
  return `${langPrefix(lang)}/${toRouteSlug(categorySlug)}`
}

export function articleHref(lang: Lang, categorySlug: string, postSlug: string) {
  return `${langPrefix(lang)}/${toRouteSlug(categorySlug)}/${toRouteSlug(postSlug)}`
}

/** 從網址路徑判斷語言（client 端 usePathname 用） */
export function langFromPathname(pathname: string | null): Lang {
  const path = pathname ?? '/'
  return LANGS.find((l) => l !== 'zh' && (path === `/${l}` || path.startsWith(`/${l}/`))) ?? 'zh'
}

/**
 * 語言切換的目標網址：同一條路徑換掉語言前綴。
 * 該篇還沒翻成目標語言時會落到那個語言的 404（那頁會說明此語言版本尚未提供）。
 */
export function switchLangHref(pathname: string | null, to: Lang): string {
  const current = langFromPathname(pathname)
  const prefix = langPrefix(current)
  const bare = prefix ? (pathname ?? prefix).slice(prefix.length) || '/' : pathname ?? '/'
  if (bare === '/') return homeHref(to)
  return `${langPrefix(to)}${bare}`
}

/** 各語言在語言選單裡顯示的自稱 */
export const LANG_NAME: Record<Lang, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
}

/** 站上介面用字。內文本身來自 WordPress，這裡只管版面上的固定字串 */
const zh = {
  home: '首頁',
  siteTagline: '真實評價整理的推薦文與選購指南',
  siteDescription:
    'spaceA 彙整網路真實聲量的推薦文與選購指南，涵蓋旅遊住宿、美妝保養、行銷服務等主題，每篇都標明資料來源與更新日期，幫你比完再決定買什麼、找誰。',
  langMenu: '語言',
  mainNav: '主選單',
  breadcrumbs: '麵包屑',
  published: '發布',
  updated: '更新',
  readingTime: (min: number) => `閱讀約 ${min} 分鐘`,
  disclosure:
    '本文彙整網路公開討論、電商與訂房平台評論及品牌官方資訊，並由編輯部核對後撰寫。文中連結皆為品牌官網或通路頁面，本站不從點擊或購買中分潤。價格與供貨請以通路頁面為準。',
  conclusionFirst: '先看結論',
  editorIntro: '編者介紹',
  toc: '本篇目錄',
  faq: '常見問題',
  provenance: '這篇怎麼寫出來的',
  knowledgeDisclosure: '本篇為知識分享，不含廣告或合作內容。若未來加入，會在文章開頭揭露。',
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
  categoryTitle: (name: string) => `${name}推薦文與選購指南`,
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
  join: {
    kicker: '專家・達人招募',
    title: '把你的專業寫成一份推薦清單',
    body: 'spaceA 在找各領域的達人與寫手。你熟旅遊、美妝、健康、美食或行銷，願意把自己實際用過、比較過的東西整理成清單，就適合來投稿。',
    wants: [
      '文章署名，並附上你的個人介紹與社群連結',
      '稿費依篇計算，主題由你提，也可以接編輯部的題目',
      '規格與價格由編輯部核對，你只管寫你懂的部分',
    ],
    cta: '加入寫手團隊',
  },
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
        { label: '加入寫手團隊', href: '/contact?topic=join#form' },
      ],
    },
    {
      title: '條款與政策',
      links: [
        { label: '廣告與合作揭露', href: '/standards#disclosure' },
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
  langMenu: 'Language',
  mainNav: 'Main menu',
  breadcrumbs: 'Breadcrumb',
  published: 'Published',
  updated: 'Updated',
  readingTime: (min: number) => `${min} min read`,
  disclosure:
    'This article compiles public online discussion, marketplace and booking-site reviews, and official brand information, verified by our editors. Links go straight to brand or retailer pages; spaceA earns nothing from clicks or purchases. Prices and availability are subject to the retailer.',
  conclusionFirst: 'Key Takeaways',
  editorIntro: 'About the Editor',
  toc: 'In This Article',
  faq: 'FAQ',
  provenance: 'How This Article Was Written',
  knowledgeDisclosure:
    'This is an educational article with no ads or sponsored content. If that changes, we will disclose it at the top.',
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
  categoryTitle: (name: string) => `${name} Recommendations & Buying Guides`,
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
  join: {
    kicker: 'Experts & creators wanted',
    title: 'Turn what you know into a recommendation list',
    body: 'spaceA is looking for experts and writers in every category. If you know travel, beauty, health, food or marketing and can turn what you have actually used and compared into a list, we would like to hear from you.',
    wants: [
      'Your byline, bio and social links on every article',
      'Paid per article; pitch your own topics or take briefs from the editors',
      'Editors verify specs and prices, you write the part you know',
    ],
    cta: 'Join as a writer',
  },
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
        { label: 'Join as a writer', href: '/en/contact?topic=join#form' },
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

const ja: UIStrings = {
  home: 'ホーム',
  siteTagline: '比べてから決める、おすすめ記事と選び方ガイド',
  siteDescription:
    'spaceA はネット上の実際の口コミをまとめ、旅行・宿泊、美容、グルメなどのおすすめ記事と選び方ガイドをお届けします。すべての記事に出典と更新日を明記しているので、買う前に比べられます。',
  langMenu: '言語',
  mainNav: 'メインメニュー',
  breadcrumbs: 'パンくずリスト',
  published: '公開',
  updated: '更新',
  readingTime: (min: number) => `約 ${min} 分で読めます`,
  disclosure:
    'この記事はネット上の公開された議論、EC・予約サイトのレビュー、ブランド公式情報をまとめ、編集部が確認したうえで執筆しています。記事内のリンクはブランド公式サイトや販売ページに直接つながるもので、クリックや購入による報酬は受け取っていません。価格と在庫は各販売ページをご確認ください。',
  conclusionFirst: '結論から',
  editorIntro: '編集者について',
  toc: '目次',
  faq: 'よくある質問',
  provenance: 'この記事の作り方',
  knowledgeDisclosure:
    'この記事はナレッジ記事で、広告や提携コンテンツを含みません。今後追加する場合は記事の冒頭で明記します。',
  editorialPolicy: '編集方針',
  readMore: '関連記事',
  editorFooter:
    'ネット上の公開された議論とレビューをまとめ、裏取りをしたうえでおすすめを書き、情報ごとに出典と更新日を明記しています。内容の誤りを見つけたら',
  contactUs: 'ご連絡ください',
  aboutKnowledge: 'ナレッジ記事について',
  aboutKnowledgeBody:
    'ナレッジ記事は選び方や手入れの考え方を扱い、特定の商品を指定しません。まとまったおすすめを見たい方はおすすめ記事へどうぞ。',
  seeRecommendations: 'おすすめ記事を見る',
  sameCategory: '同じカテゴリの記事',
  seeMoreOf: (name: string) => `${name}をもっと見る`,
  otherTopics: '他のテーマを見る',
  otherCategories: '他のカテゴリ',
  postCount: (n: number) => `全 ${n} 件`,
  postCountShort: (n: number) => `${n} 件`,
  categoryMetaDesc: (name: string) =>
    `spaceA の${name}のおすすめ記事と選び方ガイド。すべての記事に出典と更新日を明記しているので、比べてから決められます。`,
  categoryTitle: (name: string) => `${name}のおすすめ記事と選び方ガイド`,
  categoryCollection: (name: string) => `${name}のおすすめ記事`,
  categoryCollectionDesc: (name: string) => `spaceA の${name}カテゴリのおすすめ記事一覧`,
  categoryList: (name: string) => `${name}の記事一覧`,
  articleTypeLabel: '記事タイプ',
  all: 'すべて',
  typeSummary: (parts: string) => `このカテゴリの内訳は${parts}`,
  typeCount: (n: number, label: string) => `${label} ${n} 件`,
  tagFilter: 'テーマで絞り込む',
  filtering: (n: number) => `絞り込み中、全 ${n} 件`,
  clearFilter: '絞り込みを解除',
  noPosts: '該当する記事がありません。他のテーマをお試しください。',
  editorsPick: '編集部のおすすめ',
  loadMore: 'もっと見る',
  loading: '読み込み中...',
  heroTitle: ['選ぶのを、かんたんに。', '', 'いいもの', 'だけを見つける。'],
  heroSub: '話題の商品から暮らしのヒントまで、本当に買う価値のある選択肢をすばやく見つけられます。',
  heroTags: ['厳選おすすめ', 'じっくり比較', '出典を明記'],
  heroCta: '人気記事を見る',
  heroExplore: 'カテゴリを見る',
  pickTopics: '気になるテーマは？',
  pickTopicsHint: '複数選べます。下のセクションがすぐに絞り込まれます',
  homeH2: 'spaceA のおすすめ記事：ネットの実際の口コミからつくる選び方ガイド',
  homeH2Sub:
    '厳選したおすすめ記事で、本当に価値のある選択肢を見つけてください。すべての記事に出典と更新日を明記しています。',
  filteringCategories: (n: number) => `絞り込み中、${n} カテゴリを表示`,
  noCategories: '該当するカテゴリがありません。他のテーマをお試しください。',
  viewAll: 'すべて見る',
  howWePick: '選び方のルール',
  howWePickTitle: 'ネット上のいちばん率直な声を集め、編集部が裏取りする',
  howWePickBody:
    'すべてを自分で使ったふりはしません。spaceA は掲示板、SNS、EC のレビュー、専門家のテストなど公開された議論を集め、繰り返し挙がる長所と短所を洗い出し、公式や販売店の情報と突き合わせたうえで、情報ごとに出典を明記します。',
  steps: [
    { n: '01', title: '声を集める', body: '掲示板、SNS、EC のレビューをまとめ、どの型番が何回言及され、評価がどう分かれたかを記録します。' },
    { n: '02', title: '突き合わせる', body: 'スペックと価格は必ず公式ページと販売店で確認し、ひとつの情報源だけでは採用しません。' },
    { n: '03', title: '出典を書く', body: '実測なのか、利用者の声なのか、メーカー提供なのかを本文に明記し、最終更新日を添えます。' },
  ],
  popular: '人気記事',
  fullRanking: 'ランキング全体',
  featuredTopic: '編集部特集',
  moreOf: (name: string) => `${name}のおすすめをもっと`,
  featuredBody: (name: string) =>
    `選び方から比べ方まで、${name}のおすすめ記事を一本の流れに整理しました。読み終える頃には、どれを選ぶべきか分かります。`,
  readTopic: '特集を読む',
  join: {
    kicker: '専門家・達人募集',
    title: 'あなたの専門知識をおすすめリストに',
    body: 'spaceAでは各分野の達人やライターを募集しています。旅行、美容、健康、グルメ、マーケティングに詳しく、実際に使って比べたものをリストにまとめられる方をお待ちしています。',
    wants: [
      '記事に署名と自己紹介、SNSリンクを掲載します',
      '原稿料は記事ごと。テーマの持ち込みも編集部からの依頼も可能です',
      'スペックや価格は編集部が確認するので、得意な部分だけ書いてください',
    ],
    cta: 'ライターとして参加する',
  },
  categoryListName: 'spaceA のカテゴリ',
  footerDisclaimer:
    'spaceA は選ぶための情報を届け、読者により多くの選択肢を提供します。当サイトの一部の情報は提携ブランドや関連団体と協力し、商品情報や第三者リンクの提供を受けています。ご利用の際は内容を十分にご検討ください。掲載情報は参考用です。',
  browse: 'spaceA を見る',
  footerNav: 'フッターリンク',
  privacy: 'プライバシーポリシー',
  terms: '利用規約',
  operatedBy: (company: string, reg: string) => `運営会社：${company}（統一番号 ${reg}）`,
  notFoundTitle: 'ページが見つかりません',
  notFoundBody: 'このページは削除されたか、日本語版がまだ用意されていない可能性があります。',
  backHome: 'ホームへ戻る',
  searchPlaceholder: '記事を検索...',
  editorName: 'カン',
  editorRole: 'コンテンツ編集',
  editorBio:
    '現在は AI ワークフロー開発エンジニア。以前は Instagram のライター、ジュエリー会社のマーケティングコピー編集を担当していました。注文する前にまず AI に聞き、タブを五つ六つ開いて一項目ずつ比べるタイプ。Threads で実際の利用者のレビューを読むのが好きです。',
  articleTypes: { recommendation: 'おすすめ', knowledge: 'ガイド' },
  nav: [
    { label: '人気記事', href: '/ja/popular' },
    { label: 'spaceA について', href: '/ja/about' },
    { label: '選定基準', href: '/ja/standards' },
    { label: 'お問い合わせ', href: '/ja/contact' },
  ],
  footerColumns: [
    {
      title: 'spaceA について',
      links: [
        { label: 'spaceA について', href: '/ja/about' },
        { label: '選定基準', href: '/ja/standards' },
        { label: '編集部の体制', href: '/ja/about#team' },
        { label: 'お問い合わせ', href: '/ja/contact' },
      ],
    },
    {
      title: 'お取引',
      links: [
        { label: '協業のご相談', href: '/ja/contact#form' },
        { label: '広告掲載', href: '/ja/contact#form' },
        { label: 'コンテンツ利用許諾', href: '/ja/contact#form' },
        { label: 'ライター募集', href: '/ja/contact?topic=join#form' },
      ],
    },
    {
      title: '規約とポリシー',
      links: [
        { label: '広告・提携の開示', href: '/ja/standards#disclosure' },
        { label: '訂正ポリシー', href: '/ja/standards#corrections' },
        { label: 'レビューの原則', href: '/ja/standards#limits' },
        { label: 'プライバシーポリシー', href: '/ja/privacy' },
        { label: '利用規約', href: '/ja/terms' },
      ],
    },
  ],
  onThisPage: 'このページの内容',
  popularTitle: '人気記事',
  popularIntro:
    '現在は公開日順に並べているので、最新のおすすめ記事とガイドが先に出てきます。実際の閲覧データを接続したあとは、読者の行動にもとづくランキングに切り替えます。',
  popularDescription:
    'spaceA の最新のおすすめ記事とナレッジ記事を公開日順に掲載しています。閲覧データを接続したあとは人気順のランキングに切り替わります。',
  popularPeriod: '集計期間：',
  popularAllTime: '全期間',
  ranges: { week: '今週', month: '今月', all: '全期間' },
  category: 'カテゴリ',
  popularEmpty: 'この期間にはまだ記事がありません',
  otherTopicsHint: 'カテゴリを開くと、そのテーマの記事をすべて見られます。',
  uncategorized: '未分類',
  search: '検索',
  searchResultsFor: (q: string) => `「${q}」の検索結果`,
  searchCount: (n: number) => `${n} 件の記事が見つかりました`,
  searchPrompt: 'キーワードを入力して検索してください',
  searchEmpty: '該当する記事がありません。他のキーワードをお試しください。',
  noArticles: 'まだ記事がありません。',
}

const ko: UIStrings = {
  home: '홈',
  siteTagline: '비교하고 결정하는 추천 글과 구매 가이드',
  siteDescription:
    'spaceA는 온라인의 실제 후기를 모아 여행·숙박, 뷰티, 맛집 등의 추천 글과 구매 가이드를 전합니다. 모든 글에 출처와 업데이트 날짜를 밝혀, 사기 전에 비교할 수 있습니다.',
  langMenu: '언어',
  mainNav: '주 메뉴',
  breadcrumbs: '탐색 경로',
  published: '발행',
  updated: '수정',
  readingTime: (min: number) => `약 ${min}분 분량`,
  disclosure:
    '이 글은 온라인에 공개된 게시물, 쇼핑몰과 예약 사이트 후기, 브랜드 공식 정보를 정리하고 편집부가 확인한 뒤 작성했습니다. 글 속 링크는 브랜드 공식 사이트나 판매 페이지로 바로 연결되며, 클릭이나 구매로 수익을 얻지 않습니다. 가격과 재고는 판매 페이지를 기준으로 확인해 주세요.',
  conclusionFirst: '핵심 결론',
  editorIntro: '편집자 소개',
  toc: '목차',
  faq: '자주 묻는 질문',
  provenance: '이 글을 쓴 방법',
  knowledgeDisclosure:
    '이 글은 정보성 콘텐츠로 광고나 협업 콘텐츠를 포함하지 않습니다. 앞으로 포함하게 되면 글 첫머리에 밝히겠습니다.',
  editorialPolicy: '편집 방침',
  readMore: '함께 읽기',
  editorFooter:
    '온라인에 공개된 논의와 후기를 모아 교차 확인한 뒤 추천을 쓰고, 정보마다 출처와 업데이트 날짜를 밝힙니다. 잘못된 내용을 발견하셨다면',
  contactUs: '알려주세요',
  aboutKnowledge: '정보성 콘텐츠 안내',
  aboutKnowledgeBody:
    '정보성 콘텐츠는 판단 기준과 관리 방법을 다루며 특정 제품을 지정하지 않습니다. 정리된 추천을 보시려면 추천 글을 확인하세요.',
  seeRecommendations: '추천 글 보기',
  sameCategory: '같은 카테고리 글',
  seeMoreOf: (name: string) => `${name} 더 보기`,
  otherTopics: '다른 주제 보기',
  otherCategories: '다른 카테고리',
  postCount: (n: number) => `총 ${n}건`,
  postCountShort: (n: number) => `${n}건`,
  categoryMetaDesc: (name: string) =>
    `spaceA의 ${name} 추천 글과 구매 가이드. 모든 글에 출처와 업데이트 날짜를 밝혀 비교하고 결정할 수 있습니다.`,
  categoryTitle: (name: string) => `${name} 추천 글과 구매 가이드`,
  categoryCollection: (name: string) => `${name} 추천 글`,
  categoryCollectionDesc: (name: string) => `spaceA ${name} 카테고리의 추천 글 목록`,
  categoryList: (name: string) => `${name} 글 목록`,
  articleTypeLabel: '글 유형',
  all: '전체',
  typeSummary: (parts: string) => `이 카테고리 구성은 ${parts}`,
  typeCount: (n: number, label: string) => `${label} ${n}건`,
  tagFilter: '주제로 좁히기',
  filtering: (n: number) => `필터 적용 중, 총 ${n}건`,
  clearFilter: '필터 해제',
  noPosts: '조건에 맞는 글이 없습니다. 다른 주제를 눌러보세요.',
  editorsPick: '편집자 추천',
  loadMore: '더 보기',
  loading: '불러오는 중...',
  heroTitle: ['선택을 간단하게,', '', '좋은 물건', '만 골라드립니다.'],
  heroSub: '인기 상품부터 생활 아이디어까지, 정말 살 만한 선택지를 빠르게 찾아드립니다.',
  heroTags: ['엄선 추천', '꼼꼼한 비교', '출처 표기'],
  heroCta: '인기 글 보기',
  heroExplore: '카테고리 둘러보기',
  pickTopics: '어떤 주제가 궁금하세요?',
  pickTopicsHint: '여러 개 고를 수 있고, 아래 섹션이 바로 걸러집니다',
  homeH2: 'spaceA 추천 글: 온라인의 실제 후기로 만드는 구매 가이드',
  homeH2Sub:
    '엄선한 추천 글로 값어치 있는 선택지를 찾아보세요. 모든 글에 출처와 업데이트 날짜를 밝힙니다.',
  filteringCategories: (n: number) => `필터 적용 중, ${n}개 카테고리 표시`,
  noCategories: '조건에 맞는 카테고리가 없습니다. 다른 주제를 눌러보세요.',
  viewAll: '전체 보기',
  howWePick: '고르는 방법',
  howWePickTitle: '온라인의 솔직한 목소리를 모아 편집부가 확인합니다',
  howWePickBody:
    '모든 제품을 직접 써봤다고 말하지 않습니다. spaceA는 커뮤니티, SNS, 쇼핑몰 후기, 전문 리뷰 같은 공개된 논의를 모아 반복해서 언급되는 장단점을 찾고, 공식과 판매처 정보와 대조한 뒤 정보마다 출처를 밝힙니다.',
  steps: [
    { n: '01', title: '후기 수집', body: '커뮤니티, SNS, 쇼핑몰 후기를 모아 각 모델이 몇 번 언급되고 평가가 어떻게 갈리는지 기록합니다.' },
    { n: '02', title: '교차 확인', body: '사양과 가격은 반드시 공식 페이지와 판매처에서 확인하며, 한 곳의 정보만으로는 싣지 않습니다.' },
    { n: '03', title: '출처 표기', body: '직접 테스트인지, 사용자 후기인지, 제조사 제공인지 본문에 밝히고 최종 업데이트 날짜를 함께 적습니다.' },
  ],
  popular: '인기 글',
  fullRanking: '전체 순위',
  featuredTopic: '편집부 특집',
  moreOf: (name: string) => `${name} 추천 더 보기`,
  featuredBody: (name: string) =>
    `고르는 법부터 비교하는 법까지, ${name} 관련 추천 글을 하나의 흐름으로 정리했습니다. 다 읽고 나면 무엇을 골라야 할지 알 수 있습니다.`,
  readTopic: '특집 읽기',
  join: {
    kicker: '전문가·달인 모집',
    title: '당신의 전문 지식을 추천 리스트로',
    body: 'spaceA는 각 분야의 전문가와 작가를 찾고 있습니다. 여행, 뷰티, 건강, 음식, 마케팅에 밝고 직접 써 보고 비교한 것을 리스트로 정리할 수 있다면 연락 주세요.',
    wants: [
      '기사에 이름과 소개, SNS 링크를 함께 싣습니다',
      '원고료는 기사 단위로 지급하며, 주제 제안과 편집부 의뢰 모두 가능합니다',
      '사양과 가격은 편집부가 확인하니 잘 아는 부분만 쓰시면 됩니다',
    ],
    cta: '작가로 참여하기',
  },
  categoryListName: 'spaceA 카테고리',
  footerDisclaimer:
    'spaceA는 고르는 데 필요한 정보를 제공해 독자에게 더 많은 선택지를 드립니다. 이 사이트의 일부 정보는 제휴 브랜드나 관련 기관과 협력해 제품 정보나 제3자 링크를 제공받습니다. 이용하실 때 충분히 검토해 주시고, 모든 정보는 참고용입니다.',
  browse: 'spaceA 둘러보기',
  footerNav: '푸터 링크',
  privacy: '개인정보처리방침',
  terms: '이용약관',
  operatedBy: (company: string, reg: string) => `운영사: ${company}(사업자번호 ${reg})`,
  notFoundTitle: '페이지를 찾을 수 없습니다',
  notFoundBody: '이 페이지는 삭제되었거나, 한국어판이 아직 준비되지 않았을 수 있습니다.',
  backHome: '홈으로',
  searchPlaceholder: '글 검색...',
  editorName: '캉',
  editorRole: '콘텐츠 에디터',
  editorBio:
    '현재 AI 워크플로 개발 엔지니어이고, 이전에는 인스타그램 글 작성자와 주얼리 회사 마케팅 카피 에디터로 일했습니다. 주문하기 전에 먼저 AI에게 물어보고, 탭을 대여섯 개 열어 항목별로 비교하는 편입니다. Threads에서 실제 사용자 후기를 읽는 걸 좋아합니다.',
  articleTypes: { recommendation: '추천 글', knowledge: '가이드' },
  nav: [
    { label: '인기 글', href: '/ko/popular' },
    { label: 'spaceA 소개', href: '/ko/about' },
    { label: '선정 기준', href: '/ko/standards' },
    { label: '문의하기', href: '/ko/contact' },
  ],
  footerColumns: [
    {
      title: 'spaceA 소개',
      links: [
        { label: 'spaceA 소개', href: '/ko/about' },
        { label: '선정 기준', href: '/ko/standards' },
        { label: '편집부 구성', href: '/ko/about#team' },
        { label: '문의하기', href: '/ko/contact' },
      ],
    },
    {
      title: '제휴와 협업',
      links: [
        { label: '제휴 문의', href: '/ko/contact#form' },
        { label: '광고 게재', href: '/ko/contact#form' },
        { label: '콘텐츠 이용 허락', href: '/ko/contact#form' },
        { label: '작가 모집', href: '/ko/contact?topic=join#form' },
      ],
    },
    {
      title: '약관과 정책',
      links: [
        { label: '광고·협업 고지', href: '/ko/standards#disclosure' },
        { label: '정정 정책', href: '/ko/standards#corrections' },
        { label: '리뷰 원칙', href: '/ko/standards#limits' },
        { label: '개인정보처리방침', href: '/ko/privacy' },
        { label: '이용약관', href: '/ko/terms' },
      ],
    },
  ],
  onThisPage: '이 페이지 목차',
  popularTitle: '인기 글',
  popularIntro:
    '지금은 발행일순으로 정렬해 최신 추천 글과 가이드를 먼저 보여드립니다. 실제 조회 데이터를 연결한 뒤에는 독자 행동을 반영한 순위로 바꿀 예정입니다.',
  popularDescription:
    'spaceA의 최신 추천 글과 가이드를 발행일순으로 정리했습니다. 조회 데이터가 연결되면 인기순 순위로 바뀝니다.',
  popularPeriod: '집계 기간: ',
  popularAllTime: '전체 기간',
  ranges: { week: '이번 주', month: '이번 달', all: '전체 기간' },
  category: '카테고리',
  popularEmpty: '이 기간에는 아직 글이 없습니다',
  otherTopicsHint: '카테고리를 열면 해당 주제의 모든 글을 볼 수 있습니다.',
  uncategorized: '미분류',
  search: '검색',
  searchResultsFor: (q: string) => `'${q}' 검색 결과`,
  searchCount: (n: number) => `${n}건을 찾았습니다`,
  searchPrompt: '검색어를 입력해 주세요',
  searchEmpty: '일치하는 글이 없습니다. 다른 검색어를 시도해 보세요.',
  noArticles: '아직 글이 없습니다.',
}

export const UI: Record<Lang, UIStrings> = { zh, en, ja, ko }

export function ui(lang: Lang): UIStrings {
  return UI[lang]
}

/** 文章類型（推薦文／知識分享）的顯示名稱：中文吃 WP taxonomy 的名字，英文換成字典裡的 */
export function articleTypeLabel(lang: Lang, type: { name: string; slug: string }) {
  return UI[lang].articleTypes[type.slug] ?? type.name
}

/**
 * 固定頁面（關於我們、推薦標準…）的 canonical 與 hreflang。
 * 這些頁每個語言都有，所以四個語言互指，x-default 給中文（主站）。
 * 文章頁與分類頁不能用這個：那些要先確認對照頁存在才輸出 hreflang。
 */
export function staticAlternates(lang: Lang, path: string) {
  // 首頁的路徑是 '/'，直接接前綴會變成 '/en/'，跟中文的 '/' 不一致
  const hrefOf = (l: Lang) => (path === '/' ? homeHref(l) : `${langPrefix(l)}${path}`)
  const languages = Object.fromEntries(LANGS.map((l) => [LANG_TAG[l], hrefOf(l)])) as Record<string, string>
  return {
    canonical: hrefOf(lang),
    languages: { ...languages, 'x-default': hrefOf('zh') },
  }
}
