// PM2.5 口罩推薦工具的資料：2026-11-17 post 1640 校稿時回各家官網對過的數字。
// 改價格、等級就改這裡；推薦理由只寫官網或公開來源查得到的事，不寫用後感。
// 文字欄位四語並列（zh／en／ja／ko），品牌名跟譯文卡片 h3 一致：
// 克微粒＝:dcMask（英文官網）、藍鷹牌＝Blue Eagle、中衛＝CSD、天天＝Everyday Mask；日文沿用中文原名。

import type { Lang } from '@/lib/i18n'

export type MaskType = 'disposable' | 'washable'
export type Grade = 'A' | 'B' | null // CNS 15980 等級；null = 官網只寫符合、沒標等級
export type Where = 'moto' | 'walk' | 'kitchen' | 'work' | 'alert'
export type Priority = 'grade' | 'cost' | 'breath' | 'look'
export type T = Record<Lang, string>

export interface MaskProduct {
  id: string // GA 事件用，不翻譯
  brand: T
  name: T
  url: string
  price: number // 定價（藍鷹官網沒標價，用 PChome 售價）
  count: number // 一盒幾片
  type: MaskType
  grade: Grade
  /** 一片可以戴幾天：拋棄式 1；可水洗照官網（克微粒 5～7 天取中間 6、Xpure 標示可洗 200 次） */
  wearDays: number
  wearLabel: T
  /** 依情境加分與推薦理由（理由要能對到官網或公開來源） */
  where: Partial<Record<Where, { score: number; why: T }>>
  breath?: { score: number; why: T }
  look?: { score: number; why: T }
  smallBox?: T // 有小盒裝，空污日才戴的人不容易囤到過期
  extraCert?: T // CNS 15980 以外的認證
  base: T // 沒有其他理由可寫時顯示的一句
}

const ONCE: T = { zh: '拋棄式，一天一片', en: 'Disposable, one a day', ja: '使い捨て、1 日 1 枚', ko: '일회용, 하루 한 장' }
const B13: T = { zh: 'B 級一片約 13 元', en: 'Grade B at about NT$13 a mask', ja: 'B 等級で 1 枚約 13 台湾ドル', ko: 'B 등급, 한 장에 약 13대만달러' }
const WEEK: T = { zh: '一片戴一週，少丟很多口罩', en: 'One mask lasts a week, far fewer masks thrown away', ja: '1 枚で 1 週間使え、捨てるマスクがぐっと減る', ko: '한 장으로 일주일, 버리는 마스크가 크게 줄어듦' }

export const PM25_MASKS: MaskProduct[] = [
  {
    id: 'dcmask',
    brand: { zh: '克微粒', en: ':dcMask', ja: '克微粒', ko: ':dcMask' },
    name: { zh: '奈米薄膜成人立體口罩', en: 'Nano-Membrane Adult 3D Mask', ja: 'ナノ膜大人用立体マスク', ko: '나노 멤브레인 성인용 입체 마스크' },
    url: 'https://dctpro.com/tw/facemask.php',
    price: 810, count: 6, type: 'washable', grade: 'A', wearDays: 6,
    extraCert: { zh: '歐盟 FFP2', en: 'EU FFP2', ja: 'EU FFP2', ko: 'EU FFP2' },
    base: { zh: 'A 級，一片可以戴一週', en: 'Grade A, one mask lasts a week', ja: 'A 等級、1 枚で 1 週間使える', ko: 'A 등급, 한 장으로 일주일 사용' },
    wearLabel: { zh: '每天水洗，5～7 天換', en: 'Wash daily, replace every 5–7 days', ja: '毎日洗って 5〜7 日で交換', ko: '매일 세탁, 5~7일마다 교체' },
    where: {
      kitchen: { score: 3, why: { zh: '有廚房油煙專用的職場款', en: 'Has a work model made for cooking fumes', ja: '台所の油煙専用の職場向けモデルがある', ko: '주방 기름 연기 전용 작업용 모델이 있음' } },
      work: { score: 3, why: { zh: '有研磨粉塵、化學氣膠專用的職場款', en: 'Has work models for grinding dust and chemical aerosols', ja: '研磨の粉じん・化学エアロゾル専用の職場向けモデルがある', ko: '연마 분진·화학 에어로졸 전용 작업용 모델이 있음' } },
      walk: { score: 1, why: WEEK },
      moto: { score: 1, why: WEEK },
    },
  },
  {
    id: 'xpure',
    brand: { zh: 'Xpure', en: 'Xpure', ja: 'Xpure', ko: 'Xpure' },
    name: { zh: '抗霾布織口罩 Elite G3', en: 'Anti-Haze Fabric Mask Elite G3', ja: '抗霾布マスク Elite G3', ko: '방진 패브릭 마스크 Elite G3' },
    url: 'https://xpure-tw.com/products/elite-g3',
    price: 590, count: 1, type: 'washable', grade: 'A', wearDays: 200,
    base: { zh: 'A 級，標示可洗 200 次以上', en: 'Grade A, rated for 200+ washes', ja: 'A 等級、200 回以上洗えると表示', ko: 'A 등급, 200회 이상 세탁 가능 표시' },
    wearLabel: { zh: '標示可水洗 200 次以上', en: 'Rated for 200+ washes', ja: '200 回以上洗えると表示', ko: '200회 이상 세탁 가능 표시' },
    where: { walk: { score: 1, why: { zh: '可洗 200 次，長期戴最省', en: 'Washable 200 times, cheapest over the long run', ja: '200 回洗えて、長く使うほど割安', ko: '200회 세탁 가능, 오래 쓸수록 가장 저렴' } } },
    breath: { score: 2, why: { zh: '內有隱形支架，吸氣時口罩不會貼到嘴上', en: 'A hidden frame keeps it off your mouth when you inhale', ja: '見えないフレームで、息を吸っても口に張り付かない', ko: '숨은 지지대가 있어 들숨에 입에 달라붙지 않음' } },
    look: { score: 3, why: { zh: '西裝表布，穿正裝也搭得起來', en: 'Suiting fabric that goes with office wear', ja: 'スーツ生地で、スーツ姿にも合う', ko: '정장 원단이라 정장 차림에도 어울림' } },
  },
  {
    id: 'haofa',
    brand: { zh: 'HAOFA', en: 'HAOFA', ja: 'HAOFA', ko: 'HAOFA' },
    name: { zh: '高階 PM2.5 防護口罩（氣密型）', en: 'Premium PM2.5 Protective Mask (Airtight)', ja: '高機能 PM2.5 防護マスク（気密タイプ）', ko: '프리미엄 PM2.5 보호 마스크(밀착형)' },
    url: 'https://www.haofa.com.tw/product/product&product_id=112',
    price: 390, count: 30, type: 'disposable', grade: 'B', wearDays: 1, wearLabel: ONCE, base: B13,
    where: {
      moto: { score: 3, why: { zh: '表布 UPF50+，騎車可以同時防曬', en: 'UPF50+ outer fabric doubles as sun protection on a scooter', ja: '表地が UPF50+ で、バイクでも日焼け対策ができる', ko: '겉감 UPF50+, 오토바이 탈 때 자외선도 차단' } },
      kitchen: { score: 1, why: { zh: '油性粒子過濾 99%', en: '99% filtration of oily particles', ja: '油性粒子ろ過 99%', ko: '유성 입자 여과 99%' } },
    },
    look: { score: 1, why: { zh: '霧黑、礫岩碳兩種深色', en: 'Two dark colors: matte black and gravel carbon', ja: 'マットブラックとグラベルカーボンの 2 色', ko: '매트 블랙, 그래블 카본 두 가지 어두운 색' } },
  },
  {
    id: 'blue-eagle',
    brand: { zh: '藍鷹牌', en: 'Blue Eagle', ja: '藍鷹牌', ko: 'Blue Eagle' },
    name: { zh: 'NP4DC 立體活性碳防霾口罩', en: 'NP4DC 3D Activated Carbon Anti-Haze Mask', ja: 'NP4DC 立体活性炭防霾マスク', ko: 'NP4DC 입체 활성탄 방진 마스크' },
    url: 'https://blueeagle-safety.com/Shop/np4dc-tw',
    price: 379, count: 25, type: 'disposable', grade: null, wearDays: 1, wearLabel: ONCE,
    base: { zh: '一片約 15 元，多一層活性碳', en: 'About NT$15 a mask, with an extra activated carbon layer', ja: '1 枚約 15 台湾ドル、活性炭層つき', ko: '한 장에 약 15대만달러, 활성탄층 추가' },
    where: {
      moto: { score: 2, why: { zh: '活性碳層吸附異味，排氣的臭味會少一些', en: 'The carbon layer absorbs odors, so exhaust smells less', ja: '活性炭層がにおいを吸着し、排気ガスのにおいが和らぐ', ko: '활성탄층이 냄새를 흡착해 배기가스 냄새가 줄어듦' } },
      work: { score: 1, why: { zh: '官網列的用途有清潔工作與工廠', en: 'The official site lists cleaning work and factories as uses', ja: '公式サイトの用途に清掃作業と工場がある', ko: '공식 사이트 용도에 청소 작업과 공장이 있음' } },
    },
    breath: { score: -2, why: { zh: '多一層活性碳，吸氣會比較吃力', en: 'The extra carbon layer makes inhaling a bit harder', ja: '活性炭層がある分、息を吸うのが少し重い', ko: '활성탄층이 하나 더 있어 숨쉬기가 조금 힘듦' } },
  },
  {
    id: 'everyday',
    brand: { zh: '天天', en: 'Everyday Mask', ja: '天天', ko: 'Everyday Mask' },
    name: { zh: 'PM2.5 防霾口罩 B 級', en: 'PM2.5 Anti-Haze Mask Grade B', ja: 'PM2.5 防霾マスク B 等級', ko: 'PM2.5 방진 마스크 B 등급' },
    url: 'https://www.shop8vd.com/products/everydaymask-pm25-new-classb30-1-2',
    price: 400, count: 30, type: 'disposable', grade: 'B', wearDays: 1, wearLabel: ONCE, base: B13,
    where: {
      alert: { score: 1, why: { zh: '包裝標示紅色警戒專用', en: 'Labeled for red-alert days', ja: 'パッケージに赤色警報用と表示', ko: '포장에 적색 경보용으로 표시' } },
      walk: { score: 1, why: B13 },
    },
    smallBox: { zh: '另有 12 入小盒', en: 'Also sold in a 12-mask box', ja: '12 枚入りの小箱もある', ko: '12장 소포장도 있음' },
  },
  {
    id: 'csd',
    brand: { zh: '中衛', en: 'CSD', ja: '中衛', ko: 'CSD' },
    name: { zh: 'PM2.5 防霾口罩 成人立體 3D', en: 'PM2.5 Anti-Haze Mask Adult 3D', ja: 'PM2.5 防霾マスク 大人用立体 3D', ko: 'PM2.5 방진 마스크 성인용 입체 3D' },
    url: 'https://www.csd.com.tw/anti-smog-mask',
    price: 360, count: 12, type: 'disposable', grade: 'B', wearDays: 1, wearLabel: ONCE,
    base: { zh: 'B 級，一盒 12 片不怕囤到過期', en: 'Grade B; a 12-mask box won’t sit around until it expires', ja: 'B 等級、1 箱 12 枚で期限切れになりにくい', ko: 'B 등급, 한 상자 12장이라 유통기한 걱정이 적음' },
    where: {},
    smallBox: { zh: '一盒 12 片', en: 'Only 12 masks per box', ja: '1 箱 12 枚', ko: '한 상자 12장' },
  },
]

/** 一週戴 d 天，一個月（4.3 週）約花多少；可水洗以「一片能戴的天數」攤提 */
export function monthlyCost(p: MaskProduct, daysPerWeek: number): number {
  const perWearDay = p.price / p.count / p.wearDays
  return Math.round(perWearDay * daysPerWeek * 4.3)
}
