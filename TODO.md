# spaceA 開發進度

## 行動版頁首（2026-09-15 修好）

使用者說「RWD 沒做好，大跑版」。頁首把 logo ＋ 4 個選單 ＋ 搜尋框 ＋ 語言鈕排在同一個不換行的 flex，
390px 手機上最少要 680px 寬，一定橫向溢出（Google 行動裝置可用性會報「內容寬度超過螢幕」，
mobile-first indexing 直接扣分）。原本就有這問題，搜尋框改常駐、又加了語言鈕之後更嚴重。

- 新增 `components/layout/MobileMenu.tsx`：md 以下頁首只留 logo ＋ 語言鈕 ＋ 漢堡，
  面板裡放整列寬的搜尋框與直排選單，Esc 或點連結收起。md 以上維持原樣
- `SearchBar` 加 `fullWidth` 與 `onSubmitted`
- 地雷：面板要對頁首絕對定位，一度在 `sticky` 上又加 `relative`，兩個都設 position，
  誰贏看 Tailwind 產生的 CSS 順序，sticky 頁首可能失效。sticky 本身就是定位元素，不用加 relative
- **這個環境的瀏覽器無法真的縮到手機寬度**（resize 後 innerWidth 還是 1920），
  是靠量元素寬度推算的，實機或 DevTools 要再看一次

## 雙語（英文版）— 2026-09-15 前端、其他頁面、8 篇翻譯都完成，尚未 commit／部署

目標：中英文兩套關鍵字都吃得到。做法**不裝 Polylang**，英文版就是同一個 WP 裡另一篇文章，靠 slug 規則對照（規則寫在 `src/lib/i18n.ts` 檔頭）：
- 英文分類 slug = 中文分類 slug + `-en`（travel → travel-en），名稱／描述在 WP 填英文；英文文章 slug = 中文 slug + `-en`
- 前台網址不露 `-en`：`/en/travel/nantou-attractions-guide` ↔ WP `travel-en` / `nantou-attractions-guide-en`
- 中文列表一律排除 `-en` 分類，英文列表只取 `-en` 分類（首頁、分類頁、sitemap、llms.txt、頁尾都照這條）

前端：
- `app/(zh)/` 與 `app/en/` 各自是一個 root layout（共用 `components/layout/RootShell.tsx`），`<html lang>` 在伺服器端就正確
- 首頁／分類頁／文章頁的本體搬到 `src/views/`（HomeView、CategoryView、ArticleView），兩邊的 page.tsx 只是薄殼傳 `lang`
- 介面字串全部在 `src/lib/i18n.ts` 的 `UI` 字典；文章類型「推薦文／知識分享」英文顯示 Recommendation／Guide
- Header 加「EN／中文」切換（`LangSwitch`，用網址推算對照頁；沒翻的文章會落到英文 404，那頁會說英文版還沒提供）
- hreflang：文章頁與分類頁只有在英文對照頁**存在**時才輸出（`GET_POST_EXISTS`／`GET_CATEGORY_EXISTS`），首頁固定互指；sitemap 每個網址帶 alternates；JSON-LD `inLanguage` 跟著語言
- content-parsers 認英文標題：Conclusion／Summary／FAQ／References／How This Article Was Written；英文站的關於我們、熱門排行、搜尋還沒有，頁首頁尾先不放
- 順便發現：整站 404 都回 HTTP 200（soft 404，線上 `spacea.com.tw/nonexistent-cat` 也是），原因是 `loading.tsx` 讓頁面用串流輸出、狀態碼先送出去了。跟雙語無關，要修就把 `(zh)/loading.tsx`、`[category]/loading.tsx`、`[slug]/loading.tsx`（含 en 那份）拿掉

翻譯：`scripts/translate_post.py <post id>`（OpenRouter，預設 `openai/gpt-5-mini` 跟 n8n 同一顆；`--dry-run` 只翻不寫、`--force` 覆蓋重翻、`--status draft`）。照 `<h2>` 切段翻、比對標籤數不合會重翻一次、翻完快取在 `scripts/.translate-cache/`。標題與 meta description 另外生（英文版沒 Yoast，前台吃 excerpt 當描述）。分類／標籤的 `-en` 版沒有會自動建（分類名對照表在腳本的 `CATEGORY_NAMES`）。
- [x] 8 篇全翻完（2026-09-15，八篇合計不到 US$1）：161→359、326→360、308→362、283→363、224→364、214→365、187→366、112→367。英文分類建了 marketing-en／travel-en／food-en／beauty-en
  - 腳本踩過的坑都補進去了：Cloudflare 對大 payload 偶爾回 520（已加重試）、回應 JSON 前面有雜訊（從第一個 `{` 開始解）、中文 slug 的標籤在 WP 是百分比編碼（英文標籤改用英文名轉 slug，`description` 存中文原名當對照鍵）、模型會漏翻 SVG `<text>` 與卡片的 `<dt>` 標籤（加了 `translate_svg_texts`／`translate_leftovers` 兩道補翻）
  - `--force` 只覆蓋文章、翻譯吃快取；真的要重翻用 `--retranslate`
- [ ] 逐篇肉眼看英文版：品牌英文名對不對（Cona's Chocolate、18度C 這種）。SVG 標籤重疊與比較表擠欄 2026-09-21 已用 `SvgTextFit` ＋ `.compare-table` CSS 在前端修掉（36 個譯文網址掃過沒有超框／疊字）
- [x] 英文版送 GSC — sitemap 早已提交且自動帶 /en，2026-09-21 GSC 已看到 /en /ja /ko 網址被檢索，不用另外送
- [x] 其他頁面英文版（2026-09-15）：`/en/about`、`/en/standards`、`/en/contact`（表單字串在 `views/ContactForm.tsx`，Slack 通知帶 `lang`）、`/en/privacy`、`/en/terms`、`/en/popular`、`/en/search`。頁首頁籤與頁尾欄位改吃 `i18n` 的 `nav`／`footerColumns`，語言切換每頁對同一頁。文案是照中文版翻的，**兩邊改文案要一起改**（每個 en 檔頭有註明）
  - 「熱門排行」英文定 **Popular**（使用者選的，不是 Trending）
  - 順手修：中文熱門排行與搜尋原本會混進英文文章，已依分類 `-en` 過濾
  - 搬檔案到 `src/views/` 後 Tailwind 掃不到，版型整個跑掉 → `tailwind.config.ts` 的 `content` 加了 `./src/views/**`
- [ ] 之後：n8n 推薦文生成完自動接翻譯；英文站的分類只有翻到才建，首頁主題格目前 4 格

### 日韓版（2026-09-15 起）— 對象是來台旅客，使用者決定全部 9 篇都翻
- 架構：`i18n.ts` 擴成四語（`LANG_SUFFIX` -ja/-ko），`app/ja`、`app/ko` 路由與固定頁（固定頁字串用 `scripts/translate_tsx.py` 翻）；hreflang 只列存在的譯文，`x-default` 指中文
- 第一輪翻完（ja 395,399–409；ko 410–415,417–419）就用 `scripts/check_translation.py --review` 審：日文 9 篇 136 條嚴重，韓文前 4 篇 116 條。自己讀 409 確認是提示詞層級的病：`元` 沒帶 NT$（會被當日圓）、三萬八變 38万円、西方品牌自創片假名、中文術語直搬（単顆／全口）、地名拼音化
- [x] 2026-09-15 晚上：提示詞補齊後 ja/ko 18 篇全部重翻（約 US$2），加上確定性修正表（`fix_terms`／`collapse_ja_names`）與逐篇手修，第二輪審閱的「嚴重」大多是審閱模型誤判（NT$ 展開、七折＝30% off）。post 380 也補了英文版（428）
  - 工具鏈：`translate_post.py`（翻＋修正表）→ `check_translation.py --review`（區塊配對＋Gemini 審）→ 我讀報告、直接改 `scripts/.translate-cache/<id>.<lang>.json` 再 `--force` 推回 WP
  - 韓文人名地名音譯品質仍是最弱的一環（模型有時用韓式漢字音、有時用國語音），已在提示詞要求國語音譯＋全篇一致，但只能抽查
  - 日文「小編點評」定為「編集部のひとこと」、韓文「에디터 코멘트」；日文店名一律漢字原名不加片假名
- [x] 翻好的文章送 GSC — 同上，sitemap 自動帶，GSC 已在爬 /ja /ko
- 教訓：先部署程式再建 WP 資料。之前線上還是兩語版時就建了 `-ja` 分類，日文分類直接漏到中文首頁

## post 497 台北隆鼻診所 校稿（2026-09-16 已完成）

客戶貝拉整形外科（台北大安＋桃園），題目對準它首頁第一項 4D 結構式鼻雕／複合式隆鼻。生成器第一階段品牌搜尋只吐貝拉一家（Tavily 額度問題還在），其餘 9 家從 PTT facelift 板名單自己挑：雅丰、知美、嘉仕美、博恩妍、美麗線、萊佳、星采（已更名逆時）、亞緻、法喬。execution 17593，10 家跑 20 分鐘。修的：
- 結構照植牙那篇：卡片前是取捨章「隆鼻手術、線雕還是玻尿酸？先看你的鼻子缺什麼」（山根低先試玻尿酸／線雕；鼻頭短朝天只有結構式改得了；重修和鼻骨歪先找會重修的醫師），卡片後是三大挑選重點「挑隆鼻診所先看術式、鼻模與醫師」（一段式 3～8 萬／結構式 12～25 萬、山根材料價差、2019 年起隆鼻是衛福部列管手術只能專科醫師做）＋「費用、雷區與適合誰一次看懂」。卡片前那章是 n8n `比較段落` 節點產的（題目「做隆鼻手術還是打玻尿酸」抓得對，h3 是冷標籤要重寫），卡片後的三大重點才是第二階段大綱填的那章。第一版我把 `比較段落` 那章誤當多出來的刪掉、三大重點搬到卡片前、「一次看懂」改名，使用者退回：**兩章各在原位，只重寫內文**
- 貝拉的「4D 結構式鼻雕」其實是線雕（藍鑽魚骨線、10～15 分鐘、維持一到兩年），手術是另一頁「複合式隆鼻」，卡片和前言都分開講清楚；**貝拉官網沒公開隆鼻價格，卡片寫「面診報價」，要問客戶要不要給區間**
- 費用欄：萊佳官網有整份價目（矽膠 6～10 萬…結構式 20～50 萬）；博恩妍、亞緻、法喬用 PTT 2021 多家諮詢文的實際報價（24 萬／16～20 萬／16～20 萬）並註明年份；其餘寫官網未公開
- 卡片 h3 全改「診所＋主打術式」，dt 改診所定位／隆鼻費用／主要特色／適合誰，主要特色壓到三句，實際使用感受／回購傾向拿掉，官方資訊補地址（可點地圖）、電話、看診時間；嘉仕美的醫美大獎爭議新聞沒寫進去
- 卡片圖 10 張全部自己抓：貝拉 4D 鼻雕 banner、雅丰入口、知美正壓手術室、嘉仕美李進良、博恩妍櫃檯、美麗線診間、萊佳醫師面診、逆時等候區、亞緻隆鼻 banner（謝宇軒）、法喬形象照，media 499～508；生成器抓到的 4 張是 og 的 logo 陰影 png／KOL 海報
- 小編點評 10 則重寫、FAQ 5 題重寫（價格帶、材料優缺、恢復期含一個月不能戴眼鏡、專科怎麼查、假與歪的原因）、總結重寫拿掉簽名、新增參考資料 10 條（衛福部醫事司美容醫學專區、特管辦法、萊佳與博恩妍費用文、PTT 五篇）
- excerpt 補上；封面重生一次（media 512）：生成器的提示詞讓模型自己想便利貼三項，吐出「術式價位差、鼻模材質選、重修保固算」這種殘句，重生時把副標、徽章、便利貼四行全部逐字指定就對了（`scratchpad/gen_cover497.py` 的寫法，n8n 那個節點該改成由大綱先產好文案再逐字塞進提示詞）
- 取捨章定名「什麼樣的人適合做隆鼻手術？先看你的鼻子缺什麼」。**n8n `比較段落` 節點已改**（2026-09-16）：三節各講一種讀者、h3 完整句、每節要有數字、餵 brandDetails；下一篇生成時看第一章有沒有變好
- 前台待 ISR；英文版還沒跑

## post 380 台北植牙診所 校稿（2026-09-15 已完成）

生成約 30 分鐘（10 家，主流程跑到一半 Tavily 額度用完，備援搜尋失敗但沒中斷）。修的：
- 第一章又是 B2B 換皮（「在地診所 vs 大型醫院／效果與CP值／時間與恢復負擔」）→ 整章重寫成「植牙報價差三倍，差在植體品牌、牙冠與補骨」，三個 h3 講植體品牌價差、牙冠與補骨加價、3 萬 8 方案含不含牙冠，數字全部從各家官網的費用文章挖（歐仕美、重心、汐潔、爵華、悅庭都有寫價格）
- h2「品牌推薦」（章節標題節點又退回預設）→「精選 10 家台北植牙診所推薦」
- 收費模式 10 格「需聯絡公司洽詢」→ 四家有官網定價（爵華 8～12 萬、悅庭 9 萬以下＋十年保固、重心 6～10 萬、歐仕美 5～10 萬）、九日 All-on-4 38 萬起、其餘寫「官網未公開定價，需諮詢」；表頭改「診所／植牙項目」
- 卡片圖 10 張全換：原本 6 張是 3D 植體示意圖／icon／stock 照，4 張沒圖 → 全部去各家官網抓診所實景（診間、門面、醫師團隊、歐仕美的 Nobel 認證牌），media 382～391
- 小編點評 10 則重寫（第一版每則都「我會把它列為／納入考量」）、拿掉「實際使用感受／回購傾向」、負評裡「侵入性處置後續問題」「評論數不一致」「風險與失敗案例」這種拿掉、官方資訊裡「未找到獲獎」「未見深度報導」「可在掛號平台查詢」拿掉、網友評價改成人話
- 前言、收費雷區、FAQ Q1、總結（拿掉 ——Q kangber 簽名）重寫；參考資料換成衛福部口腔健康司、台北市衛生局收費標準表、三家診所的費用文章、三條 PTT 討論串
- excerpt 補上（前台當 meta description）、封面 media 379 補 alt
- **`轉化html卡片` 節點兩個毛病**（下次生成要再看，durable fix 在 n8n）：①「官方資訊」整塊會被漏掉，這篇十家有三家（翡冷翠、重心、爵華）沒有，研究階段 brandDetails 明明有資料，內容全被倒進「主要特色」；②「主要特色」把研究到的每一條都塞進同一格，這篇十家分別是 7～18 項用頓號串成 150～350 字。提示詞要加：主要特色上限 3 件事、寫成句子不要條列串接；brandDetails 有資料時官方資訊必填
- 前台待 ISR，之後送 GSC；英文版還沒跑（`python3 scripts/translate_post.py 380`）

## post 326 南投景點 校稿（2026-09-14 已完成）

生成 execution 17203（10 個景點 20 分鐘）。標題改成「南投景點怎麼排？10 個必去景點、門票與車程一次看」（使用者說每篇都「怎麼選？2026 精選 N 家」太單調，年份留一半、句型輪著用）。修的：
- h2 生成「個南投景點推薦」— `轉成html` 的 `removeNumberPrefix` 把「10個」開頭的數量當大綱編號吃掉，n8n 已改成只拆帶點的編號
- 門票 15 格「需洽詢」全部查官網補齊：清境 270／溪頭 250（星光 130）／九族 980 含纜車／妮娜 220／惠蓀 200／樹德 280；日月潭、合歡山、鹿篙、妖怪村免費
- 卡片標題「日月潭 日月潭觀光旅遊服務」這種殘句全改；日月潭那張整卡是在講官網不是講湖，重寫；dt 標籤改「景點定位／門票／主要特色／適合怎麼玩」；表頭改「景點／類型／門票…」
- 九族、鹿篙沒圖，妖怪村 img src 是「目前無公開資料」→ 補三張（media 328、329、330，南投旅遊網／明山官網／台灣農林官網）
- 第一章「上山賞景還是去海邊度假？」（南投沒有海）→ 「住哪一區決定一天能玩幾個」，用實際車程
- 三大面向、規格雷區、FAQ 五題、總結全重寫；FAQ「住哪一區」放客戶連結
- 參考資料換成官網票價頁＋PTT／部落格；封面重生 media 332（清境草原實景）
- 結構改動：刪掉生成器的「三大面向」那章（跟住宿章重複），改成「住宿地點與景點安排技巧」（區域＋車程＋海拔季節＋住宿）＋ 新增「三條南投路線與住宿建議」（每條 Day 1／Day 2，住宿點寫進去）。路線章配一張**橫向行程時間軸 SVG**（`scripts/build_route_timeline.py`，節點＋箭頭車程＋琥珀色住宿點），使用者說超讚，旅遊類以後都可以配這張
- 使用者退了兩次：前言 AI 味（規格表口吻＋「這篇比了十個…各有一個對應的」公式）→ 改成情境開頭、拿掉公式收尾；卡片圖 10 張裡 7 張是 og 抓到的海報／logo／色塊／404 → 全換成南投旅遊網與官網實景（media 334～340）。檢查清單已加「每張圖親眼看過」
- 前台待 ISR，之後送 GSC

## post 308 黑巧克力禮盒 校稿（2026-09-14 已完成）

post 308 `/food/taiwan-dark-chocolate-guide/` 14 項健檢全部修完並已寫回 WordPress（`modified 2026-09-14T02:36`）：

- 露特（立陶宛牌）整張換成香草騎士 85% 戀戀生巧克力 25 入 NT$500（media 313）；TERRA 卡換成 Choco Flight 九產區禮盒 NT$550（media 312），補上 Pinkoi 連結
- 價格：TC NT$950（100g）、CHOCOARTS NT$350（128g）、多儂 NT$880（225g）；妮娜／Rebirth 卡的 `href="-"` 補成產品頁
- 「實際使用感受／回購傾向」15 行全刪、破折號 3 處清掉、CHOCOARTS 促銷字換成 99.9%／128g 產品事實、妮娜「星等標示不一致」拿掉
- 第一章改成「買片狀還是買生巧克力？先看要放多久」（保存天數／100% 苦度／每克單價三個取捨）；前言照範式重寫，妮娜錨文字拿掉
- 三大面向用實際數字（每克 2.7 到 10.2 元、台灣可可只有 TC 與 Rebirth 兩款）；規格雷區、FAQ Q1/Q3/Q4/Q5、總結全重寫（總結不點名品牌、無簽名）
- h2「品牌推薦」→「精選10款台灣黑巧克力禮盒推薦」（含目錄）
- 參考資料 10 條：食藥署兩條＋ n8n execution 16706 的 `brandDetails[].reference_links`（Dcard／PIXNET／PTT）
- 封面來回三版：AI 畫的禮盒（media 314）被打槍「太明顯 AI，不會有商品長這樣」；拼貼版（media 316）不是使用者要的（他要的是情境照，只是商品要真的）→ 定案 **B 案：AI 空景 + 真實商品去背合成**（media 320，`scripts/build_cover_scene.py`；空景提示詞在 `scripts/gen_cover_scene.py`）
  - 版型要跟 283／214 那幾張長一樣：大標一行（主題深藍＋「怎麼選？」亮藍）、字用 Noto Sans CJK TC Black（`scripts/fonts/`，PingFang 最粗只有 Semibold 不夠）。**比例照原版型量的**：大標 124px＋8px 白描邊、副標 66px＋6px 描邊、膠囊 40px、徽章直徑 230、便利貼高 340（第一版全部小了 15～25%，被說「比例跑掉」）；商品只放一件主體，第二件會擠。俯拍平鋪版（media 318）跟原本的封面「差好多」，定案是 45 度有景深的情境
  - 空景提示詞（`scripts/gen_cover_scene.py`）：45 度俯角、背景失焦室內、淺橡木桌、右三分之一放咖啡可可豆餐巾、**左三分之二要有低對比的淺色道具鋪底（亞麻布斜鋪、角落葉子、小碟可可粉）**，不能是光禿禿的桌面（第一版空桌面被說「左邊很醜」）、不准出現任何巧克力／盒子／文字
  - 去背用 macOS Vision（`scripts/rmbg.swift`，`swiftc -O rmbg.swift -o rmbg`，不用裝 rembg）；挑沒有商標的商品照：Joyce 25 顆生巧盒（蓋子用線遮罩切掉）、18度C 生巧托盤。妮娜、CHOCOARTS、多儂、TC 包裝上都有 logo 或品牌字，不能上封面
  - 徽章與便利貼從 AI 版型圖用色彩遮罩裁下來重用；副標改「價格、克數、苦度一次看懂」（原本「片狀、生巧、夾心一次比完」聽不懂）
  - 商品照角度要跟空景一致（這次都是俯拍），斜角度的包裝照貼上去會穿幫
- 十張小編點評開頭句型已刻意錯開（第一版十張全是「…就看這盒」）

前台 ISR 約 70 分鐘後換新。GSC 顯示這頁 9/11 就已被 sitemap 收錄（舊版），2026-09-14 已按「要求建立索引」重新爬新版。GSC 網址要帶 `authuser=seo@stack.com.tw`，預設登入的 asdtodd42 沒這個資源的權限。

## 2026-09-11 要做（已完成）

1. ~~**GSC 綁定**~~ — 2026-09-11 已完成，網域資源 `spacea.com.tw` 用 seo@stack.com.tw 驗好了
2. ~~**提交 sitemap**~~ — 2026-09-11 已提交，狀態成功、發現 15 個網址
3. ~~**兩篇送索引**~~ — 2026-09-11 新店飯店、外泌體兩篇都已「要求建立索引」
4. **確認 Zeabur 部署到 `19150cd`** — 檢查前台：編者介紹（阿康／內容編輯／現職與經歷）、揭露句已無「文中不含業配」、區塊順序是常見問題→總結→參考資料、文章頁有 revalidate（WordPress 改內容一小時內會反映）
5. ~~**第三篇澳洲一日遊**~~ — 完成（post 283），還剩七個主題，動筆前先照 `docs/推薦文交件檢查清單.md` 決定「推薦對象」要選產品還是服務（卡片要圖就選產品）

## 進行中
- [ ] 寫新文章 — 十篇交辦只剩寵物用品（2026-09-21 核對；下面清單是進度）

  待寫主題（2026-09-09 交辦，十篇）：
  - [x] 外泌體保養品 — post 214 `/beauty/exosome-skincare-recommendation/`
  - [x] 新店飯店 — post 224 `/travel/xindian-hotels-guide/`（推薦文生成器，分類旅遊住宿）
  - [ ] 寵物用品
  - [x] 牙醫 — post 380 `/health/taipei-dental-implant-guide/`（客戶九日牙醫集團，題目定「台北植牙診所」；10 家：九日、佳誠、爵華、長島、裕見美、歐仕美、翡冷翠、悅庭、汐潔、重心美學（使用者指定加汐潔與三重的重心）；2026-09-15 生成＋校稿完成，見下方）
  - [ ] 料理包
  - [ ] 醫美
  - [x] 澳洲一日遊 — post 283 `/travel/australia-day-tours-guide/`（客戶老墨旅遊，8 家墨爾本／雪梨在地華語一日團；已送 GSC 索引；2026-09-11 完稿。第一版「澳洲旅遊團」比例不對已刪）
  - [x] 巧克力 — post 308 `/food/taiwan-dark-chocolate-guide/`（10 款台灣黑巧克力禮盒，客戶妮娜；2026-09-14 校完並重送 GSC 索引）
  - [x] 南投景點 — post 326 `/travel/nantou-attractions-guide/`（客戶佛羅倫斯山莊，走 B 案：10 個純景點、客戶放前言與 FAQ「住哪一區」順帶提；2026-09-14 生成＋校稿完成，見下方）
  - [ ] 膠原蛋白

## 待辦

### 已知簡化（後續要補）
- 聯絡表單（`/contact`）已可收件 — `src/app/api/contact/route.ts` 轉發到 n8n webhook「spaceA-聯絡表單通知」→ Slack #機器人測試。若之後想改成寄 email，再接 email 服務即可（webhook URL 可用 `N8N_CONTACT_WEBHOOK_URL` 覆蓋）
- 分類頁移除了「熱門」排序切換 — 原設計稿的排序是假資料（reverse），怕誤導使用者以為有真實熱門度，先只保留「最新」
- 首頁「編輯精選專題」橫幅拿掉了原設計稿的假統計數字（12,000+ 篇評論等），改成不掛數字的說法，避免不實資料
- [x] `npm run lint` 修好了 — eslint 9 + eslint-config-next 16 只吃 flat config，舊的 `.eslintrc.json` 會噴 `Converting circular structure to JSON`。改成 `eslint.config.mjs`（只 spread `eslint-config-next/core-web-vitals`，它已含 next 與 next/typescript）、script 改 `eslint .`、忽略 `design-handoff/`。順手修掉：站內 `<a>` 改 `<Link>`（about／contact／privacy／standards／terms）、`PopularRankingClient` 的 `Date.now()` 改成 `useState` lazy initializer（react-hooks/purity）

### 設計優化
- [x] 首頁與配角頁加動態（2026-09-14，文章頁不動）— 使用者說「網站豐富度很低」。全部 CSS＋一個 IntersectionObserver，`prefers-reduced-motion` 時整套關掉：
  - `components/ui/Reveal.tsx`：捲進視窗才淡入上浮的容器（`delay` 做交錯），樣式在 `globals.css` 的 `.reveal`；只有 `html.js` 時才先隱藏（`layout.tsx` 用 `next/script beforeInteractive` 加 class，`<html>` 要 `suppressHydrationWarning`），沒 JS 與爬蟲看到原樣
  - 首頁：Hero 標題／副標／標籤／按鈕逐行進場、手繪金線描邊（`.hero-in`／`.hero-line`）；主題按鈕 hover 浮起；各分類區塊 Reveal、標題旁分隔線從左長出來（`.grow-line`）、右欄四筆交錯進場、封面 hover 微放大
  - 分類頁：精選區塊 Reveal，卡片依欄位交錯進場，key 帶篩選狀態所以切類型／主題會重跑一次；卡片 hover 陰影
  - 關於我們四個區塊＋時間軸逐筆、熱門排行逐列、聯絡我們「怎麼處理來信」區塊
  - 注意：本機 `npm run build` 會把正在跑的 `npm run dev` 的 `.next` 蓋掉，dev 會噴 `Cannot find module './611.js'`，重開 dev 就好
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
- [x] 封面檔名要獨特（2026-09-21 改成 `cover-<yyyyMMdd-HHmmss>-<jobId 前 8 碼>.jpg`）— 原問題：n8n 每次都上傳 `cover.jpg`，WordPress 改名成 `cover-1.jpg` 之後被 Cloudflare 快取，換文章也拿到舊圖（post 283 一度顯示 266 的封面）。`上傳封面圖到WordPress` 的檔名要帶 slug 或時間戳
- [x] Wix 網站的卡片圖 — Wix（wixstatic.com）的 og:image 是全站共用首頁那張，翻玩墨爾本、悠游墨爾本都抓成首頁圖。`Code in JavaScript2`（抓官方頁）改成：og:image 是 wixstatic 就只給 10 分，內文的 wixstatic.com/media 圖加 90 分（有 fill/fit 尺寸參數再加 20）。post 283 兩張已手動換
- [x] 封面上傳前轉 JPEG — 新增 `封面圖壓成JPEG` 節點（Edit Image，resize 1600×900 onlyIfLarger ＋ format jpeg / quality 82），接在 `轉封面圖檔` 和 `上傳封面圖到WordPress` 之間，上傳檔名改 `cover.jpg`。實測 1.4MB PNG → 約 180KB JPEG。n8n 主機有 graphicsmagick，Edit Image 可用

### 推薦文交件檢查清單
- [ ] StackTool 生成器的預估時間要改（`/Users/kc/stacktools/app/recommendation/page.tsx`）— UI 寫「研究 1～3 分鐘」「生成 3～5 分鐘」，實測研究 5～7 分鐘、完整生成 10～16 分鐘（8～10 家）。**改好先不要 push，使用者說等他決定再觸發部署**
- [x] 商品類文章的封面：2026-09-14 post 308 定案走「AI 空景 + 真實商品去背合成」（`scripts/build_cover_scene.py` + `scripts/rmbg.swift`），不是拼貼（`build_cover_collage.py` 留著備用）。n8n 的 `封面圖提示詞` 還是 AI 畫整張，商品類跑完要手動換
- [x] Tavily 額度用完就直接回前端錯誤（2026-09-15）— 推薦文-1／1b／3 三個 workflow 入口加「Tavily額度檢查」節點（打一次 basic 搜尋，error 輸出 → 回傳失敗狀態），不再燒 LLM。key 換成新的（credential「Tavily account」）；`~/stacktools/.env.local` 的 `TAVILY_API_KEY` 還是舊的
- [x] n8n 參考資料已改（2026-09-21）：`格式化參考資料` 先列 WF2 背景來源（品牌官網網域的一律丟掉）、再列每家 `brandDetails[].reference_links` 各取 2 條社群討論串（PTT 板名／Dcard／Threads 自動標籤、跨品牌去重）。原問題：WF2 只搜關鍵字、只留摘要，抓到隱私政策這種無關頁；`格式化參考資料` 應改成列研究階段 `brandDetails[].reference_links`（社群討論串）＋有關的官方來源，不列官方產品頁。目前每篇靠手動補（見檢查清單 2b）
- [x] post 112、187 的總結已回頭改成不點名品牌、不掛 CTA（2026-09-11）
- [x] `docs/推薦文交件檢查清單.md` — 生成後的健檢流程（比較表價格、文案殘句與 B2B 殘留、卡片圖與連結、封面、SEO 前台檢查），附「推薦對象怎麼選」與「已經寫進 n8n 不用逐條人工檢」的對照表。範本文章：post 224 新店飯店

### 推薦文前言（n8n workflow `推薦文-3-完整生成`）
- [x] `前言` 節點提示詞整個重寫（2026-09-14）— 舊版要求「兩個關鍵字加粗＋連到前言連結」，生出來是「南投不像旅遊手冊那樣硬邦邦…」每篇都要重寫。新版照 post 326 校過的前言當範式：第一句具體情境或最常犯的錯 → 市場怎麼分那一句用 `<strong>`（重點句，不是關鍵字）→ 帶一兩個研究摘要裡的數字 → 客戶自然帶一句、連結只掛品牌名 → 講完就停，禁「這篇比了 N 家…各有對應」公式收尾。有把 `brands`／`brandDetails` 的摘要餵進去讓它有數字可拿。**下一篇生出來要看它有沒有照做**
- [x] `總結` 節點（2026-09-21 已改：關鍵字自然出現不加粗，<strong> 只包 1～2 句判斷句）— 原本強制「關鍵字加粗至少 1 次」，跟「加粗標重點不標關鍵字」衝突，下次順手改

### 推薦文章節標題（n8n workflow `推薦文-3-完整生成`）
- [x] 推薦清單章節的 h2 不再寫死「品牌推薦」— 新增 `章節標題` 節點（chainLlm，掛在 `抓人設` 後平行跑，共用既有 OpenRouter Chat Model），吃標題／關鍵字／品牌數／subject_type，依語意輸出一行 h2：量詞看主題（商品→款、店家公司飯店診所→家、景點→個、課程→門），商品類寫「5款外泌體保養品推薦」、店家類寫「精選8家新店飯店推薦」。`組卡片章節` 讀它的輸出，抓不到或超過 30 字就退回「品牌推薦」。節點 `onError: continueRegularOutput`，失敗不擋發文
- 已回頭手改的既有文章：post 224「精選8家新店飯店推薦」、post 214「5款外泌體保養品推薦」（含 `nav.toc` 對應那行）
- [x] 總結不再業配 — `總結` 節點原本強制「品牌名加粗至少 1 次」＋結尾置中「了解更多」連到客戶官網，太明顯。提示詞改成：總結只講「怎麼選」的判斷步驟，禁止點名任何單一品牌，結尾不加連結。post 224／214 已回頭手改（224 拿掉「需要品牌服務保障可參考白金花園」那句與官網連結；214 拿掉「了解更多」）
- [x] 「沒有就別提」：`未見／未發現／查無…獲獎／認證／紀錄` 這種沒有資訊量、又把被推薦對象寫得像有缺陷的句子，`組卡片章節` 會整條 `<li>` 或整格欄位丟掉（`NEGATIVE_FINDING`）。post 224／214 已回頭清乾淨
- [x] 品牌卡片的「官方產品頁」改成看網址判斷：連到首頁（含 /zh-tw 語系首頁）寫「官方網站」，路徑兩層以上才寫「官方產品頁」——飯店、店家寫產品頁很怪。順手把 href 夾到空白/換行的髒網址切乾淨（碧潭飯店那筆混進了圖片網址）
- [x] 比較表表頭跟著推薦對象換（2026-09-14）— 原本寫死「公司名稱／產品/服務名稱」，商品文看起來很怪。`組卡片章節` 改成 product →「品牌／產品名稱」、service →「公司名稱／服務名稱」。既有文章手改：308、214 品牌／產品名稱，283 旅行社／行程名稱，224 飯店／類型（第二欄「碧潭飯店住宿服務」這種殘句順手改成「碧潭景觀飯店」）。飯店、旅遊這種 subject_type=product 的，n8n 之後生出來還是「品牌／產品名稱」，交件時要看一眼
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
- [x] 選配：`extractConclusion` 也認「總結」（已做，`CONCLUSION_HEADING_PATTERN` 含結論／總結／Conclusion／まとめ／정리）— 原問題：— StackTool 推薦文的結論叫「總結」且放在文末，所以那些文章的「先看結論」框目前是空的。認了就能把結論前置（對 GEO 有利），但會改動既有文章版面
- [x] HowTo schema（`HowToJsonLd`）— 只給知識分享用，推薦文的 `<ol>` 是排名清單不套

### 文章頁區塊順序
- [x] 修好推薦文「總結」整段消失 — `extractConclusion` 會把總結抽去給「先看結論」框，但推薦文已經不顯示那個框，抽走就沒地方渲染。`parseArticleContent` 新增 `extractConclusion` 選項，推薦文關掉、知識分享維持原樣
- [x] 修好 hydration 錯誤 — 上一條的切法直接在 `<h2>總結</h2>` slice，切點在 StackTool 的 `<div class="ai-article-body">` wrapper 裡面，`bodyHtml` 少一個 `</div>`，瀏覽器把接在後面的 FAQ section 吞進去，DOM 跟 React 樹對不上，每篇推薦文都會噴 hydration failed。新增 `splitHtmlAt()`：切點當下還沒關的容器標籤，前半補 `</div>`、後半補回同樣的開頭標籤
- [x] 區塊順序改成 常見問題 → 總結 → 參考資料 — parser 以 `<h2>總結</h2>` 為界把內文切成 `bodyHtml` 與 `bodyTailHtml`，頁面在中間插入 FAQ；本篇目錄的「常見問題」也插到「總結」之前，跟實際順序一致

### 文章頁快取
- [x] `src/app/[category]/[slug]/page.tsx` 補上 `export const revalidate = 3600` — 原本沒設，文章頁在部署當下被靜態化後就不再更新，WordPress 改了內容要等下次部署才會反映（首頁、分類頁、sitemap 本來就有設）

### Phase 5 — ISR Webhook
- [ ] WordPress WP Webhooks plugin 設定（2026-09-18：REVALIDATE_SECRET 已設進 Zeabur，手動可用 scripts/revalidate.sh；WP→n8n 自動呼叫還沒接）
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
