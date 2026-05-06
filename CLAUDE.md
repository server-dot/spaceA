# spaceA — 推薦文網站

## 專案概覽
行銷部門用 WordPress 撰文，Next.js 15 App Router 負責前端渲染與 SEO。
Headless WordPress 架構：WordPress 純 CMS，前端完全解耦。

## 技術架構
- **CMS**: WordPress (Headless) + WPGraphQL + Yoast SEO
- **前端**: Next.js 15 App Router, TypeScript, Tailwind CSS
- **資料層**: Apollo Client (WPGraphQL)，ISR 快取策略
- **SEO**: `generateMetadata()`、JSON-LD Server Components、sitemap.ts、robots.ts
- **部署**: Vercel (frontend) + 獨立 WordPress 主機

## 設計原則
易讀、簡潔、現代感 — 設計服務內容，不搶風頭。
- 排版優先：大字體、充足行距、白空間
- 色彩：深灰/黑文字 + 白底 + 品牌強調色（sky-500）
- Mobile-first

## 常用指令
```bash
npm run dev          # 開發伺服器 http://localhost:3000
npm run build        # 生產建置
npm run start        # 生產伺服器
npm run lint         # ESLint 檢查
npm run type-check   # TypeScript 型別檢查
```

## 環境變數
| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_WORDPRESS_URL` | WordPress 網址（不含尾斜線） |
| `NEXT_PUBLIC_SITE_URL` | 本站公開網址 |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID（選用） |
| `REVALIDATE_SECRET` | ISR on-demand webhook 驗證 token |

複製 `.env.local.example` 為 `.env.local` 並填入實際值。

## 路由結構
```
/                        首頁（精選 + 最新文章）
/[category]              分類列表頁
/[category]/[slug]       文章詳情頁
/sitemap.xml             自動生成 sitemap
/robots.txt              自動生成 robots
/api/revalidate          ISR on-demand webhook（POST）
```

## WordPress 設定要點
1. Permalink 結構：`/%category%/%postname%/`
2. 必裝 Plugin：WPGraphQL、Yoast SEO、WPGraphQL for Yoast SEO
3. GraphQL endpoint：`/graphql`
4. 生產環境關閉 public introspection

## SEO 慣例
- 所有 TKD 從 Yoast SEO 管理，透過 WPGraphQL 拉取
- JSON-LD 用 Server Component `<script>` tag 注入（非 client-side）
- Canonical URL 來源：Yoast `seo.canonical` 欄位
- OG image fallback：`public/og-default.jpg`

## 開發進度
見 `TODO.md`
