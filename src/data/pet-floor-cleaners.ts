// 寵物地板清潔劑選擇器的資料：2026-11-25 post 1676 校稿時對過各家商品頁的數字。
// 排序理由只寫商品頁查得到的成分與用法，不寫用後感。目前只有中文。

export type Pet = 'cat' | 'dog' | 'both'
export type Scent = 'none' | 'ok'
export type Need = 'urine' | 'food' | 'often'

export interface FloorCleaner {
  id: string // GA 事件用
  name: string
  url: string
  price: string
  dilution: string
  /** 一桶 10 公升水，一瓶可以拖幾次；null = 用瓶蓋計量、沒標毫升 */
  uses: string | null
  /** 有香味就寫是什麼味道；null = 無香 */
  scent: string | null
  dogOnly?: boolean
  /** 養貓時要留意的事 */
  catNote?: string
  /** 養貓時扣分：有精油 2、有香精或香氛 1 */
  catPenalty?: number
  need: Partial<Record<Need, { score: number; why: string }>>
  base: string
}

export const FLOOR_CLEANERS: FloorCleaner[] = [
  { id: 'baan', name: '貝恩寵物 抑菌去味地板清潔劑', url: 'https://www.baan.com.tw/products/baan-pet-decodorizing-floor-cleaner-1000ml', price: 'NT$700／1000ml', dilution: '1:100', uses: '10', scent: '橙花香', catNote: '拖完有橙花香，貓咪怕香味要留意', catPenalty: 1,
    need: { urine: { score: 3, why: '柿子萃取物除臭、氧化鋅抑菌' }, food: { score: 1, why: '胺基酸系界面活性劑，中性配方' } }, base: '清潔、抑菌、除臭一次完成' },
  { id: 'petangel', name: '毛天使 寵物專用地板清潔劑', url: 'https://www.petangel.com.tw/zh-TW/products/floorcleaner', price: 'NT$580／1000ml', dilution: '1:100', uses: '10', scent: '植物萃取的氣味', catNote: '含大西洋雪松，使用前請教獸醫', catPenalty: 2,
    need: { food: { score: 3, why: '脂肪酶可以分解口水和飼料的油脂' }, urine: { score: 1, why: '植物除臭成分' } }, base: '稀釋 1:30 也能擦寵物用品' },
  { id: 'camo', name: '卡默 CaMo 無香精地板清潔劑', url: 'https://www.camopet.com.tw/products/pet-floor-deodorizer-cleaner', price: 'NT$550／1000ml', dilution: '1:50', uses: '5', scent: null,
    need: { urine: { score: 2, why: '鋅離子除臭，不加香精' }, food: { score: 1, why: '胺基酸系加 APG 清潔成分' } }, base: '無香精，清潔成分溫和' },
  { id: 'fuchoice', name: '婦政司 一流酵淨地板清潔液（寵物）', url: 'https://www.ts6.com.tw/products/enzyme-floor-cleaner-pet-friendly', price: 'NT$320／500g', dilution: '2～3 瓶蓋加 5 公升水', uses: null, scent: '天竺葵精油', catNote: '懷孕、患有癲癇或嚴重心臟病的貓不建議使用', catPenalty: 2,
    need: { food: { score: 3, why: '蛋白質、澱粉、脂肪三種分解酵素' } }, base: '玻璃和桌面殘膠也能擦' },
  { id: 'pipper', name: 'PiPPER Standard 鳳梨酵素地板清潔劑', url: 'https://www.peibo.com.tw/products/pipper-floor-cleaner-for-pet-lovely-scent-700ml', price: 'NT$399／700ml', dilution: '約 1:200', uses: '14', scent: '寵物友善香精', catNote: '有加香精，貓咪怕香味要留意', catPenalty: 1,
    need: { urine: { score: 2, why: '鳳梨發酵液，用來清除尿漬' }, food: { score: 1, why: '難清的污漬可以用原液擦' }, often: { score: 2, why: '1:200 稀釋，免沖洗' } }, base: '商品頁列出全成分' },
  { id: 'nu4pet', name: '植淨毛孩 地板清潔酵素', url: 'https://www.nu4pet.com/Shop/Product/Product/273', price: 'NT$549／1000ml', dilution: '1:100', uses: '10', scent: null,
    need: { urine: { score: 3, why: '柿子單寧加竹子酵素除臭' }, food: { score: 1, why: 'pH 7.0，拖完不必沖洗' } }, base: '無色無味，不含茶樹和柑橘' },
  { id: 'furrykelp', name: '毛毛藻嚴選 不只除臭地板清潔液', url: 'https://www.furrykelp.com/products/floor-cleaner-1000ml', price: 'NT$550／1000ml', dilution: '10～20ml 加 10 公升水', uses: '50～100', scent: '玫瑰精油', catNote: '含玫瑰精油，使用前請教獸醫', catPenalty: 2,
    need: { often: { score: 3, why: '濃縮配方，一桶水只要 10～20ml' }, urine: { score: 1, why: '二氫檸檬酸銀抑菌' } }, base: '貓砂盆和外出籠也能擦' },
  { id: 'cenra', name: '毛毛好室 寵物滲透抗菌地板清潔劑', url: 'https://mall.cenrahealthcare.com/SalePage/Index/11049534', price: 'NT$660／1000ml', dilution: '1:1000', uses: '100', scent: '寵物友善香氛', catNote: '有香氛，貓咪怕香味要留意', catPenalty: 1,
    need: { often: { score: 3, why: '1:1000 稀釋，一桶水只要 10ml' }, urine: { score: 2, why: '標榜能清到磁磚縫裡的尿漬' } }, base: '拖完不用再拖第二次' },
  { id: 'odout', name: '臭味滾 狗地板清潔', url: 'https://www.odout.com/SalePage/Index/10820875', price: 'NT$600／1000ml', dilution: '1:200', uses: '20', scent: null, dogOnly: true,
    need: { urine: { score: 2, why: '標示可分解阿摩尼亞，無香精' }, often: { score: 2, why: '可加進掃地機器人水箱' } }, base: '成分三種，不含香精' },
  { id: 'muzuo', name: '木酢寵物達人 環境除臭液（原味）', url: 'https://muzuopet.com/product/detail/592736', price: 'NT$500 起／1L', dilution: '1:30～1:50', uses: '3～5', scent: '煙燻烏梅味', catNote: '養貓要選原味，橘油款不建議給貓用',
    need: { urine: { score: 3, why: '弱酸性木酢液，中和尿騷味裡的氨' } }, base: '原味只有木酢原液和山梨酸鉀' },
]
