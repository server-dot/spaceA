# spaceA 開發進度

## 進行中
- [ ] 寫新文章 — 目前 WordPress 只有 3 篇（都在「行銷」「影音器材」分類），內容太少，熱門排行/分類頁/首頁都撐不起來，要盡快補文章

## 待辦

### 已知簡化（後續要補）
- 聯絡表單（`/contact`）已可收件 — `src/app/api/contact/route.ts` 轉發到 n8n webhook「spaceA-聯絡表單通知」→ Slack #機器人測試。若之後想改成寄 email，再接 email 服務即可（webhook URL 可用 `N8N_CONTACT_WEBHOOK_URL` 覆蓋）
- 分類頁移除了「熱門」排序切換 — 原設計稿的排序是假資料（reverse），怕誤導使用者以為有真實熱門度，先只保留「最新」
- 首頁「編輯精選專題」橫幅拿掉了原設計稿的假統計數字（12,000+ 篇評論等），改成不掛數字的說法，避免不實資料

### 設計優化
- [x] 文章頁「先看結論」改成白底細框卡 ＋ 騎在上緣的藍色掛耳標籤，重點條列改 ✓ ＋ 分隔線（`src/app/[category]/[slug]/page.tsx`）

### 內容策略 — 文章類型規劃
除了核心推薦文，規劃以下內容類型（同一利基內互相導流，避免無關話題稀釋主題權威度）：
- [ ] 推薦文（核心，轉換用）
- [x] **選購指南／準備清單文**（第二類，已有範本）— 如「第一次養貓要準備什麼」，本質是「如何挑選」型教學文，不主推單品。範本結構：先看結論框（GEO 前置結論）→ 決策表格 → 常見問題（FAQPage）→ 資料來源揭露。內文格式都在 WordPress `post.content` 裡，沿用現有文章頁 template 即可，不用另開 page
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
- [x] FAQ schema 元件（`src/components/seo/FaqJsonLd.tsx`，已在文章頁套用）
- [x] 文章頁內容解析（`src/lib/content-parsers.ts`）— 從 `post.content` 抽出「結論」「常見問題」「這篇怎麼寫出來的」，幫 h2 補錨點 id 產生「本篇目錄」（TOC），並清掉 StackTool 自帶的舊 `<nav class="toc">`
- [x] 文章頁 FAQ 自動偵測 — 約定格式為 `<h2>常見問題</h2>` + `<h3>Q：…</h3>`／`<p>A：…</p>` 配對，解析後套 FaqJsonLd
- [x] HowTo schema（`HowToJsonLd`）— 只給知識分享用，推薦文的 `<ol>` 是排名清單不套

### Phase 5 — ISR Webhook
- [ ] WordPress WP Webhooks plugin 設定
- [ ] 測試：WP 發文 → 頁面自動更新

### Phase 6 — Analytics（選用）
- [x] Google Analytics 4 加入 layout（`src/app/layout.tsx` 用 `@next/third-parties/google` 的 `GoogleAnalytics`，讀取 `NEXT_PUBLIC_GA_ID`，未設定則不注入，本地 `.env.local` 尚未填值）

### Phase 7 — 上線
- [x] 部署至 Zeabur（Docker，非原計畫的 Vercel — 已用 Dockerfile + docker-compose 部署，見 git log）
- [x] 自訂網域 + SSL（`https://spacea.dg166.com`，已可連線）
- [x] 修正 Zeabur 環境變數 `NEXT_PUBLIC_SITE_URL`（已確認改成 `https://spacea.dg166.com`）
- [ ] Google Search Console 網域擁有權驗證（建議用 DNS TXT record）
- [ ] 提交 sitemap.xml 到 Search Console
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
