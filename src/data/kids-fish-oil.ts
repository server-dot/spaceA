// 兒童魚油計算器的資料：每一格都是 2026-10-22 回各家官網對過的數字（post 1410 校稿時的清單）。
// 改價格或配方就改這裡；官網沒寫的留 null，計算器會照實顯示「官網未標示」。

export type Allergen = 'soy' | 'peanut'
export type Gelatin = 'pork' | 'beef' | null

export interface FishOilProduct {
  brand: string
  name: string
  url: string
  price: number // 定價，不寫特價
  count: number // 每罐／盒顆數
  dha: number | null // 每顆 DHA 毫克
  epa: number | null // 每顆 EPA 毫克
  minAge: number | null // 官網寫的最小年齡；null = 官網沒寫
  /** 依年齡回傳官網建議的每日顆數範圍 [最少, 最多] */
  perDay: (age: number) => [number, number]
  howTo: (age: number) => string
  chew: boolean // 可以咬破／咀嚼
  swallow: boolean // 可以整顆吞
  mix: boolean // 可以剪開或擠出來拌進食物
  allergens: Allergen[] // 魚類以外、官網標示的過敏原
  gelatin: Gelatin // 官網標示的膠囊明膠來源
}

export const KIDS_FISH_OIL: FishOilProduct[] = [
  {
    brand: '益比喜', name: '小晶明DHA兒童魚油', url: 'https://www.eatbliss.com.tw/SalePage/Index/12241697',
    price: 1480, count: 60, dha: 250, epa: 50, minAge: null,
    perDay: () => [1, 1], howTo: () => '直接吞，或剪開拌進食物',
    chew: true, swallow: true, mix: true, allergens: [], gelatin: null,
  },
  {
    brand: '悠活原力', name: '小悠活兒童魚油咀嚼軟膠囊', url: 'https://www.yohopower.tw/products/yoho-kids-fish-oil-chewable-20250905173252',
    price: 850, count: 30, dha: 275, epa: 57.8, minAge: 4,
    perDay: (a) => (a >= 12 ? [2, 2] : [1, 1]), howTo: () => '咬破或咀嚼到化開',
    chew: true, swallow: false, mix: false, allergens: [], gelatin: null,
  },
  {
    brand: '船井生醫', name: '兒童DHA純淨魚油', url: 'https://www.funaicare.com/item/funcare-aan',
    price: 1980, count: 30, dha: 213, epa: 5, minAge: 4,
    perDay: (a) => (a >= 12 ? [2, 2] : [1, 1]), howTo: () => '腸溶膠囊，整顆吞',
    chew: false, swallow: true, mix: false, allergens: [], gelatin: 'pork',
  },
  {
    brand: '大研生醫', name: '德國DHA 80%兒童魚油', url: 'https://www.daikenshop.com/product.php?code=4710255450364',
    price: 1500, count: 30, dha: 200, epa: null, minAge: null,
    perDay: () => [1, 1], howTo: () => '小顆軟膠囊，整顆吞',
    chew: false, swallow: true, mix: false, allergens: [], gelatin: null,
  },
  {
    brand: '孕哺兒', name: '小兒專用兒童魚油DHA', url: 'https://www.mamacare.com.tw/products/%E5%AD%95%E5%93%BA%E5%85%92%E5%B0%8F%E5%85%92%E5%B0%88%E7%94%A8-%E5%85%92%E7%AB%A5%E9%AD%9A%E6%B2%B9dha-%E5%92%80%E5%9A%BC%E5%B0%8F%E9%AD%9A%E7%90%83',
    price: 499, count: 30, dha: 165, epa: 10, minAge: 3,
    perDay: () => [1, 1], howTo: () => '咬破咀嚼，勿整顆吞',
    chew: true, swallow: false, mix: true, allergens: ['soy'], gelatin: null,
  },
  {
    brand: "BHK's", name: '兒童魚油DHA咀嚼軟膠囊', url: 'https://www.bhks.com.tw/product/detail/631568',
    price: 690, count: 60, dha: 142.5, epa: 28.5, minAge: null,
    perDay: (a) => (a >= 3 ? [2, 2] : [1, 1]), howTo: (a) => (a >= 3 ? '充分咀嚼' : '剪開食用'),
    chew: true, swallow: false, mix: true, allergens: ['soy', 'peanut'], gelatin: 'beef',
  },
  {
    brand: '卡蘿琳', name: '佩佩小魚油DHA', url: 'https://www.carloine.com.tw/SalePage/Index/11440910',
    price: 900, count: 30, dha: 125, epa: null, minAge: 2,
    perDay: (a) => (a >= 4 ? [1, 2] : [1, 1]), howTo: () => '直接咬破',
    chew: true, swallow: false, mix: false, allergens: ['soy'], gelatin: null,
  },
  {
    brand: '澳佳寶', name: '機伶小子魚油', url: 'https://www.blackmores.com.tw/SalePage/Index/7362028',
    price: 749, count: 30, dha: 120, epa: 180, minAge: null,
    perDay: () => [1, 1], howTo: (a) => (a >= 4 ? '咀嚼或整顆吞' : '刺破混進果汁或牛奶'),
    chew: true, swallow: true, mix: true, allergens: ['soy'], gelatin: null,
  },
  {
    brand: '藥師健生活', name: '兒童小魚油', url: 'https://www.phargoods.com/products/kids-fish-oil-1-pack',
    price: 850, count: 45, dha: null, epa: null, minAge: 2,
    perDay: () => [1, 2], howTo: () => '咀嚼軟膠囊',
    chew: true, swallow: false, mix: false, allergens: [], gelatin: 'beef',
  },
  {
    brand: '小兒利撒爾', name: '小魚球咀嚼式軟膠囊', url: 'https://www.risal.com.tw/SalePage/Index/3922763',
    price: 700, count: 60, dha: 66, epa: 100, minAge: 1,
    perDay: (a) => (a >= 6 ? [2, 2] : [1, 2]), howTo: () => '咀嚼，或擠在食物上',
    chew: true, swallow: false, mix: true, allergens: ['soy'], gelatin: null,
  },
]

export const FAO_WHO_URL = 'https://www.fao.org/4/i1953e/i1953e.pdf'

/** FAO／WHO 2010《Fats and fatty acids in human nutrition》第 27 頁表：兒童每日 EPA＋DHA 適當攝取量（毫克） */
export function dailyTarget(age: number): { low: number; high: number; label: string } {
  if (age < 4) return { low: 100, high: 150, label: '2～4 歲' }
  if (age < 6) return { low: 150, high: 200, label: '4～6 歲' }
  if (age < 10) return { low: 200, high: 250, label: '6～10 歲' }
  return { low: 250, high: 250, label: '10 歲起比照成人' }
}
