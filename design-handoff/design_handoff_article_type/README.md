# Handoff：文章類型（推薦文 / 知識分享）

## Overview

spaceA 要新增一個獨立於「分類（主題）」的 WordPress custom taxonomy「文章類型」，前端依此顯示不同的類型標籤、在分類頁提供類型篩選，並依類型輸出不同的 JSON-LD。

類型只有兩個 term：

| 類型 | slug | 定義 | 揭露義務 |
|---|---|---|---|
| 推薦文 | `recommendation` | 具名推薦特定商品或服務、含清單或排序 | 需要（合作／聯盟連結揭露） |
| 知識分享 | `knowledge` | 選購方法、照護知識、流程說明、經驗分享；含個人視角 | 不需要 |

分界依據是「有沒有具名推薦特定商品／服務」，因為這條線同時決定了 schema、揭露義務與版型。更細的分法（選購 / 照護 / 流程）用既有的 tag 處理，不進這個 taxonomy。

未來若開始做單一產品實測，再從 `recommendation` 拆出 `review`（`Review` + `reviewRating`）。目前不要開。

## About the Design Files

這個 bundle 裡的 HTML 是**設計參考**——在瀏覽器裡跑得起來的原型，用來說明外觀與行為，不是可以直接搬進 production 的程式碼。

目標 codebase 是 Next.js 15 App Router + TypeScript + Tailwind CSS 3.4（headless WordPress，WPGraphQL + Yoast SEO）。請用該專案既有的 component 結構與 Tailwind 樣式重新實作這些畫面，不要把 HTML 直接貼進去。原型裡的樣式一律寫成 inline style，那是原型環境的限制，不是設計意圖。

## Fidelity

**High-fidelity。** 顏色、字級、間距、圓角都是最終值，請照著實作。文案也是最終文案，除非另行通知不要改寫。

原型裡的文章標題、日期、篇數是示範資料，實際內容來自 WordPress。

## Design Tokens

沿用 spaceA 既有設計系統，本次沒有新增 token。

| 用途 | 值 |
|---|---|
| 頁面底色 | `#fbfaf7` |
| 卡片／輸入底色 | `#ffffff` |
| 淺底（類型膠囊、次級區塊） | `#f1eee8` |
| 主文字 | `#1d1c1a` |
| 次文字 | `#6f6a63` |
| 弱化文字（日期、篇數） | `#9c968d` |
| 線 | `#e6e2da` |
| 重點色 | `#0284c7` |
| 重點色淺底 | `#e0f2fe` |
| 重點色 hover | `#0369a1` |
| 標題字體 | Noto Serif TC 700 |
| 正文字體 | Noto Sans TC 400 / 500 / 700 |
| 圓角 | 膠囊 `999px`／卡片 `14px`／區塊 `16px`／大區塊 `20px` |

## 1. 類型標籤（Type badge）

同一張卡片上有兩個維度：分類（主題）與文章類型。視覺上必須分得開。

**採用方案：分類為亮藍純文字，類型為米色膠囊。**

分類：
```
font-size: 12px; font-weight: 700; color: #0284c7;
```

類型：
```
font-size: 12px; color: #6f6a63; background: #f1eee8;
border-radius: 999px; padding: 3px 11px; line-height: 1.5;
white-space: nowrap; display: inline-block;
```

兩者放在同一個 `flex` 容器，`gap: 9px`～`10px`，`flex-wrap: wrap`。

小尺寸（列表縮圖列、延伸閱讀卡）用 `font-size: 11px; padding: 2px 9px;`。

兩種類型共用同一組樣式，不做顏色區分——類型是次要資訊，視覺重量必須低於分類。

考慮過但未採用的方向記錄在 `文章類型標籤.dc.html`（1a 淺底膠囊＝採用、1b 類型各給顏色、1c 類型為主、1d 無容器前綴），每個方向都套在三個實際位置上，附取捨說明。若之後想改方向，從那支檔案挑。

### 出現位置

| 位置 | 說明 |
|---|---|
| 首頁大卡片 | 在 kicker 與日期之間 |
| 首頁側邊列表 | 在分類與日期之間，小尺寸 |
| 分類頁編輯精選 | 在「編輯精選」與日期之間 |
| 分類頁文章格 | 在 kicker 與日期之間 |
| 文章頁標題區 | 在分類連結右邊，`<h1>` 上方 |
| 麵包屑 | 分類與文章標題之間，作為可點連結 |
| 延伸閱讀卡 | 在分類右邊，小尺寸 |

麵包屑裡的類型是連結，指向該分類的類型篩選結果（`/{category}/?type={slug}`），樣式同類型膠囊但 `padding: 2px 10px`。

搜尋結果頁目前尚未加入類型標籤，實作時請一併補上（位置：分類與日期之間）。

## 2. 分類頁的類型篩選

**目的**：讓讀者知道這個分類同時收錄兩種文章，並可以只看其中一種。

位置：`<h1>` 與敘述之下、既有「主題篩選」之上，獨立一列。

結構：
```
[文章類型]  ( 全部 10 篇 ) ( 推薦文 3 篇 ) ( 知識分享 7 篇 )  這個分類收錄 3 篇推薦文、7 篇知識分享
```

- 列容器：`display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding-top: 26px;`
- 標籤文字「文章類型」：`font-size: 12px; color: #9c968d; letter-spacing: 0.08em;`
- 按鈕（未選）：`background: #fff; border: 1px solid #e6e2da; color: #1d1c1a; font-weight: 500; border-radius: 999px; padding: 9px 18px; font-size: 14px;`
- 按鈕（已選）：`background: #0284c7; border-color: #0284c7; color: #fff; font-weight: 700;`
- 按鈕內篇數：`font-size: 12px; font-weight: 400;` 未選 `#9c968d`、已選 `rgba(255,255,255,0.75)`；與標籤之間 `gap: 8px`，`align-items: baseline`
- 轉場：`transition: .15s`
- 尾端說明文字：`font-size: 12px; color: #9c968d;`

行為：

- 三個選項互斥（單選），預設「全部」
- 與既有「主題篩選」（tag，可複選）**疊加**：兩者同時作用
- 切換類型時重置分頁（`shown` 回到 6）
- 「清除篩選」同時清掉 tag 與類型
- 類型不是「全部」時，隱藏「編輯精選」大版位，改把該篇併入下方文章格一起篩選——否則篇數會對不上
- 篇數以整個分類的文章總數計算（含編輯精選那篇），與 `<h1>` 下方敘述的「共 N 篇」必須一致

篇數與敘述數字不一致是這次修過的 bug，實作時請確認資料來源是同一個。

## 3. 知識分享版型（文章頁）

檔案：`版型-知識分享.dc.html`（示範主題：寵物保險）。推薦文版型尚未設計，之後另行交付。

容器 `max-width: 1180px`，主欄與側欄 `grid-template-columns: minmax(0,1fr) 280px`，`gap: clamp(32px,5vw,72px)`；≤900px 隱藏側欄改單欄。

由上而下：

1. **麵包屑** — 首頁 / 分類 / 類型（膠囊連結）/ 文章標題
2. **分類 + 類型膠囊**
3. **`<h1>`** — `clamp(28px,4.4vw,40px)`，Noto Serif TC 700，`line-height: 1.42`，`letter-spacing: -0.02em`，`text-wrap: pretty`
4. **導言** — 17px，`line-height: 2.05`，`color: #6f6a63`，`max-width: 44em`
5. **Byline 列** — 上下 1px 線，內含作者（頭像 30px 圓形 + 連結）、發布日、更新日、閱讀時間，以 `·`（`#e6e2da`）分隔
6. **「先看結論」區塊** — `background: #e0f2fe`，`border-radius: 16px`，`padding: 26px 28px`；一段可直接被摘錄的結論 + 三點清單。這是 GEO/AIO 的重點，務必保留在正文最前面
7. **主圖** + figcaption
8. **本篇目錄** — 白底卡片，錨點連結
9. **判斷標準區** — 編號圓形（34px，`#f1eee8`）+ `<h3>` + 說明 + 「要問的問題」灰底方塊（`#f1eee8`，`border-radius: 10px`）。這一段對應 `HowTo` steps
10. **比較表** — 表頭 `#f1eee8`，列間 1px 線；**不列價格**，只比條款／規格寫法；表下方註明資料範圍與免責
11. **常見問題** — `<h3>` + 答案，對應 `FAQPage`
12. **「這篇怎麼寫出來的」** — 資料來源、編輯核對、更新方式三段 + 揭露聲明
13. **延伸閱讀** — 卡片含分類與類型標籤
14. Footer

側欄（sticky，`top: 92px`）：判斷標準速覽 + 「關於知識分享」說明卡（含導向推薦文的連結）。

### 個人視角的處理

知識分享會加入個人視角，因此：

- `author` 用具名 `Person`，不要用 `Organization`。原型目前仍掛「spaceA 編輯部」，實作時改為文章實際作者，並連到作者頁
- 「這篇怎麼寫出來的」需要區分哪些來自作者自身經驗、哪些來自查證資料。原型的三段文字是以條款核對為例，實作時依文章調整
- 作者頁尚未設計（`Person` schema、E-E-A-T）

## 4. JSON-LD

依 term slug 決定輸出哪組。

**推薦文 `recommendation`**
```
BreadcrumbList + Article + ItemList
```
`articleSection: "推薦文"`。只有在確實有實測依據與一致評分標準時才加 `Product` + `Review`；純比較整理一律只用 `ItemList`，否則有結構化資料濫用的風險。含合作或聯盟連結時，頁面開頭必須有揭露文字。

**知識分享 `knowledge`**
```
BreadcrumbList + Article
```
`articleSection: "知識分享"`；有步驟章節加 `HowTo`，有問答區塊加 `FAQPage`。含個人視角時 `author` 用具名 `Person`。

麵包屑第三層指向 `/{category}/?type={slug}`。

完整可參考的 JSON-LD 寫在 `版型-知識分享.dc.html` 的 `<helmet>` 裡（`BreadcrumbList` + `Article` + `HowTo` + `FAQPage` 四組，含 `datePublished` / `dateModified` / `publisher` / `image`）。

## 5. 後端需求（供對照）

- 註冊 custom taxonomy `article_type`，hierarchical: false，只開兩個 term
- WPGraphQL 需要 expose 該欄位，列表與單篇查詢都要帶
- 分類頁需要能依 `article_type` 過濾並取得各 term 的文章數
- 分類 archive 支援 `?type=` query param

## Assets

- `assets/logo-sa-mark.png` — SA 圖形標誌
- `assets/categories/{3c,food,health,pets,education}.jpg` — 分類／文章示範圖

示範圖來自既有設計系統，正式內容用 WordPress 的 featured image。

## Files

| 檔案 | 內容 |
|---|---|
| `文章類型標籤.dc.html` | 四種標籤視覺方向的比較，各套在三個位置上；含類型與 JSON-LD 對照表。**1a 為採用方案** |
| `版型-知識分享.dc.html` | 知識分享文章頁完整版型，含四組 JSON-LD |
| `分類頁-寵物生活.dc.html` | 分類頁，含類型篩選列與類型標籤 |
| `首頁.dc.html` | 首頁，大卡片與側邊列表已加類型標籤 |
| `搜尋結果頁.dc.html` | 搜尋結果頁（**尚未加入類型標籤**，實作時補上） |

`.dc.html` 直接用瀏覽器開即可。樣式全部 inline，請當作規格讀，不要照抄。
