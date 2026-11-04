// 餐椅座高篩選工具的資料：每一格都是 2026-11-02 回各家官網對過的數字（post 1591 校稿時的清單）。
// 改價格或尺寸就改這裡；官網沒寫座高的 seats 留空陣列，工具會照實顯示「官網未標示」。

export interface ChairSeat {
  /** 座高（公分） */
  h: number
  /** 同一款有多種座高時的選項名（有情門木座／布座…）；只有一種就省略 */
  label?: string
}

export interface DiningChair {
  brand: string
  name: string
  url: string
  /** 卡片上的定價文字（不寫特價）；官網沒公開就寫需詢價 */
  priceText: string
  /** 排序用的最低定價；需詢價為 null */
  price: number | null
  seats: ChairSeat[]
  /** 官網註明的尺寸誤差（公分），沒寫為 null */
  tolerance: number | null
}

/** 木頭仁〈書桌、餐桌多高才對〉：桌面減座面抓 27～30 公分 */
export const HEIGHT_GAP = { min: 27, max: 30 }
export const HEIGHT_GAP_SOURCE = 'https://woodenren.com/furniture-dimensions-table-chair-height-guide/'

/**
 * 依身高換算（SIDIZ〈桌椅高度公式計算〉，日本家具業者也用同一組）：
 * 座高 = 身高 × 0.25 − 1；桌椅高差 = 身高 × 0.183 − 1。原本是書桌椅用的，套到餐桌只拿來微調個人差異。
 */
export const BODY_FORMULA = { seat: (h: number) => h * 0.25 - 1, gap: (h: number) => h * 0.183 - 1 }
export const BODY_FORMULA_SOURCE = 'https://www.sidiz.com.tw/blogs/news/desk-chair-height-calculator'
/** 填身高時，高差區間抓公式值上下 1.5 公分（跟 27～30 一樣寬 3 公分） */
export const BODY_GAP_SPREAD = 1.5

export const DINING_CHAIRS: DiningChair[] = [
  {
    brand: '原沐製材所', name: '拾光餐椅', url: 'https://www.woodfactorytc.com/product/%e6%8b%be%e5%85%89%e9%a4%90%e6%a4%85/',
    priceText: 'NT$6,800', price: 6800, seats: [{ h: 45.5 }], tolerance: null,
  },
  {
    brand: '有情門', name: '卡樂瑞單椅', url: 'https://www.twucm.com/products/color-chair',
    priceText: '木座 NT$4,680／布座 NT$5,280／皮座 NT$9,280', price: 4680,
    seats: [
      { h: 45, label: '木座' }, { h: 42.5, label: '木座' }, { h: 40, label: '木座' },
      { h: 48, label: '布座／皮座' }, { h: 45.5, label: '布座／皮座' }, { h: 43, label: '布座／皮座' },
    ],
    tolerance: null,
  },
  {
    brand: '優渥實木', name: '小王子實木餐椅', url: 'https://www.uwood.com.tw/product.php?id=439',
    priceText: '需詢價', price: null, seats: [{ h: 45 }], tolerance: null,
  },
  {
    brand: 'ALOT Living', name: '飛驒の匠工坊 050 餐椅', url: 'https://alot.com.tw/collections/chair/products/takumi-chair-050',
    priceText: 'NT$32,300 起', price: 32300, seats: [{ h: 42 }], tolerance: null,
  },
  {
    brand: '原木狂人', name: '籮筐椅', url: 'https://www.woodenmania.com/productname-120-product181',
    priceText: '需詢價', price: null, seats: [{ h: 44 }], tolerance: null,
  },
  {
    brand: 'Mountain Living', name: 'Civil 單椅', url: 'https://www.mountainliving.com.tw/dining-chair/civ260t/',
    priceText: 'NT$11,500 起', price: 11500, seats: [], tolerance: 2,
  },
  {
    brand: '無印良品', name: '木製圓椅／橡木', url: 'https://shop.muji.tw/SalePage/Index/8912410',
    priceText: 'NT$4,990', price: 4990, seats: [{ h: 42 }], tolerance: null,
  },
  {
    brand: '橙家居', name: '健康實木餐椅 A 款', url: 'https://www.chen-jiao.com.tw/products/jk-m2121',
    priceText: 'NT$5,300', price: 5300, seats: [{ h: 46 }], tolerance: 3,
  },
  {
    brand: 'UMU 有木', name: 'SHIGIYAMA 橡木布餐椅', url: 'https://www.umu.com.tw/products/wood-dining-chair-shigiyama-eke',
    priceText: 'NT$11,900', price: 11900, seats: [{ h: 44 }], tolerance: null,
  },
]
