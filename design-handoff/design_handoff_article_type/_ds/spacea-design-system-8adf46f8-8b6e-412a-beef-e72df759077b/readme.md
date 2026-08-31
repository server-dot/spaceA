# spaceA Design System

spaceA (`spaceA`) is a Traditional Chinese **recommendation-article publication** — 推薦文網站. A marketing/SEO team writes posts in WordPress; a Next.js 15 App Router frontend renders them. The product is a reading site: category browsing, article pages, search. There is no account system, no dashboard, no commerce.

Its own design brief, from `CLAUDE.md` in the source repo: 易讀、簡潔、現代感 — 設計服務內容，不搶風頭 ("readable, clean, modern — design serves the content, it does not compete with it"). Typography-first, generous leading, plenty of white space, dark grey text on white with one brand accent (sky-500), mobile-first.

## Sources

Built entirely from one repository:

- **https://github.com/server-dot/spaceA** (branch `main`) — Next.js 15 + TypeScript + Tailwind CSS 3.4 frontend for a headless WordPress (WPGraphQL + Yoast SEO) CMS. Every token, component and screen here was read from that code: `tailwind.config.ts`, `src/app/globals.css`, `src/components/**`, `src/app/**`. Product images were copied from `public/`.

Explore that repository directly for anything this system does not cover — it is small, readable, and is the ground truth for spaceA design work. `github.md` at this project root records the sync state.

No Figma file, brand book, deck or logo asset was provided.

## Products

One surface: **the spaceA website** (public, zh-TW). Routes: `/` home, `/[category]` listing, `/[category]/[slug]` article, `/search`, plus `/about`, `/privacy`, `/contact` and a 404. Recreated in `ui_kits/website/`.

---

## Content fundamentals

**Language.** Traditional Chinese (zh-TW), throughout, including UI labels. Latin text appears only in the wordmark (`spaceA`), product category names (3C), and the footer copyright line (`© 2025 spaceA. All rights reserved.`).

**Person.** The site says 我們 ("we") for the publication and 你 ("you", informal) for the reader — never the formal 您 in editorial copy. 您 appears only in legal text (隱私權保護政策: 本站重視您的隱私權). Follow that split.

**Tone.** Plain, useful, unhurried. Claims are concrete and hedged toward the reader's decision, not the product's excitement. Examples verbatim from the codebase:

- Tagline: 精選推薦文章，幫你找到最值得的選擇
- Hero: 推薦好物，用心分享 · 探索生活精選 | 生活品味 / 好物推薦 / 用心評論
- About: 我們為各行各業撰寫精選推薦文章，提供消費者最真實、最有價值的參考資訊。
- Empty state: 目前尚無文章。
- No results: 找不到相關文章，試試其他關鍵字
- 404: 你要找的頁面可能已移除或網址有誤。
- Error: 頁面載入時出現問題，請稍後再試。

**Casing.** Chinese has no case. The one uppercase treatment in the product is footer column headings (快速連結 / 法律聲明) with `uppercase` + `tracking-wider` applied — a typographic tic inherited from the Tailwind pattern; it visibly affects only Latin text. Do not add uppercase elsewhere.

**Punctuation.** Full-width punctuation in prose (，。「」). Ellipsis in placeholders is three ASCII dots: 搜尋文章... / 載入中... Section headings take no trailing punctuation. Middot `·` separates byline items.

**Buttons and labels** are short verb phrases with no punctuation: 載入更多, 回首頁, 重新載入, 搜尋, 關閉搜尋.

**Counts** read as "{n} 篇" for articles, 共找到 {n} 篇文章 for search results. Dates are zh-TW long form: 2025年3月14日.

**Emoji: never.** There is not one emoji in the source. Do not introduce them.

**Vibe.** Editorially neutral. No exclamation marks, no hype, no second-person imperatives beyond a plain instruction (請輸入關鍵字搜尋). Nothing is "amazing" — things are 值得 (worth it) or not.

---

## Visual foundations

**Colour.** One accent — Tailwind's sky ramp, aliased to `brand` in `tailwind.config.ts` (50/100/500/600/700; 200 and 400 appear in component classes). `brand-600 #0284c7` is the primary action and link colour; `brand-500 #0ea5e9` is the focus ring and the error-screen CTA; `brand-50/100` back badges. Everything else is Tailwind grey on white. The footer is the only dark surface (`gray-900`). No secondary hue, no semantic success/warning/danger palette exists — do not invent one.

**Type.** A single family: **Noto Sans TC** at 400 / 500 / 700, loaded via `next/font/google` with `display: swap`. No serif, no monospace, no display face. Headings are bold and near-black (`gray-900`); body is regular `gray-600`; supporting copy `gray-500`; dates `gray-400`. Sizes stay inside a short range — 12 / 14 / 16 / 20 / 24 / 30, plus 48 for the 404 numeral. Article headlines use `text-balance`. Line-height is relaxed (1.625) for body, snug (1.375) for card titles.

**Spacing & layout.** Tailwind's 4px scale. Two containers only: `max-w-6xl` (72rem) for listing pages, header and footer; `max-w-3xl` (48rem) for article and static reading pages. Gutters 16px mobile / 24px from `sm`. Header is a fixed 64px, sticky, `z-50`. Article grid gap 24px, category tile gap 16px, section padding 48px vertical, footer offset 64px from content. Nothing else is fixed-position; there is no sidebar, no sticky CTA, no cookie bar.

**Backgrounds.** White, everywhere, except the grey-900 footer. No patterns, no textures, no noise, no illustration. Full-bleed imagery appears exactly once: the homepage hero at 1920:600 capped at 600px, with its headline baked into the JPEG rather than overlaid in HTML.

**Imagery.** Warm, bright, naturalistic lifestyle photography — soft daylight, shallow depth of field, wood and cream interiors, people using products in real rooms. No hard studio cutouts, no cool blue grading, no black-and-white, no grain. Category images are photographic and cropped 4:3; article thumbnails 16:9.

**Gradients.** Only two, both functional: the bottom-up black scrim on category tiles (`from-black/70 via-black/20`) that protects the white label, and a `sky-400 → sky-600` diagonal used as the fallback when a category image is missing (plus a `gray-200 → gray-300` fallback behind missing article thumbnails, which carries the wordmark in grey). No decorative gradients — never a purple/blue mesh.

**Corner radii.** `rounded-md` 6px on nav items and icon buttons; `rounded-lg` 8px on the logo square, search input and error CTA; `rounded-xl` 12px on every card, tile, article image and skeleton block; `rounded-full` on badges and both pill buttons.

**Cards.** White, `rounded-xl`, a **1px `gray-100` hairline border and no resting shadow** — the shadow arrives on hover (`shadow-md`). Category tiles are the inverse: no border, `shadow-sm` at rest lifting to `shadow-lg`. No card ever has a coloured left border.

**Shadows.** Three steps, all Tailwind defaults: `sm` (header, tile at rest), `md` (article card hover), `lg` (tile hover). No inner shadows anywhere.

**Borders.** Hairlines only, 1px. `gray-100` for card and header edges, `gray-200` for inputs and blockquote rules, `gray-800` for the footer divider, `brand-200` for the outline button.

**Transparency & blur.** Almost none. `text-white/60` on tile counts and the tile scrim are the only transparency in the product; there is **no backdrop blur** — the sticky header is opaque white with a hairline and `shadow-sm`. Do not add glassmorphism.

**Motion.** Colour transitions 150ms; shadow/lift on cards and tiles 200ms; image zoom `scale(1.05)` 300ms. Easing is always Tailwind's default `cubic-bezier(0.4, 0, 0.2, 1)`. The only keyframe animation is `animate-pulse` on loading skeletons. No entrance animations, no parallax, no scroll reveals, no bounce.

**Hover states.** Text links darken (`gray-600 → gray-900`, `brand-600 → brand-700`); footer links go white; nav items and the search button add a `gray-100` fill; badges tint `brand-50 → brand-100`; the outline button fills `brand-50`; cards raise a shadow, zoom their image and turn the title brand-600 — all three from a single `group` hover on the card, not the image.

**Press states.** None are defined in the source. Keep to the hover treatment rather than inventing a scale-down or darker press colour.

**Focus.** A 2px `sky-500` ring on the search input (`focus:ring-2 focus:ring-sky-500`), with the default outline removed. That is the product's whole focus story.

**Skeletons.** Grey-200 blocks matching the real layout — `rounded-xl` for images and cards, `rounded-full` for short text bars — pulsing inside the page container. Loading states mirror the grid they replace; they are never spinners.

---

## Iconography

**There is no icon system.** The codebase ships exactly **two** hand-written inline SVGs, both inside `SearchBar.tsx`: a magnifier and an X. Both are 24×24 viewBox, `fill="none"`, `stroke="currentColor"`, `strokeWidth="2"`, round caps and joins — i.e. Lucide-shaped geometry, drawn inline rather than imported. They render at 18px (search) and 16px (close). No icon font, no sprite sheet, no PNG icons, no icon package in `package.json`.

Those two glyphs are copied verbatim into `components/ui/Icon.jsx`. **Use only those two.** When a UI needs an affordance the product has no glyph for, the product uses text — 載入更多, 回首頁, 麵包屑 separators are literal `/` characters, the byline separator is a literal `·`. Do that instead of adding icons.

If a future screen genuinely requires more glyphs, Lucide (24×24, 2px stroke, round caps) is the closest match to the two that exist and is the recommended substitution — flag it when you use it, since it is not in the source.

**Emoji and unicode:** the product uses `/` and `·` as separators and no other symbol characters. No emoji.

---

## Fonts

Noto Sans TC is loaded from the **Google Fonts CDN** in `tokens/fonts.css`. The source repo self-hosts nothing (it uses `next/font/google`), so there are no font binaries to copy. This is not a substitution — it is the same family and the same three weights the product ships. If you need offline/self-hosted files, download Noto Sans TC 400/500/700 and swap the `@import` for `@font-face` rules.

---

## Intentional additions

Two components have no direct file in the source and were added deliberately:

- **Button** — the product styles its three CTAs inline in `not-found.tsx`, `Pagination.tsx` and `error.tsx`. Consolidated so consumers stop re-deriving them; every value is copied from those three call sites.
- **Icon** — a wrapper around the two SVGs defined inside `SearchBar.tsx`, so they can be reused without duplicating paths.

`CategoryTile` merges the source's `CategoryGrid` tile markup with `CategoryImage.tsx` (its client-side image-failure fallback). Not built: `FooterCategories`, the SEO JSON-LD components and `apollo-client` — data plumbing with no visual surface.

---

## Index

| Path | What it is |
|---|---|
| `styles.css` | Entry point — imports every token file. Link this one file. |
| `tokens/` | `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `surfaces.css`, `base.css` |
| `components/ui/` | Badge, Button, Icon, Pagination |
| `components/layout/` | Header, Navigation, SearchBar, Breadcrumbs, Hero, CategoryGrid, CategoryTile, Footer |
| `components/article/` | ArticleCard, ArticleGrid, ArticleMeta, ArticleBody |
| `ui_kits/website/` | Click-through recreation of the whole site — see its README |
| `guidelines/` | Foundation specimen cards (Colors, Type, Spacing, Brand) |
| `assets/` | `hero-banner.jpg`, `categories/{3c,education,food,health,pets}.jpg` |
| `github.md` | Source repo + sync state |
| `SKILL.md` | Agent Skills front matter for use outside this project |

### Components

**UI:** Badge · Button · Icon · Pagination
**Layout:** Header · Navigation · SearchBar · Breadcrumbs · Hero · CategoryGrid · CategoryTile · Footer
**Article:** ArticleCard · ArticleGrid · ArticleMeta · ArticleBody

Each has a sibling `.d.ts` (props) and `.prompt.md` (what/when + usage).

### Brand mark

**There is no logo file.** The header mark is a 32px `brand-600` rounded square containing the site's initial `S`, followed by `spaceA` in 20px bold; the footer shows the wordmark alone in white. Reproduce it as type — do not draw or commission a mark.
