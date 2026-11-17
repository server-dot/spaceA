// PM2.5 口罩推薦工具的資料：2026-11-17 post 1640 校稿時回各家官網對過的數字。
// 改價格、等級就改這裡；推薦理由只寫官網或公開來源查得到的事，不寫用後感。

export type MaskType = 'disposable' | 'washable'
export type Grade = 'A' | 'B' | null // CNS 15980 等級；null = 官網只寫符合、沒標等級
export type Where = 'moto' | 'walk' | 'kitchen' | 'work' | 'alert'
export type Priority = 'grade' | 'cost' | 'breath' | 'look'

export interface MaskProduct {
  brand: string
  name: string
  url: string
  price: number // 定價（官網沒標價的用通路售價，見 priceNote）
  priceNote?: string
  count: number // 一盒幾片
  type: MaskType
  grade: Grade
  /** 一片可以戴幾天：拋棄式 1；可水洗照官網（克微粒 5～7 天取中間 6、Xpure 標示可洗 200 次） */
  wearDays: number
  wearLabel: string
  /** 依情境加分與推薦理由（理由要能對到官網或公開來源） */
  where: Partial<Record<Where, { score: number; why: string }>>
  breath?: { score: number; why: string }
  look?: { score: number; why: string }
  smallBox?: string // 有小盒裝，空污日才戴的人不容易囤到過期
  extraCert?: string // CNS 15980 以外的認證
  base: string // 沒有其他理由可寫時顯示的一句
}

export const PM25_MASKS: MaskProduct[] = [
  {
    brand: '克微粒', name: '奈米薄膜成人立體口罩', url: 'https://dctpro.com/tw/facemask.php',
    price: 810, count: 6, type: 'washable', grade: 'A', extraCert: '歐盟 FFP2', base: 'A 級，一片可以戴一週', wearDays: 6, wearLabel: '每天水洗，5～7 天換',
    where: {
      kitchen: { score: 3, why: '有廚房油煙專用的職場款' },
      work: { score: 3, why: '有研磨粉塵、化學氣膠專用的職場款' },
      walk: { score: 1, why: '一片戴一週，少丟很多口罩' },
      moto: { score: 1, why: '一片戴一週，少丟很多口罩' },
    },
  },
  {
    brand: 'Xpure', name: '抗霾布織口罩 Elite G3', url: 'https://xpure-tw.com/products/elite-g3',
    price: 590, count: 1, type: 'washable', grade: 'A', base: 'A 級，標示可洗 200 次以上', wearDays: 200, wearLabel: '標示可水洗 200 次以上',
    where: { walk: { score: 1, why: '可洗 200 次，長期戴最省' } },
    breath: { score: 2, why: '內有隱形支架，吸氣時口罩不會貼到嘴上' },
    look: { score: 3, why: '西裝表布，穿正裝也搭得起來' },
  },
  {
    brand: 'HAOFA', name: '高階 PM2.5 防護口罩（氣密型）', url: 'https://www.haofa.com.tw/product/product&product_id=112',
    price: 390, count: 30, type: 'disposable', grade: 'B', base: 'B 級一片約 13 元', wearDays: 1, wearLabel: '拋棄式，一天一片',
    where: {
      moto: { score: 3, why: '表布 UPF50+，騎車可以同時防曬' },
      kitchen: { score: 1, why: '油性粒子過濾 99%' },
    },
    look: { score: 1, why: '霧黑、礫岩碳兩種深色' },
  },
  {
    brand: '藍鷹牌', name: 'NP4DC 立體活性碳防霾口罩', url: 'https://blueeagle-safety.com/Shop/np4dc-tw',
    price: 379, priceNote: 'PChome 售價', count: 25, type: 'disposable', grade: null, base: '一片約 15 元，多一層活性碳', wearDays: 1, wearLabel: '拋棄式，一天一片',
    where: {
      moto: { score: 2, why: '活性碳層吸附異味，排氣的臭味會少一些' },
      work: { score: 1, why: '官網列的用途有清潔工作與工廠' },
    },
    breath: { score: -2, why: '多一層活性碳，吸氣會比較吃力' },
  },
  {
    brand: '天天', name: 'PM2.5 防霾口罩 B 級', url: 'https://www.shop8vd.com/products/everydaymask-pm25-new-classb30-1-2',
    price: 400, count: 30, type: 'disposable', grade: 'B', base: 'B 級一片約 13 元', wearDays: 1, wearLabel: '拋棄式，一天一片',
    where: { alert: { score: 1, why: '包裝標示紅色警戒專用' }, walk: { score: 1, why: 'B 級一片約 13 元' } },
    smallBox: '另有 12 入小盒',
  },
  {
    brand: '中衛', name: 'PM2.5 防霾口罩 成人立體 3D', url: 'https://www.csd.com.tw/anti-smog-mask',
    price: 360, count: 12, type: 'disposable', grade: 'B', base: 'B 級，一盒 12 片不怕囤到過期', wearDays: 1, wearLabel: '拋棄式，一天一片',
    where: {},
    smallBox: '一盒 12 片',
  },
]

/** 一週戴 d 天，一個月（4.3 週）約花多少；可水洗以「一片能戴的天數」攤提 */
export function monthlyCost(p: MaskProduct, daysPerWeek: number): number {
  const perWearDay = p.price / p.count / p.wearDays
  return Math.round(perWearDay * daysPerWeek * 4.3)
}
