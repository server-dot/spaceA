// 葉黃素換算器的資料：每一格都是 2026-10-28 回各家官網對過的數字（post 1471 校稿時的清單）。
// 改價格或配方就改這裡；官網沒寫的留 null，換算器會照實顯示「官網未標示」。

/** free = 標示游離型；ester = 標示酯化型；none = 官網沒寫型態 */
export type LuteinForm = 'free' | 'ester' | 'none'

export interface LuteinProduct {
  brand: string
  name: string
  url: string
  price: number // 定價，不寫特價
  count: number // 每盒顆數／包數／瓶數
  unit: string // 顆、粒、錠、包、瓶
  mg: number | null // 每單位標示的葉黃素毫克數（酯化型就是葉黃素酯的重量）
  form: LuteinForm
  /** 酯化型官網自己換算過的葉黃素毫克數（每單位）；有寫就用官網的，不套換算係數 */
  luteinMg?: number
  perDay: number | null // 官網建議每日幾單位；null = 官網沒寫
  /** 英韓版顯示的品牌名，照譯文卡片 h3；日文照譯文慣例用中文原名 */
  names: { en: string; ko: string }
}

/** 酯化型換回游離型的係數：葉黃素 568.9 ÷ 葉黃素二棕櫚酸酯 1045.7 */
export const ESTER_FACTOR = 0.54

/** 衛福部每日上限（膠囊錠狀，或以金盞花／萬壽菊萃取為原料的產品），以 lutein 總含量計 */
export const DAILY_LIMIT = 30

/** 食品原料金盞草及萬壽菊之使用限制（113.07.11 公告） */
export const LUTEIN_LIMIT_URL = 'https://consumer.fda.gov.tw/Food/MaterialDetail.aspx?nodeID=160&id=16679'

export const LUTEIN: LuteinProduct[] = [
  {
    brand: '益比喜', name: '盯晶王金盞花葉黃素飲', url: 'https://www.eatbliss.com.tw/SalePage/Index/11910130',
    price: 1480, count: 8, unit: '包', mg: 28, form: 'free', perDay: 1, names: { en: 'EatBLISS', ko: 'EatBLISS' },
  },
  {
    brand: '大研生醫', name: '視易適葉黃素', url: 'https://www.daikenshop.com/product.php?code=0000000000028',
    price: 1980, count: 30, unit: '粒', mg: 10, form: 'free', perDay: 1, names: { en: 'Daiken Biotech', ko: 'Daiken' },
  },
  {
    brand: '營養師輕食', name: '我的視角金盞花葉黃素', url: 'https://www.dietician.com.tw/products/item/1021-lutein.html',
    price: 1880, count: 60, unit: '顆', mg: 5, form: 'free', perDay: 2, names: { en: 'Dietician Light Meals', ko: '영양사 라이트밀' },
  },
  {
    brand: '普瑞登', name: '游離型葉黃素 20 毫克', url: 'https://www.puritantw.com/products/free-lutein-20mg-120-softgels',
    price: 1459, count: 120, unit: '顆', mg: 20, form: 'free', perDay: 1, names: { en: "Puritan's Pride", ko: "Puritan's Pride" },
  },
  {
    brand: '船井生醫', name: '高單位葉黃素EX', url: 'https://www.funaicare.com/item/funcare-aau',
    price: 1580, count: 30, unit: '顆', mg: 30, form: 'free', perDay: 1, names: { en: 'Funai Biotech', ko: '후나이' },
  },
  {
    brand: '天地合補', name: '葉黃素功能飲', url: 'https://mall.sfworldwide.com/products/healthdrink-lutein-tdhb-4297',
    price: 1099, count: 18, unit: '瓶', mg: 8, form: 'free', perDay: null, names: { en: 'Tian Di He Bu', ko: '천지합보' },
  },
  {
    brand: '悠活原力', name: '金盞花萃取葉黃素＋蝦紅素', url: 'https://www.yohopower.tw/products/floraglo-lutein-astalif-astaxanthin-soft-capsule',
    price: 1380, count: 30, unit: '粒', mg: 30, form: 'free', perDay: 1, names: { en: 'Yoho Power', ko: 'YohoPower' },
  },
  {
    brand: '白蘭氏', name: '晶研全方位葉黃素錠EX', url: 'https://wellness.suntory.com.tw/brands/product/goods_detail?goods_id=BR0003',
    price: 1980, count: 60, unit: '錠', mg: 2.5, form: 'free', perDay: 2, names: { en: "Brand's", ko: '백란시' },
  },
  {
    brand: 'DHC', name: '金盞花萃取物葉黃素', url: 'https://www.27662000.com.tw/products/dhc-marigold-extract-lutein',
    price: 490, count: 30, unit: '粒', mg: 16, form: 'free', perDay: 1, names: { en: 'DHC', ko: 'DHC' },
  },
  {
    brand: '三多', name: '金盞花萃取物(含葉黃素)複方軟膠囊', url: 'https://www.sentosa.com.tw/products/marigold-lutein-ext-complex-soft-capsule-100-capsulesbox',
    price: 950, count: 100, unit: '粒', mg: 30, form: 'ester', luteinMg: 15, perDay: 1, names: { en: 'Sentosa', ko: '산토' },
  },
]
