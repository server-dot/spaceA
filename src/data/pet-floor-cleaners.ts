// 寵物地板清潔劑選擇器的資料：2026-11-25 post 1676 校稿時對過各家商品頁的數字。
// 排序理由只寫商品頁查得到的成分與用法，不寫用後感。文字欄位四語並列，品牌名跟譯文卡片 h3 一致。

import type { Lang } from '@/lib/i18n'

export type Pet = 'cat' | 'dog' | 'both'
export type Scent = 'none' | 'ok'
export type T = Record<Lang, string>
export type Need = 'urine' | 'food' | 'often'

export interface FloorCleaner {
  id: string // GA 事件用
  name: T
  url: string
  price: T
  dilution: T
  /** 一桶 10 公升水，一瓶可以拖幾次；null = 用瓶蓋計量、沒標毫升 */
  uses: T | null
  /** 有香味就寫是什麼味道；null = 無香 */
  scent: T | null
  dogOnly?: boolean
  /** 養貓時要留意的事 */
  catNote?: T
  /** 養貓時扣分：有精油 2、有香精或香氛 1 */
  catPenalty?: number
  need: Partial<Record<Need, { score: number; why: T }>>
  base: T
}

/** 四語寫法相同（數字、比例）；～ 在英日韓換成各自慣用的符號 */
const same = (v: string): T => ({ zh: v.replace('/', '／'), en: v.replace('／', '/').replaceAll('～', '–'), ja: v.replace('／', '/').replaceAll('～', '〜'), ko: v.replace('／', '/').replaceAll('～', '~') })

export const FLOOR_CLEANERS: FloorCleaner[] = [
  { id: 'baan', name: { zh: '貝恩寵物 抑菌去味地板清潔劑', en: 'Baan Pets Antibacterial Deodorizing Floor Cleaner', ja: '貝恩 抗菌消臭床用洗剤', ko: 'Baan Pets 항균 탈취 바닥 세정제' }, url: 'https://www.baan.com.tw/products/baan-pet-decodorizing-floor-cleaner-1000ml', price: same('NT$700/1000ml'), dilution: same('1:100'), uses: same('10'), scent: { zh: '橙花香', en: 'orange blossom scent', ja: 'オレンジの花の香り', ko: '오렌지꽃 향' }, catNote: { zh: '拖完有橙花香，貓咪怕香味要留意', en: 'Leaves an orange blossom scent; take note if your cat dislikes scent', ja: '拭いたあとオレンジの花の香りが残る。香りが苦手な猫は注意', ko: '닦은 뒤 오렌지꽃 향이 남으니 향을 싫어하는 고양이는 주의' }, catPenalty: 1,
    need: { urine: { score: 3, why: { zh: '柿子萃取物除臭、氧化鋅抑菌', en: 'Persimmon extract deodorizes, zinc oxide inhibits bacteria', ja: '柿エキスで消臭、酸化亜鉛で抗菌', ko: '감 추출물로 탈취, 산화아연으로 항균' } }, food: { score: 1, why: { zh: '胺基酸系界面活性劑，中性配方', en: 'Amino acid surfactant, neutral formula', ja: 'アミノ酸系界面活性剤、中性処方', ko: '아미노산계 계면활성제, 중성' } } }, base: { zh: '清潔、抑菌、除臭一次完成', en: 'Cleans, inhibits bacteria and deodorizes in one', ja: '洗浄・抗菌・消臭を 1 本で', ko: '세정·항균·탈취를 한 번에' } },
  { id: 'petangel', name: { zh: '毛天使 寵物專用地板清潔劑', en: 'PetAngel Pet Floor Cleaner', ja: '毛天使 ペット用床用洗剤', ko: 'PetAngel 반려동물 바닥 세정제' }, url: 'https://www.petangel.com.tw/zh-TW/products/floorcleaner', price: same('NT$580/1000ml'), dilution: same('1:100'), uses: same('10'), scent: { zh: '植物萃取的氣味', en: 'a plant extract scent', ja: '植物エキスの香り', ko: '식물 추출물 향' }, catNote: { zh: '含大西洋雪松，使用前請教獸醫', en: 'Contains Atlas cedarwood; ask your vet before use', ja: 'アトラスシダー入り。使う前に獣医師に相談', ko: '아틀라스 시더우드 함유, 사용 전 수의사와 상담' }, catPenalty: 2,
    need: { food: { score: 3, why: { zh: '脂肪酶可以分解口水和飼料的油脂', en: 'Lipase breaks down grease from saliva and pet food', ja: 'リパーゼがよだれやフードの油分を分解', ko: '리파아제가 침과 사료의 기름을 분해' } }, urine: { score: 1, why: { zh: '植物除臭成分', en: 'Plant-based deodorizing ingredients', ja: '植物由来の消臭成分', ko: '식물성 탈취 성분' } } }, base: { zh: '稀釋 1:30 也能擦寵物用品', en: 'At 1:30 it also wipes pet items', ja: '1:30 ならペット用品も拭ける', ko: '1:30이면 반려동물 용품도 닦을 수 있음' } },
  { id: 'camo', name: { zh: '卡默 CaMo 無香精地板清潔劑', en: 'CaMo Fragrance-Free Floor Cleaner', ja: 'CaMo 無香料床用洗剤', ko: 'CaMo 무향료 바닥 세정제' }, url: 'https://www.camopet.com.tw/products/pet-floor-deodorizer-cleaner', price: same('NT$550/1000ml'), dilution: same('1:50'), uses: same('5'), scent: null,
    need: { urine: { score: 2, why: { zh: '鋅離子除臭，不加香精', en: 'Deodorizes with zinc ions, no fragrance', ja: '亜鉛イオンで消臭、香料なし', ko: '아연 이온 탈취, 향료 없음' } }, food: { score: 1, why: { zh: '胺基酸系加 APG 清潔成分', en: 'Amino acid and APG cleansers', ja: 'アミノ酸系と APG の洗浄成分', ko: '아미노산계와 APG 세정 성분' } } }, base: { zh: '無香精，清潔成分溫和', en: 'Fragrance-free with mild cleansers', ja: '無香料で洗浄成分が穏やか', ko: '무향료, 순한 세정 성분' } },
  { id: 'fuchoice', name: { zh: '婦政司 一流酵淨地板清潔液（寵物）', en: 'Fu Choice Enzyme Floor Cleaner (Pet)', ja: '婦政司 酵素床用洗剤（ペット用）', ko: 'Fu Choice 효소 바닥 세정제(반려동물용)' }, url: 'https://www.ts6.com.tw/products/enzyme-floor-cleaner-pet-friendly', price: same('NT$320/500g'), dilution: { zh: '2～3 瓶蓋加 5 公升水', en: '2–3 caps in 5 liters of water', ja: 'キャップ 2〜3 杯に水 5 リットル', ko: '뚜껑 2~3컵에 물 5리터' }, uses: null, scent: { zh: '天竺葵精油', en: 'geranium essential oil', ja: 'ゼラニウム精油', ko: '제라늄 에센셜 오일' }, catNote: { zh: '懷孕、患有癲癇或嚴重心臟病的貓不建議使用', en: 'Not recommended for cats that are pregnant or have epilepsy or serious heart disease', ja: '妊娠中、てんかんや重い心臓病のある猫には推奨されない', ko: '임신했거나 뇌전증·심한 심장병이 있는 고양이에게는 권장하지 않음' }, catPenalty: 2,
    need: { food: { score: 3, why: { zh: '蛋白質、澱粉、脂肪三種分解酵素', en: 'Protease, amylase and lipase', ja: 'プロテアーゼ・アミラーゼ・リパーゼの 3 種', ko: '단백질·전분·지방 분해 효소 세 가지' } } }, base: { zh: '玻璃和桌面殘膠也能擦', en: 'Also wipes glue residue off glass and tabletops', ja: 'ガラスやテーブルののり残りも拭ける', ko: '유리와 탁자의 접착제 자국도 닦을 수 있음' } },
  { id: 'pipper', name: { zh: 'PiPPER Standard 鳳梨酵素地板清潔劑', en: 'PiPPER Standard Pineapple Enzyme Floor Cleaner', ja: 'PiPPER Standard パイナップル酵素床用洗剤', ko: 'PiPPER Standard 파인애플 효소 바닥 세정제' }, url: 'https://www.peibo.com.tw/products/pipper-floor-cleaner-for-pet-lovely-scent-700ml', price: same('NT$399/700ml'), dilution: { zh: '約 1:200', en: 'About 1:200', ja: '約 1:200', ko: '약 1:200' }, uses: same('14'), scent: { zh: '寵物友善香精', en: 'pet-friendly fragrance', ja: 'ペットに配慮した香料', ko: '반려동물 친화 향료' }, catNote: { zh: '有加香精，貓咪怕香味要留意', en: 'Contains fragrance; take note if your cat dislikes scent', ja: '香料入り。香りが苦手な猫は注意', ko: '향료가 들어 있으니 향을 싫어하는 고양이는 주의' }, catPenalty: 1,
    need: { urine: { score: 2, why: { zh: '鳳梨發酵液，用來清除尿漬', en: 'Pineapple ferment, used on urine stains', ja: 'パイナップル発酵液で尿のしみを落とす', ko: '파인애플 발효액으로 소변 얼룩 제거' } }, food: { score: 1, why: { zh: '難清的污漬可以用原液擦', en: 'Wipe stubborn stains with it undiluted', ja: '落ちにくい汚れは原液で拭ける', ko: '잘 안 지워지는 때는 원액으로 닦을 수 있음' } }, often: { score: 2, why: { zh: '1:200 稀釋，免沖洗', en: '1:200 dilution, no rinsing', ja: '1:200 に希釈、すすぎ不要', ko: '1:200 희석, 헹굼 불필요' } } }, base: { zh: '商品頁列出全成分', en: 'Full ingredients on the product page', ja: '商品ページに全成分を掲載', ko: '제품 페이지에 전 성분 공개' } },
  { id: 'nu4pet', name: { zh: '植淨毛孩 地板清潔酵素', en: 'nu4PET Enzyme Floor Cleaner', ja: 'nu4PET 床用酵素洗剤', ko: 'nu4PET 바닥 세정 효소' }, url: 'https://www.nu4pet.com/Shop/Product/Product/273', price: same('NT$549/1000ml'), dilution: same('1:100'), uses: same('10'), scent: null,
    need: { urine: { score: 3, why: { zh: '柿子單寧加竹子酵素除臭', en: 'Deodorizes with persimmon tannins and bamboo enzyme', ja: '柿タンニンと竹酵素で消臭', ko: '감 타닌과 대나무 효소로 탈취' } }, food: { score: 1, why: { zh: 'pH 7.0，拖完不必沖洗', en: 'pH 7.0, no rinsing', ja: 'pH 7.0、すすぎ不要', ko: 'pH 7.0, 헹굼 불필요' } } }, base: { zh: '無色無味，不含茶樹和柑橘', en: 'Colorless and odorless, no tea tree or citrus', ja: '無色無臭、ティーツリーと柑橘なし', ko: '무색무취, 티트리와 감귤류 없음' } },
  { id: 'furrykelp', name: { zh: '毛毛藻嚴選 不只除臭地板清潔液', en: 'FurryKelp Select Pet Floor Cleaner', ja: 'FurryKelp セレクト ペット用床用洗剤', ko: 'FurryKelp 셀렉트 반려동물 바닥 세정제' }, url: 'https://www.furrykelp.com/products/floor-cleaner-1000ml', price: same('NT$550/1000ml'), dilution: { zh: '10～20ml 加 10 公升水', en: '10–20ml in 10 liters of water', ja: '水 10 リットルに 10〜20ml', ko: '물 10리터에 10~20ml' }, uses: same('50～100'), scent: { zh: '玫瑰精油', en: 'rose essential oil', ja: 'ローズ精油', ko: '장미 에센셜 오일' }, catNote: { zh: '含玫瑰精油，使用前請教獸醫', en: 'Contains rose essential oil; ask your vet before use', ja: 'ローズ精油入り。使う前に獣医師に相談', ko: '장미 에센셜 오일 함유, 사용 전 수의사와 상담' }, catPenalty: 2,
    need: { often: { score: 3, why: { zh: '濃縮配方，一桶水只要 10～20ml', en: 'Concentrated: only 10–20ml per bucket', ja: '濃縮タイプ、バケツ 1 杯に 10〜20ml', ko: '농축형, 한 통에 10~20ml' } }, urine: { score: 1, why: { zh: '二氫檸檬酸銀抑菌', en: 'Silver dihydrogen citrate inhibits bacteria', ja: 'クエン酸二水素銀で抗菌', ko: '구연산이수소은으로 항균' } } }, base: { zh: '貓砂盆和外出籠也能擦', en: 'Also wipes litter boxes and carriers', ja: '猫トイレやキャリーも拭ける', ko: '고양이 화장실과 이동장도 닦을 수 있음' } },
  { id: 'cenra', name: { zh: '毛毛好室 寵物滲透抗菌地板清潔劑', en: 'Paws & Wellness Pet Floor Cleaner', ja: '毛毛好室 ペット用床用洗剤', ko: 'Paws & Wellness 반려동물 바닥 세정제' }, url: 'https://mall.cenrahealthcare.com/SalePage/Index/11049534', price: same('NT$660/1000ml'), dilution: same('1:1000'), uses: same('100'), scent: { zh: '寵物友善香氛', en: 'a pet-friendly scent', ja: 'ペットに配慮した香り', ko: '반려동물 친화 향' }, catNote: { zh: '有香氛，貓咪怕香味要留意', en: 'Scented; take note if your cat dislikes scent', ja: '香りあり。香りが苦手な猫は注意', ko: '향이 있으니 향을 싫어하는 고양이는 주의' }, catPenalty: 1,
    need: { often: { score: 3, why: { zh: '1:1000 稀釋，一桶水只要 10ml', en: '1:1000 dilution: only 10ml per bucket', ja: '1:1000 に希釈、バケツ 1 杯に 10ml', ko: '1:1000 희석, 한 통에 10ml' } }, urine: { score: 2, why: { zh: '標榜能清到磁磚縫裡的尿漬', en: 'Says it cleans urine down into grout', ja: '目地の尿汚れまで洗えるとうたう', ko: '타일 줄눈의 소변 때까지 닦는다고 표방' } } }, base: { zh: '拖完不用再拖第二次', en: 'No second mopping', ja: '二度拭き不要', ko: '다시 닦을 필요 없음' } },
  { id: 'odout', name: { zh: '臭味滾 狗地板清潔', en: 'ODOUT Dog Floor Cleaner', ja: 'ODOUT 犬用床用洗剤', ko: 'ODOUT 강아지 바닥 세정제' }, url: 'https://www.odout.com/SalePage/Index/10820875', price: same('NT$600/1000ml'), dilution: same('1:200'), uses: same('20'), scent: null, dogOnly: true,
    need: { urine: { score: 2, why: { zh: '標示可分解阿摩尼亞，無香精', en: 'Labeled as breaking down ammonia, no fragrance', ja: 'アンモニアを分解と表示、無香料', ko: '암모니아 분해 표시, 무향료' } }, often: { score: 2, why: { zh: '可加進掃地機器人水箱', en: 'Can go in a robot mop tank', ja: 'ロボット掃除機のタンクに入れられる', ko: '로봇청소기 물통에 사용 가능' } } }, base: { zh: '成分三種，不含香精', en: 'Three ingredients, no fragrance', ja: '成分は 3 種、香料なし', ko: '성분 세 가지, 향료 없음' } },
  { id: 'muzuo', name: { zh: '木酢寵物達人 環境除臭液（原味）', en: 'Muzuo Pet Environmental Deodorizer (Original)', ja: '木酢達人 環境消臭液（原味）', ko: '무쭤다런 환경 탈취액(오리지널)' }, url: 'https://muzuopet.com/product/detail/592736', price: { zh: 'NT$500 起／1L', en: 'From NT$500/1L', ja: 'NT$500 から/1L', ko: 'NT$500부터/1L' }, dilution: same('1:30～1:50'), uses: same('3～5'), scent: { zh: '煙燻烏梅味', en: 'a smoked plum smell', ja: '梅の燻製のようなにおい', ko: '훈연 매실 냄새' }, catNote: { zh: '養貓要選原味，橘油款不建議給貓用', en: 'With cats, choose the original; the orange oil version is not recommended', ja: '猫がいるなら原味を。オレンジオイルは猫に推奨されない', ko: '고양이가 있다면 오리지널을, 오렌지 오일은 권장하지 않음' },
    need: { urine: { score: 3, why: { zh: '弱酸性木酢液，中和尿騷味裡的氨', en: 'Mildly acidic wood vinegar neutralizes ammonia', ja: '弱酸性の木酢液がアンモニアを中和', ko: '약산성 목초액이 암모니아를 중화' } } }, base: { zh: '原味只有木酢原液和山梨酸鉀', en: 'Original has only wood vinegar and potassium sorbate', ja: '原味は木酢原液とソルビン酸カリウムだけ', ko: '오리지널은 목초 원액과 소르빈산칼륨뿐' } },
]
