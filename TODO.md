# spaceA 開發進度

## 進行中
<!-- 目前無 -->

## 待辦

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
