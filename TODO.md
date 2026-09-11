# spaceA 開發進度

## 明天（2026-09-11）要做

1. ~~**GSC 綁定**~~ — 2026-09-11 已完成，網域資源 `spacea.com.tw` 用 seo@stack.com.tw 驗好了
2. ~~**提交 sitemap**~~ — 2026-09-11 已提交，狀態成功、發現 15 個網址
3. ~~**兩篇送索引**~~ — 2026-09-11 新店飯店、外泌體兩篇都已「要求建立索引」
4. **確認 Zeabur 部署到 `19150cd`** — 檢查前台：編者介紹（阿康／內容編輯／現職與經歷）、揭露句已無「文中不含業配」、區塊順序是常見問題→總結→參考資料、文章頁有 revalidate（WordPress 改內容一小時內會反映）
5. ~~**第三篇澳洲一日遊**~~ — 完成（post 283），還剩七個主題，動筆前先照 `docs/推薦文交件檢查清單.md` 決定「推薦對象」要選產品還是服務（卡片要圖就選產品）

## 進行中
- [ ] 寫新文章 — 目前 WordPress 只有 3 篇（都在「行銷」「影音器材」分類），內容太少，熱門排行/分類頁/首頁都撐不起來，要盡快補文章

  待寫主題（2026-09-09 交辦，十篇）：
  - [x] 外泌體保養品 — post 214 `/beauty/exosome-skincare-recommendation/`
  - [x] 新店飯店 — post 224 `/travel/xindian-hotels-guide/`（推薦文生成器，分類旅遊住宿）
  - [ ] 寵物用品
  - [ ] 牙醫
  - [ ] 料理包
  - [ ] 醫美
  - [x] 澳洲一日遊 — post 283 `/travel/australia-day-tours-guide/`（客戶老墨旅遊，8 家墨爾本／雪梨在地華語一日團；已送 GSC 索引。第一版「澳洲旅遊團」比例不對已刪）
  - [ ] 巧克力
  - [ ] 南投景點
  - [ ] 膠原蛋白

## 待辦

### 已知簡化（後續要補）
- 聯絡表單（`/contact`）已可收件 — `src/app/api/contact/route.ts` 轉發到 n8n webhook「spaceA-聯絡表單通知」→ Slack #機器人測試。若之後想改成寄 email，再接 email 服務即可（webhook URL 可用 `N8N_CONTACT_WEBHOOK_URL` 覆蓋）
- 分類頁移除了「熱門」排序切換 — 原設計稿的排序是假資料（reverse），怕誤導使用者以為有真實熱門度，先只保留「最新」
- 首頁「編輯精選專題」橫幅拿掉了原設計稿的假統計數字（12,000+ 篇評論等），改成不掛數字的說法，避免不實資料
- [x] `npm run lint` 修好了 — eslint 9 + eslint-config-next 16 只吃 flat config，舊的 `.eslintrc.json` 會噴 `Converting circular structure to JSON`。改成 `eslint.config.mjs`（只 spread `eslint-config-next/core-web-vitals`，它已含 next 與 next/typescript）、script 改 `eslint .`、忽略 `design-handoff/`。順手修掉：站內 `<a>` 改 `<Link>`（about／contact／privacy／standards／terms）、`PopularRankingClient` 的 `Date.now()` 改成 `useState` lazy initializer（react-hooks/purity）

### 設計優化
- [x] 文章頁「先看結論」改成白底細框卡 ＋ 騎在上緣的藍色掛耳標籤，重點條列改 ✓ ＋ 分隔線（`src/app/[category]/[slug]/page.tsx`）
- [x] 文章頁「編者介紹」區塊 — 放在封面圖之後、本篇目錄之前，資料吃 `EDITOR_NAME`／`EDITOR_ROLE`／`EDITOR_BIO`／`EDITOR_AVATAR_URL` 常數，不吃 WordPress 內文（StackTool 自帶那塊人設常跟主題無關，已在 `stripUpstreamAuthorBlock` 挑掉）
- [x] 修掉 StackTool 內文 `<style>` 的 `.ai-article-body h2/h3` 跟站上 `.prose h2/h3` 權重打架（深藍字壓在藍底上）— `stripUpstreamHeadingStyles`

### 推薦文封面圖（n8n workflow `推薦文-3-完整生成`, id `wHUHCGjX2iyiY7wA`）
- [x] 改掉舊 prompt — 舊版寫「拍攝風格情境照＋絕對禁止任何文字」，生出來是制式 stock photo。現在的模型畫得出正確的繁體中文，所以 `封面圖提示詞` 節點改成直接生一張設計過的橫幅：照片滿版、左上膠囊標籤（年份＋最新推薦）、兩行大標（主題／怎麼選？）、副標（精選 N 家口碑推薦）、三個圓形 icon 徽章、右下便利貼
- [x] 模板吃文章資料：標題會切掉「2026精選8家…推薦」尾巴再拆兩行、`brands.length` 帶「精選 N 家」、`subject_type` 決定情境（service 走辦公室／product 走使用產品）與徽章標籤
- [x] 關鍵措辭：必須寫「四個邊角都是照片內容」＋「嚴格禁止大面積純白／過曝／留白」，否則模型會把左側打亮成白牆
- [x] 既有文章換新封面：post 187（media 204）、post 112（media 206）
- [x] post 161（短影音器材）換上指南版封面（media 209）— 選購指南不適用「精選 N 家口碑推薦」，改成膠囊標籤「2026 新手指南」、副標「照著清單準備就不會買錯」、徽章「必備清單／預算範圍／新手重點」。這篇不是本 workflow 產的，是照同一套模板單獨生一次再設為精選圖片，並補上 alt
- [x] `封面圖區塊` 不再把封面塞進內文 — 文章頁本身就會渲染精選圖片，塞進內文會重複一張。節點改成只輸出空區塊佔位（`text: ''`），Merge 第 9 個輸入才不會落空；封面仍由 `設定精選圖片` 掛成 featured_media。112／187／161 內文都已確認沒有殘留 `<div class="cover-image">`
- [x] 封面版型定案（2026-09-11，post 266 來回七版才對）— `封面圖提示詞` 改了四處：
  - 情境：旅遊團／行程／景點／住宿／餐廳這種沒有實體包裝的產品，主角是目的地實景，禁止手冊、平板、地圖、相機、書桌
  - 徽章：正圓在圓心高度切上下兩半，上半近白放黑線稿圖示、下半中等飽和粉彩寫深色粗字（照外泌體那張的樣子），不要膠囊、不要整顆同色加細帶
  - 副標：不再寫死「精選 N 家口碑推薦，帶您找到最合適的 XX」，依主題自寫兩行；**只有數字變色**，其他全深色（模型自己挑詞上色會只上到半個詞）
  - 便利貼：原本引號框住「挑選時要看哪三件事」，模型會照抄成文案；改成「只寫三個項目本身」＋只能在頓號換行、不准把同一個字寫兩次
  - post 266 封面 media 280（雪梨歌劇院實景）。另加：徽章直徑約等於大標一行高、便利貼斜約 4 度、三行固定不亂斷（模型對尺寸指令吃得不準，徽章還是偏大）
- [ ] 封面檔名要獨特 — n8n 每次都上傳 `cover.jpg`，WordPress 改名成 `cover-1.jpg` 之後被 Cloudflare 快取，換文章也拿到舊圖（post 283 一度顯示 266 的封面）。`上傳封面圖到WordPress` 的檔名要帶 slug 或時間戳
- [x] Wix 網站的卡片圖 — Wix（wixstatic.com）的 og:image 是全站共用首頁那張，翻玩墨爾本、悠游墨爾本都抓成首頁圖。`Code in JavaScript2`（抓官方頁）改成：og:image 是 wixstatic 就只給 10 分，內文的 wixstatic.com/media 圖加 90 分（有 fill/fit 尺寸參數再加 20）。post 283 兩張已手動換
- [x] 封面上傳前轉 JPEG — 新增 `封面圖壓成JPEG` 節點（Edit Image，resize 1600×900 onlyIfLarger ＋ format jpeg / quality 82），接在 `轉封面圖檔` 和 `上傳封面圖到WordPress` 之間，上傳檔名改 `cover.jpg`。實測 1.4MB PNG → 約 180KB JPEG。n8n 主機有 graphicsmagick，Edit Image 可用

### 推薦文交件檢查清單
- [x] `docs/推薦文交件檢查清單.md` — 生成後的健檢流程（比較表價格、文案殘句與 B2B 殘留、卡片圖與連結、封面、SEO 前台檢查），附「推薦對象怎麼選」與「已經寫進 n8n 不用逐條人工檢」的對照表。範本文章：post 224 新店飯店

### 推薦文章節標題（n8n workflow `推薦文-3-完整生成`）
- [x] 推薦清單章節的 h2 不再寫死「品牌推薦」— 新增 `章節標題` 節點（chainLlm，掛在 `抓人設` 後平行跑，共用既有 OpenRouter Chat Model），吃標題／關鍵字／品牌數／subject_type，依語意輸出一行 h2：量詞看主題（商品→款、店家公司飯店診所→家、景點→個、課程→門），商品類寫「5款外泌體保養品推薦」、店家類寫「精選8家新店飯店推薦」。`組卡片章節` 讀它的輸出，抓不到或超過 30 字就退回「品牌推薦」。節點 `onError: continueRegularOutput`，失敗不擋發文
- 已回頭手改的既有文章：post 224「精選8家新店飯店推薦」、post 214「5款外泌體保養品推薦」（含 `nav.toc` 對應那行）
- [x] 總結不再業配 — `總結` 節點原本強制「品牌名加粗至少 1 次」＋結尾置中「了解更多」連到客戶官網，太明顯。提示詞改成：總結只講「怎麼選」的判斷步驟，禁止點名任何單一品牌，結尾不加連結。post 224／214 已回頭手改（224 拿掉「需要品牌服務保障可參考白金花園」那句與官網連結；214 拿掉「了解更多」）
- [x] 「沒有就別提」：`未見／未發現／查無…獲獎／認證／紀錄` 這種沒有資訊量、又把被推薦對象寫得像有缺陷的句子，`組卡片章節` 會整條 `<li>` 或整格欄位丟掉（`NEGATIVE_FINDING`）。post 224／214 已回頭清乾淨
- [x] 品牌卡片的「官方產品頁」改成看網址判斷：連到首頁（含 /zh-tw 語系首頁）寫「官方網站」，路徑兩層以上才寫「官方產品頁」——飯店、店家寫產品頁很怪。順手把 href 夾到空白/換行的髒網址切乾淨（碧潭飯店那筆混進了圖片網址）
- [x] 「官方資訊」的地址掛 Google Maps 連結（`地址：` 標籤與「位於…」開頭兩種都認）
- [x] 文章頁「小編點評」的膠囊標籤改 `display:block; width:fit-content`（原本 inline-block 會被點評文字接在同一行，看起來跑版）
- [x] 品牌卡片「官方資訊」改成條列＋連結 — `組卡片章節` 新增 `renderOfficial()`／`linkifyOfficial()`：一項一行（拆 `<br>`、`；`、以及逗號後接聯絡類標籤）、標籤加粗、網址與 email 自動掛 `<a>`（官網開新分頁）、標成 Tel／電話的號碼掛 `tel:`（傳真不掛，避免誤撥）。既有 post 224、214 已用同一套規則回頭重排

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
- [x] 文章頁 FAQ 自動偵測 — 兩種格式都認：選購指南的 `<h2>常見問題</h2>` + `<h3>Q：…</h3>`／`<p>A：…</p>`，以及 StackTool 推薦文的 `<h2>FAQ</h2>` + `<details class="faq-item">`（`.question-text`／`.answer-container`）。解析後套 FaqJsonLd
- [ ] 選配：`extractConclusion` 是否也認「總結」— StackTool 推薦文的結論叫「總結」且放在文末，所以那些文章的「先看結論」框目前是空的。認了就能把結論前置（對 GEO 有利），但會改動既有文章版面
- [x] HowTo schema（`HowToJsonLd`）— 只給知識分享用，推薦文的 `<ol>` 是排名清單不套

### 文章頁區塊順序
- [x] 修好推薦文「總結」整段消失 — `extractConclusion` 會把總結抽去給「先看結論」框，但推薦文已經不顯示那個框，抽走就沒地方渲染。`parseArticleContent` 新增 `extractConclusion` 選項，推薦文關掉、知識分享維持原樣
- [x] 修好 hydration 錯誤 — 上一條的切法直接在 `<h2>總結</h2>` slice，切點在 StackTool 的 `<div class="ai-article-body">` wrapper 裡面，`bodyHtml` 少一個 `</div>`，瀏覽器把接在後面的 FAQ section 吞進去，DOM 跟 React 樹對不上，每篇推薦文都會噴 hydration failed。新增 `splitHtmlAt()`：切點當下還沒關的容器標籤，前半補 `</div>`、後半補回同樣的開頭標籤
- [x] 區塊順序改成 常見問題 → 總結 → 參考資料 — parser 以 `<h2>總結</h2>` 為界把內文切成 `bodyHtml` 與 `bodyTailHtml`，頁面在中間插入 FAQ；本篇目錄的「常見問題」也插到「總結」之前，跟實際順序一致

### 文章頁快取
- [x] `src/app/[category]/[slug]/page.tsx` 補上 `export const revalidate = 3600` — 原本沒設，文章頁在部署當下被靜態化後就不再更新，WordPress 改了內容要等下次部署才會反映（首頁、分類頁、sitemap 本來就有設）

### Phase 5 — ISR Webhook
- [ ] WordPress WP Webhooks plugin 設定
- [ ] 測試：WP 發文 → 頁面自動更新

### Phase 6 — Analytics（選用）
- [x] Google Analytics 4 加入 layout（`src/app/layout.tsx` 用 `@next/third-parties/google` 的 `GoogleAnalytics`，讀取 `NEXT_PUBLIC_GA_ID`，未設定則不注入，本地 `.env.local` 尚未填值）

### Phase 7 — 上線
- [x] 部署至 Zeabur（Docker，非原計畫的 Vercel — 已用 Dockerfile + docker-compose 部署，見 git log）
- [x] 自訂網域 + SSL — 正式網址是 `https://spacea.com.tw`（2026-09-10 起）；舊的 `spacea.dg166.com` 已經回 404，不要再拿來當 canonical
- [x] Zeabur 環境變數 `NEXT_PUBLIC_SITE_URL` 已改成 `https://spacea.com.tw`（2026-09-11 線上 sitemap 確認全部指向新網域）
- [x] Google Search Console 網域擁有權驗證（`spacea.com.tw`，seo@stack.com.tw）
- [x] 提交 sitemap.xml 到 Search Console
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
