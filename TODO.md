# spaceA 開發進度

## 進行中
<!-- 目前無 -->

## 待辦

### 已知簡化（後續要補）
- 聯絡表單（`/contact`）目前只有前端互動，送出後沒有真的寄信 — 需要接後端 API（email 服務）才能真正收信
- 文章頁沒有「本文目錄」（TOC）— 需要解析 `post.content` 內的標題並注入錨點 id 才能做，先跳過
- 分類頁移除了「熱門」排序切換 — 原設計稿的排序是假資料（reverse），怕誤導使用者以為有真實熱門度，先只保留「最新」
- 首頁「編輯精選專題」橫幅拿掉了原設計稿的假統計數字（12,000+ 篇評論等），改成不掛數字的說法，避免不實資料

### 內容策略 — 文章類型規劃
除了核心推薦文，規劃以下內容類型（同一利基內互相導流，避免無關話題稀釋主題權威度）：
- [ ] 推薦文（核心，轉換用）
- [ ] 比較文（A vs B）— 需確認是否要獨立 post type / schema（可能需要不同 JSON-LD，如 Product 比較表）
- [ ] 開箱/實測心得 — 補強 E-E-A-T
- [ ] 保養/使用教學 — 承接售後搜尋
- [ ] 季節性禮物指南 — 每年可複用
- [ ] 熱門單品評測（機動）— 導回品類頁
- [ ] WordPress 分類/欄位確認：是否需新增分類法（taxonomy）區分文章類型，供前端顯示對應版型與 JSON-LD

### SEO / GEO / AIO 基礎設施
- [x] sitemap.xml（`src/app/sitemap.ts`，動態抓 WP 分類/文章）
- [x] TKD（Yoast SEO 透過 WPGraphQL 拉取，各頁 generateMetadata）
- [x] llms.txt（`src/app/llms.txt/route.ts`，動態抓 WP 分類，每小時 revalidate）
- [x] FAQ schema（`src/components/seo/FaqJsonLd.tsx`，已套用於 `/about#how`）
- [ ] 文章頁 FAQ：若 WordPress 文章內容有 FAQ 區塊，考慮解析並套用 FaqJsonLd（目前僅靜態頁面有套用）

### Phase 5 — ISR Webhook
- [ ] WordPress WP Webhooks plugin 設定
- [ ] 測試：WP 發文 → 頁面自動更新

### Phase 6 — Analytics（選用）
- [ ] Google Analytics 4 加入 layout
- [ ] Google Search Console 驗證
- [ ] 提交 sitemap

### Phase 7 — 上線
- [ ] 部署至 Vercel
- [ ] 環境變數設定
- [ ] 自訂網域 + SSL
- [ ] Lighthouse 審核（Performance > 90, SEO = 100）
- [ ] Google Rich Results Test 驗證

---

## 完成
- [x] 計畫制定與方向確認
- [x] Phase 0：初始化 Next.js 15 專案
  - [x] 安裝所有套件（Next.js、Apollo、Tailwind、@next/third-parties）
  - [x] 設定 tsconfig.json、next.config.ts、tailwind.config.ts
  - [x] 建立 .gitignore、.env.local.example
  - [x] 建立 CLAUDE.md
  - [x] 建立 TODO.md（本檔）
- [x] WordPress 設定（recommend.dg166.com）
  - [x] 安裝 WPGraphQL、Yoast SEO、WPGraphQL for Yoast SEO
  - [x] 設定 Permalink：/%category%/%postname%/
  - [x] 確認 GraphQL endpoint 正常
- [x] Phase 1 — 資料層
- [x] Phase 2 — Layout 與共用元件（Header、Footer、Navigation、Breadcrumbs）
- [x] Phase 3 — 頁面（首頁、分類頁、文章詳情頁、404）
- [x] Phase 4 — SEO 層（JSON-LD、sitemap.ts、robots.ts、generateMetadata）
- [x] `src/app/api/revalidate/route.ts` — ISR on-demand webhook
- [x] Phase 1：資料層
  - [x] .env.local 設定
  - [x] src/lib/constants.ts
  - [x] src/types/wordpress.ts
  - [x] src/types/seo.ts
  - [x] src/lib/apollo-client.ts
  - [x] GraphQL fragments（seoFields、articleFields）
  - [x] GraphQL queries（navigation、homepage、category、article、sitemap）
