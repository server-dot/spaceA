export interface RankedArticle {
  cat: string
  catSlug: string
  date: string
  title: string
  excerpt: string
  href: string
}

export const RANKED_ARTICLES: RankedArticle[] = [
  {
    cat: '3C 數位',
    catSlug: '3c',
    date: '2025年3月14日',
    title: '2025 十大無線耳機推薦，通勤與運動都適用',
    excerpt: '從音質、降噪到續航，我們實測十款熱門機種，整理出各種使用情境下最值得入手的選擇。',
    href: '/3c/wireless-earbuds',
  },
  {
    cat: '健康醫療',
    catSlug: 'health',
    date: '2025年1月5日',
    title: '成人健檢怎麼選？四種常見方案比較',
    excerpt: '基礎、進階、影像與癌症篩檢方案差在哪裡，依年齡與家族病史該怎麼挑。',
    href: '/health/health-check',
  },
  {
    cat: '美食餐廳',
    catSlug: 'food',
    date: '2025年2月28日',
    title: '高雄早午餐精選：六家值得專程一訪的店',
    excerpt: '從老宅咖啡到港式茶點，我們挑出六家餐點穩定、環境舒適的早午餐，週末不踩雷。',
    href: '/food/kaohsiung-brunch',
  },
  {
    cat: '寵物生活',
    catSlug: 'pets',
    date: '2025年1月19日',
    title: '第一次養貓要準備什麼？新手用品清單一次看',
    excerpt: '貓砂、飼料、健康檢查與結紮費用，開銷與時程一次算給你看，避免臨時手忙腳亂。',
    href: '/pets/first-cat',
  },
  {
    cat: '教育學習',
    catSlug: 'education',
    date: '2024年12月22日',
    title: '線上英文課程推薦：五個平台實際上過的心得',
    excerpt: '師資、課程彈性與價格，我們各上滿一個月後的真實評價。',
    href: '/education/online-course',
  },
  {
    cat: '寵物生活',
    catSlug: 'pets',
    date: '2024年12月30日',
    title: '寵物保險值不值得保？三家方案條款比較',
    excerpt: '理賠上限、等待期與既有疾病排除條款，是三家方案差距最大的地方。',
    href: '/pets/pet-insurance',
  },
  {
    cat: '3C 數位',
    catSlug: '3c',
    date: '2024年12月12日',
    title: '掃地機器人一年後心得：值得的與後悔的',
    excerpt: '基站清洗與耗材費用，是購買時最容易低估的兩件事。',
    href: '/3c/robot-vacuum',
  },
  {
    cat: '教育學習',
    catSlug: 'education',
    date: '2024年11月26日',
    title: '成人英文自學工具比較：APP 與家教怎麼搭',
    excerpt: '自學工具負責累積輸入，家教負責矯正輸出，兩者的比例決定進度。',
    href: '/education/english-tools',
  },
  {
    cat: '美食餐廳',
    catSlug: 'food',
    date: '2024年11月8日',
    title: '台南住宿推薦：五間走路可逛老城區的旅館',
    excerpt: '房型、早餐與步行範圍一起看，才知道哪一間真的方便。',
    href: '/food/tainan-stay',
  },
  {
    cat: '健康醫療',
    catSlug: 'health',
    date: '2024年10月22日',
    title: '血壓計怎麼挑？手臂式與手腕式實測差異',
    excerpt: '手腕式方便但受姿勢影響大，長期追蹤建議以手臂式為主。',
    href: '/health/blood-pressure',
  },
]

export const RANGES = [
  { key: 'week', label: '本週', range: '2026年8月17日 – 8月23日' },
  { key: 'month', label: '本月', range: '2026年8月1日 – 8月27日' },
  { key: 'all', label: '總排行', range: '全站累計' },
] as const

export type RangeKey = (typeof RANGES)[number]['key']

export const CATEGORY_FILTERS = ['全部', '3C 數位', '美食餐廳', '健康醫療', '寵物生活', '教育學習']

export const POPULAR_PAGE_DESCRIPTION =
  'spaceA 本週閱讀量最高的推薦文章排行，依實際閱讀數據排序，每週一更新。'
