#!/usr/bin/env python3
"""
把 WordPress 的中文文章翻成英文版，建成另一篇文章（slug 加 -en、分類換成對應的 -en 分類）。

前台的雙語規則見 src/lib/i18n.ts：英文文章 slug = 中文 slug + "-en"，英文分類 slug = 中文分類 slug + "-en"，
前台網址 /en/travel/xxx 對應 WP 的 travel-en / xxx-en。這支腳本負責把這些東西建出來。

用法：
  python3 scripts/translate_post.py 326            # 翻 post 326，建英文版（已有就跳過）
  python3 scripts/translate_post.py 326 --lang ja  # 建日文版（--lang en/ja/ko）
  python3 scripts/translate_post.py 326 308 283    # 一次多篇
  python3 scripts/translate_post.py 326 --force    # 英文版已存在也覆蓋（用快取，不重翻）
  python3 scripts/translate_post.py 326 --retranslate  # 重新呼叫模型翻（會再燒一次額度）
  python3 scripts/translate_post.py 326 --dry-run  # 只翻、存到 scratch，不寫 WordPress
  python3 scripts/translate_post.py 326 --status draft

需要 .env.local 裡的：NEXT_PUBLIC_WORDPRESS_URL、WORDPRESS_APP_USER、WORDPRESS_APP_PASSWORD、OPENROUTER_API_KEY
（選用 OPENROUTER_MODEL，預設跟 n8n 推薦文生成器同一個 openai/gpt-5-mini）。

翻譯結果會先快取在 scripts/.translate-cache/<post id>.json，寫 WP 失敗重跑不會再燒一次 API；
要重新翻請加 --retranslate。
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = ROOT / 'scripts' / '.translate-cache'
# 語言後綴要跟前台的 src/lib/i18n.ts 對齊
LANG_SUFFIX = {'en': '-en', 'ja': '-ja', 'ko': '-ko'}
LANG_LABEL = {'en': 'English', 'ja': 'Japanese', 'ko': 'Korean'}
LANG = 'en'          # --lang 指定，預設英文
CJK_RE = '[\u4e00-\u9fff]'   # 漢字區段，中日共用
KANA_RE = '[\u3040-\u30ff]'  # 平假名＋片假名，用來分辨日文與漏翻的中文
SUFFIX = '-en'       # 跟著 LANG 走，main() 裡設定

# 各語言的固定章節譯名。生成器產出的結構固定，這些名字前台的 content-parsers 也要認得
HEADINGS = {
    'en': '前言 → "Introduction"; 總結 / 結語 / 結論 → "Conclusion"; 常見問題 / FAQ → "FAQ"; 參考資料 → "References"; '
          '小編點評 → "Editor\'s Take"; 官方資訊 → "Official Information"; 官方網站 → "Official website"; '
          '官方產品頁 → "Official product page"; 編者介紹 → "About the Editor"; 目錄 → "Contents"; '
          '一次解答 → "Quick Answer"; 判斷依據 → "How We Judged"; 網友評價 → "What Users Say"; 適合誰 → "Best For"; '
          '價格 → "Price"; 地址 → "Address"; 電話 → "Tel"',
    'ja': '前言 → 「はじめに」; 總結 / 結語 / 結論 → 「まとめ」; 常見問題 / FAQ → 「よくある質問」; 參考資料 → 「参考資料」; '
          '小編點評 → 「編集部のひとこと」; 官方資訊 → 「公式情報」; 官方網站 → 「公式サイト」; 官方產品頁 → 「公式商品ページ」; '
          '編者介紹 → 「編集者について」; 目錄 → 「目次」; 一次解答 → 「まとめて回答」; 判斷依據 → 「判断のポイント」; '
          '網友評價 → 「利用者の声」; 適合誰 → 「こんな人に」; 價格 → 「価格」; 地址 → 「住所」; 電話 → 「電話」',
    'ko': '前言 → “들어가며”; 總結 / 結語 / 結論 → “정리”; 常見問題 / FAQ → “자주 묻는 질문”; 參考資料 → “참고 자료”; '
          '小編點評 → “에디터 코멘트”; 官方資訊 → “공식 정보”; 官方網站 → “공식 사이트”; 官方產品頁 → “공식 제품 페이지”; '
          '編者介紹 → “편집자 소개”; 目錄 → “목차”; 一次解答 → “한눈에 보기”; 判斷依據 → “판단 기준”; '
          '網友評價 → “사용자 후기”; 適合誰 → “이런 분께”; 價格 → “가격”; 地址 → “주소”; 電話 → “전화”',
}

# 標點：日文沿用全形句讀，英韓改成西式
PUNCT_RULE = {
    'en': '%(punct)s',
    'ja': 'Use Japanese punctuation: 。 for periods, 、 for commas, 「」 for quotes. Do not use ASCII commas or periods in running text.',
    'ko': 'Use Korean punctuation: periods and commas in the Western style, “ ” for quotes, and the middle dot · only where Korean normally uses it.',
}
DEFAULT_MODEL = 'openai/gpt-5-mini'
# 每一段送給模型的原文上限（字元）。太長輸出會被截、太短上下文不夠，8k 左右一段大約是兩三章
CHUNK_CHARS = 8000

# 分類名稱：WP 的中文分類 → 英文站要顯示的名稱（找不到的交給模型翻）
CATEGORY_NAMES = {
    'en': {
        '3C數位': 'Tech & Gadgets', '健康醫療': 'Health & Medical', '寵物': 'Pets', '影音器材': 'Creator Gear',
        '教育學習': 'Education', '旅遊住宿': 'Travel & Stays', '汽車機車': 'Cars & Motorcycles',
        '法律服務': 'Legal Services', '生活居家': 'Home & Living', '美妝保養': 'Beauty & Skincare',
        '美食': 'Food', '行銷': 'Marketing', '運動健身': 'Fitness', '金融理財': 'Finance',
    },
    'ja': {
        '3C數位': 'デジタル・家電', '健康醫療': '健康・医療', '寵物': 'ペット', '影音器材': '撮影機材',
        '教育學習': '教育・学習', '旅遊住宿': '旅行・宿泊', '汽車機車': '車・バイク',
        '法律服務': '法律サービス', '生活居家': '暮らし・インテリア', '美妝保養': 'コスメ・スキンケア',
        '美食': 'グルメ', '行銷': 'マーケティング', '運動健身': 'スポーツ・フィットネス', '金融理財': '金融・資産運用',
    },
    'ko': {
        '3C數位': '디지털·가전', '健康醫療': '건강·의료', '寵物': '반려동물', '影音器材': '촬영 장비',
        '教育學習': '교육·학습', '旅遊住宿': '여행·숙박', '汽車機車': '자동차·오토바이',
        '法律服務': '법률 서비스', '生活居家': '생활·인테리어', '美妝保養': '뷰티·스킨케어',
        '美食': '맛집·푸드', '行銷': '마케팅', '運動健身': '운동·피트니스', '金融理財': '금융·재테크',
    },
}

SYSTEM_PROMPT = """You are a professional Traditional Chinese → %(lang)s translator for a Taiwanese consumer-recommendation website (spaceA). You translate WordPress post HTML.

Rules:
0. Translate into %(lang)s.
1. Output ONLY the translated HTML fragment. No markdown fences, no commentary, no <html>/<body> wrappers.
2. Preserve the HTML structure exactly: every tag, attribute, class, id, href, src, alt order, <style> block, <svg>, <table>, <details>, inline styles. Translate only human-readable text (text nodes, alt text, title attributes, and text inside <svg><text>). Never add, drop, merge or reorder elements. Keep the same number of <h2>, <h3>, <p>, <li>, <img>, <a>, <table>, <tr>.
3. Do not translate or alter URLs, email addresses, phone numbers, prices (keep "NT$" and the numbers as written), model numbers, or the contents of <style> blocks.
4. Section headings follow these fixed names: %(headings)s. Other headings: translate naturally, keep them as complete sentences or clear noun phrases.
5. Brand, place and product names: use the official %(lang)s name when one exists (e.g. 日月潭 → Sun Moon Lake, 清境農場 → Cingjing Farm, 妮娜巧克力 → Cona's Chocolate). If there is no known name in the target language, transliterate it (Hanyu Pinyin for mainland, common Taiwan spelling for Taiwanese places) and add the Chinese in parentheses on first mention only, e.g. "Huisun Forest (惠蓀林場)". Never leave Chinese characters in running text otherwise.
6. Tone: natural, idiomatic %(lang)s for a reader in that language who is planning to buy or visit in Taiwan. Prefer complete sentences. Convert Chinese punctuation (，。、：「」) to English punctuation; use "Q:"/"A:" for FAQ prefixes. Keep the meaning and every fact; do not summarize, embellish, or add disclaimers.
7. Currency and units stay as in the source (NT$, km, minutes). Dates stay as written.
"""

META_PROMPT = """Translate this Taiwanese recommendation article's title into %(lang)s and write a meta description in %(lang)s.

Return ONLY a JSON object: {"title": "...", "excerpt": "..."}
- title: natural %(lang)s, keep the meaning, numbers and year if present, under 70 characters, no trailing site name. Use the official %(lang)s names of places/brands.
- excerpt: 120–155 characters, one or two sentences summarizing what the article compares and what the reader gets. No Chinese characters.

Chinese title: %(title)s

First paragraphs of the article (plain text):
%(intro)s
"""


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    for line in (ROOT / '.env.local').read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


ENV = load_env()
WP = ENV.get('NEXT_PUBLIC_WORDPRESS_URL', '').rstrip('/')
WP_AUTH = base64.b64encode(f"{ENV.get('WORDPRESS_APP_USER', '')}:{ENV.get('WORDPRESS_APP_PASSWORD', '')}".encode()).decode()
OPENROUTER_KEY = ENV.get('OPENROUTER_API_KEY', '')
MODEL = ENV.get('OPENROUTER_MODEL', DEFAULT_MODEL)


def die(msg: str) -> None:
    print(f'✗ {msg}', file=sys.stderr)
    sys.exit(1)


# ---------- WordPress REST ----------

def wp(method: str, path: str, body: dict | None = None, params: dict | None = None):
    url = f'{WP}/wp-json/wp/v2/{path}'
    if params:
        url += ('&' if '?' in url else '?') + urllib.parse.urlencode(params)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('Authorization', f'Basic {WP_AUTH}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('User-Agent', 'spaceA-translate/1.0')
    raw = ''
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=180) as res:
                raw = res.read().decode()
            break
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors='replace')[:500]
            # Cloudflare 對大 payload 偶爾回 520／524，等一下重送
            if e.code >= 500 and attempt < 2:
                print(f'  ⚠ WordPress {method} {path} → HTTP {e.code}，{5 * (attempt + 1)} 秒後重試', file=sys.stderr)
                time.sleep(5 * (attempt + 1))
                continue
            die(f'WordPress {method} {path} → HTTP {e.code}: {detail}')
    # 這台 WP 的回應偶爾會在 JSON 前面多出 PHP notice 之類的雜訊，從第一個 { 或 [ 開始解
    start = min((i for i in (raw.find('{'), raw.find('[')) if i >= 0), default=-1)
    if start < 0:
        die(f'WordPress {method} {path} 回的不是 JSON：{raw[:300]}')
    try:
        return json.loads(raw[start:])
    except json.JSONDecodeError:
        end = max(raw.rfind('}'), raw.rfind(']'))
        return json.loads(raw[start:end + 1])


def get_post(post_id: int) -> dict:
    return wp('GET', f'posts/{post_id}', params={'context': 'edit'})


def find_post_by_slug(slug: str) -> dict | None:
    rows = wp('GET', 'posts', params={'slug': slug, 'status': 'any', 'context': 'edit'})
    return rows[0] if rows else None


def find_term(taxonomy: str, slug: str) -> dict | None:
    rows = wp('GET', taxonomy, params={'slug': slug})
    return rows[0] if rows else None


# ---------- OpenRouter ----------

def llm(messages: list[dict], max_tokens: int = 24000, model: str | None = None) -> str:
    """呼叫 OpenRouter。model 留空就用全域的 MODEL；審稿工具會指定另一顆模型。"""
    if not OPENROUTER_KEY:
        die('.env.local 缺 OPENROUTER_API_KEY')
    body = {
        'model': model or MODEL,
        'messages': messages,
        'max_tokens': max_tokens,
        # gpt-5 系列會先推理再輸出，翻譯不需要想太久
        'reasoning': {'effort': 'low'},
    }
    req = urllib.request.Request(
        'https://openrouter.ai/api/v1/chat/completions',
        data=json.dumps(body).encode(),
        method='POST',
    )
    req.add_header('Authorization', f'Bearer {OPENROUTER_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('HTTP-Referer', 'https://spacea.com.tw')
    req.add_header('X-Title', 'spaceA translate')
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=600) as res:
                payload = json.loads(res.read().decode())
            choice = payload['choices'][0]
            text = choice['message']['content'] or ''
            if choice.get('finish_reason') == 'length':
                raise RuntimeError('輸出被 max_tokens 截斷')
            return text.strip()
        except (urllib.error.HTTPError, urllib.error.URLError, RuntimeError, KeyError) as e:
            detail = e.read().decode(errors='replace')[:300] if isinstance(e, urllib.error.HTTPError) else str(e)
            print(f'  ⚠ OpenRouter 第 {attempt + 1} 次失敗：{detail}', file=sys.stderr)
            time.sleep(5 * (attempt + 1))
    die('OpenRouter 連續失敗三次')


def strip_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r'^```[a-zA-Z]*\s*', '', text)   # ```html、```json 都要剝掉
    text = re.sub(r'\s*```$', '', text)
    return text.strip()


# ---------- 內文切段與檢查 ----------

def split_html(html: str) -> list[str]:
    """照 <h2> 切章，再把相鄰的章併到 CHUNK_CHARS 以內。每段開頭是完整的章，模型比較不會亂掉。
    單一章超過上限（推薦清單那章常常兩三萬字）再往下照 <h3>、再照 <div> 切。"""
    parts: list[str] = []
    for section in re.split(r'(?=<h2[\s>])', html):
        if len(section) <= CHUNK_CHARS:
            parts.append(section)
            continue
        for sub in re.split(r'(?=<h3[\s>])', section):
            if len(sub) <= CHUNK_CHARS:
                parts.append(sub)
            else:
                parts.extend(re.split(r'(?=<div[\s>])', sub))
    chunks: list[str] = []
    current = ''
    for part in parts:
        if current and len(current) + len(part) > CHUNK_CHARS:
            chunks.append(current)
            current = part
        else:
            current += part
    if current:
        chunks.append(current)
    return chunks


TAG_CHECK = ['h2', 'h3', 'p', 'li', 'img', 'a', 'table', 'tr', 'details', 'svg', 'div']


def tag_counts(html: str) -> dict[str, int]:
    return {tag: len(re.findall(rf'<{tag}[\s>/]', html, flags=re.I)) for tag in TAG_CHECK}


def structure_diff(src: str, out: str) -> list[str]:
    a, b = tag_counts(src), tag_counts(out)
    return [f'{tag}: {a[tag]}→{b[tag]}' for tag in TAG_CHECK if a[tag] != b[tag]]


def _cjk_outside_parens(text: str) -> bool:
    # 括號裡保留原名是允許的，所以英韓只看括號外。
    # 日文不能這樣切：「NT$ 0（用現有手機）」整段只有括號裡是中文，切掉就抓不到了
    if LANG == 'ja':
        return looks_untranslated(text)
    return looks_untranslated(re.sub(r'[（(][^()（）]*[)）]', '', text))


def looks_untranslated(text: str) -> bool:
    """這段文字看起來是漏翻的中文嗎。

    日文的漢字跟中文同一個 Unicode 區段，不能單看有沒有漢字，否則整篇日文都會被誤判。
    改看「連續 6 個以上漢字、整段又沒有半個假名」——正常日文幾乎不會這樣寫。
    英文與韓文沒這個問題，出現兩個以上漢字就是漏翻。
    """
    if LANG == 'ja':
        # 日文句子幾乎一定有假名。有漢字卻一個假名都沒有，多半是整段沒翻到的中文。
        # 「価格」「住所」這種純漢字的日文詞也會被掃進來，但補翻那步會原樣退回，不會改壞
        return bool(re.search(CJK_RE, text)) and not re.search(KANA_RE, text)
    return bool(re.search(CJK_RE + '{2,}', text))


def has_cjk(text: str) -> bool:
    # 括號裡保留的中文原名（首次出現）是允許的，這裡只看括號外
    body = re.sub(r'<style[\s\S]*?</style>', '', text)
    # 日文要逐個文字節點看：整篇串在一起一定有假名，那樣永遠判成正常
    if LANG == 'ja':
        return any(_cjk_outside_parens(m.group(1).strip()) for m in re.finditer(r'>([^<]+)<', body))
    stripped = re.sub(r'[（(][^()（）]*[)）]', '', body)
    return looks_untranslated(re.sub(r'<[^>]+>', '', stripped))


def translate_chunk(chunk: str, index: int, total: int) -> str:
    messages = [
        {'role': 'system', 'content': SYSTEM_PROMPT % {
            'lang': LANG_LABEL[LANG], 'headings': HEADINGS[LANG], 'punct': PUNCT_RULE[LANG]}},
        {'role': 'user', 'content': f'Translate part {index + 1} of {total} of the article. Output the translated HTML only.\n\n{chunk}'},
    ]
    for attempt in range(2):
        out = strip_fences(llm(messages))
        diff = structure_diff(chunk, out)
        if not diff:
            return out
        print(f'  ⚠ 第 {index + 1} 段標籤數對不上（{", ".join(diff)}），重翻一次', file=sys.stderr)
        messages.append({'role': 'assistant', 'content': out})
        messages.append({
            'role': 'user',
            'content': 'The tag counts do not match the source (' + ', '.join(diff) +
                       '). Re-translate the same part, keeping every element exactly. Output the HTML only.',
        })
    print(f'  ⚠ 第 {index + 1} 段重翻後仍不一致，先照用，交件前要檢查', file=sys.stderr)
    return out


SVG_TEXT_RE = re.compile(r'(<(?:text|tspan|title)\b[^>]*>)([^<]*?[\u4e00-\u9fff][^<]*?)(</(?:text|tspan|title)>)')


def translate_svg_texts(html: str) -> str:
    """行程時間軸那種 SVG 的文字模型常常漏翻。把 <svg> 裡還是中文的 <text>/<tspan> 抓出來批次翻，
    英文要短（上限約中文字數的兩倍），不然會爆出 SVG 的框。"""
    svgs = list(re.finditer(r'<svg[\s\S]*?</svg>', html, flags=re.I))
    if not svgs:
        return html
    labels: list[str] = []
    for m in svgs:
        for t in SVG_TEXT_RE.finditer(m.group(0)):
            text = t.group(2).strip()
            # 日文 SVG 標籤本來就有漢字，只挑「沒有假名」的重翻
            if LANG == 'ja' and re.search(KANA_RE, text):
                continue
            if text and text not in labels:
                labels.append(text)
    if not labels:
        return html
    prompt = (
        f'Translate these labels from a travel itinerary diagram into very short {LANG_LABEL[LANG]}. Each translation must be at most '
        'twice as many characters as the Chinese label (count characters), abbreviate if needed (e.g. "min", "hr", "Day 1"). '
        'Use official place names in that language. Return ONLY a JSON object mapping each label to its translation.\n\n'
        + json.dumps(labels, ensure_ascii=False)
    )
    out = strip_fences(llm([{'role': 'user', 'content': prompt}], max_tokens=4000))
    out = re.sub(r'^```(?:json)?\s*|\s*```$', '', out)
    try:
        mapping = {k: str(v) for k, v in json.loads(out).items()}
    except (json.JSONDecodeError, AttributeError):
        print('  ⚠ SVG 文字翻譯不是合法 JSON，SVG 保留中文', file=sys.stderr)
        return html

    def fix_svg(m: re.Match) -> str:
        return SVG_TEXT_RE.sub(lambda t: t.group(1) + mapping.get(t.group(2).strip(), t.group(2)) + t.group(3), m.group(0))

    print(f'  SVG 內 {len(labels)} 個標籤另外翻')
    return re.sub(r'<svg[\s\S]*?</svg>', fix_svg, html, flags=re.I)


def translate_leftovers(html: str) -> str:
    """模型偶爾整段漏翻（常見是卡片裡的 <dt> 標籤、產品名、alt）。把括號外還有中文的文字節點與 alt/title
    抓出來批次補翻，再原位換回去。括號裡保留的中文原名不算漏翻。"""
    body = re.sub(r'<style[\s\S]*?</style>', '', html)
    nodes = {m.group(1).strip() for m in re.finditer(r'>([^<]*[\u4e00-\u9fff][^<]*)<', body)}
    attrs = {m.group(1) for m in re.finditer(r'(?:alt|title)="([^"]*[\u4e00-\u9fff][^"]*)"', body)}
    targets = sorted(t for t in nodes | attrs if t and _cjk_outside_parens(t))
    if not targets:
        return html
    prompt = (
        f'These are leftover fragments from a Chinese→{LANG_LABEL[LANG]} translation of a Taiwanese product-recommendation article. '
        f'Translate each fragment into natural {LANG_LABEL[LANG]}. '
        'If a fragment is already correct in the target language, return it unchanged — Japanese words written only in '
        'kanji (価格, 住所, 編集部) are already correct, do not touch them. '
        'Keep brand/product names that are '
        'already romanised, and keep prices and numbers. '
        'Chinese inside parentheses only stays as-is when it is a brand, place or product name kept as a gloss; '
        'an ordinary Chinese phrase in parentheses (e.g. 用現有手機) must be translated like the rest. '
        'For a brand or product name with no known name in the target language, transliterate it and add the Chinese in parentheses once. '
        f'Use these fixed section names: {HEADINGS[LANG]}. '
        'Return ONLY a JSON object mapping each original fragment to its translation.\n\n' + json.dumps(targets, ensure_ascii=False)
    )
    out = strip_fences(llm([{'role': 'user', 'content': prompt}], max_tokens=6000))
    out = re.sub(r'^```(?:json)?\s*|\s*```$', '', out)
    try:
        mapping = {k: str(v) for k, v in json.loads(out).items() if v}
    except (json.JSONDecodeError, AttributeError):
        print('  ⚠ 補翻結果不是合法 JSON，殘留中文先不動', file=sys.stderr)
        return html
    print(f'  補翻 {len(mapping)} 個漏翻片段')

    def fix_node(m: re.Match) -> str:
        text = m.group(1)
        key = text.strip()
        return '>' + text.replace(key, mapping[key]) + '<' if key in mapping else m.group(0)

    def fix_attr(m: re.Match) -> str:
        return f'{m.group(1)}="{mapping.get(m.group(2), m.group(2))}"'

    def fix_block(chunk: str) -> str:
        chunk = re.sub(r'>([^<]*[\u4e00-\u9fff][^<]*)<', fix_node, chunk)
        return re.sub(r'(alt|title)="([^"]*[\u4e00-\u9fff][^"]*)"', fix_attr, chunk)

    # <style> 裡的東西不動：切開處理再接回去
    parts = re.split(r'(<style[\s\S]*?</style>)', html)
    return ''.join(part if part.startswith('<style') else fix_block(part) for part in parts)


CJK_PUNCT = {'：': ': ', '、': ', ', '，': ', ', '。': '. ', '；': '; ', '！': '! ', '？': '? ', '「': '"', '」': '"'}
CJK_PUNCT_RE = re.compile('[' + ''.join(re.escape(k) for k in CJK_PUNCT) + ']')


def normalize_punct(html: str) -> str:
    """模型翻完常留下全形冒號、頓號（「Address：」「Aqua、Glycerin」）。只動文字節點，不碰標籤與 <style>。

    日文本來就用 。、「」，這一步整個跳過，不然會把正常日文改壞。
    """
    if LANG == 'ja':
        return html
    def fix_text(m: re.Match) -> str:
        text = CJK_PUNCT_RE.sub(lambda p: CJK_PUNCT[p.group(0)], m.group(1))
        return '>' + re.sub(r'[ \t]{2,}', ' ', text) + '<'

    parts = re.split(r'(<style[\s\S]*?</style>)', html)
    return ''.join(part if part.startswith('<style') else re.sub(r'>([^<]*)<', fix_text, part) for part in parts)


def translate_meta(title: str, html: str) -> dict:
    text = re.sub(r'<nav[\s\S]*?</nav>|<style[\s\S]*?</style>', '', html)
    paragraphs = [re.sub(r'<[^>]+>', '', p).strip() for p in re.findall(r'<p[^>]*>([\s\S]*?)</p>', text)]
    intro = '\n'.join(p for p in paragraphs if len(p) > 30)[:1500]
    out = strip_fences(llm([{'role': 'user', 'content': META_PROMPT % {
        'lang': LANG_LABEL[LANG], 'title': title, 'intro': intro}}], max_tokens=2000))
    out = re.sub(r'^```(?:json)?\s*|\s*```$', '', out)
    try:
        data = json.loads(out)
    except json.JSONDecodeError:
        die(f'標題／摘要不是合法 JSON：{out[:200]}')
    if not data.get('title') or not data.get('excerpt'):
        die(f'標題／摘要缺欄位：{out[:200]}')
    return data


def translate_names(names: list[str], kind: str) -> dict[str, str]:
    """分類／標籤名稱批次翻譯，回傳 {中文: 英文}"""
    if not names:
        return {}
    prompt = (
        f'Translate these Taiwanese website {kind} names into short {LANG_LABEL[LANG]} labels (1–4 words each). '
        'Return ONLY a JSON object mapping each original name to its label in that language.\n\n'
        + json.dumps(names, ensure_ascii=False)
    )
    out = strip_fences(llm([{'role': 'user', 'content': prompt}], max_tokens=2000))
    out = re.sub(r'^```(?:json)?\s*|\s*```$', '', out)
    try:
        data = json.loads(out)
    except json.JSONDecodeError:
        die(f'{kind} 名稱翻譯不是合法 JSON：{out[:200]}')
    return {k: str(v) for k, v in data.items()}


# ---------- 建分類／標籤 ----------

def slugify(name: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return slug or 'tag'


def ensure_target_terms(taxonomy: str, ids: list[int], kind: str) -> list[int]:
    """每個中文 term 找或建對應的 -en term，回傳英文 term 的 id 列表"""
    if not ids:
        return []
    sources = [wp('GET', f'{taxonomy}/{tid}') for tid in ids]
    # 先把英文名稱都準備好：對照表沒有的批次丟給模型
    # 已經建過的先找出來：ascii slug 直接用 slug-en 查；中文 slug（WP 存成 %e5%8d… 百分比編碼）
    # 的英文版 slug 是從英文名稱轉的，每次翻名字結果可能不同，所以建的時候把中文原名寫進 description，查的時候靠它對回來
    existing_by_name: dict[str, dict] = {}
    target_terms: list[dict] | None = None  # WP 的 search 只比對 name/slug 不比對 description，所以整批抓回來自己比
    for src in sources:
        if re.fullmatch(r'[a-z0-9-]+', src['slug']):
            found = find_term(taxonomy, src['slug'] + SUFFIX)
        else:
            if target_terms is None:
                target_terms = wp('GET', taxonomy, params={'search': SUFFIX, 'per_page': 100})
            found = next((r for r in target_terms if r['slug'].endswith(SUFFIX) and r.get('description') == src['name']), None)
        if found:
            existing_by_name[src['name']] = found

    table = CATEGORY_NAMES[LANG]
    names = {src['name']: table.get(src['name']) for src in sources if src['name'] not in existing_by_name}
    need_llm = [n for n, v in names.items() if not v]
    if need_llm:
        names.update(translate_names(need_llm, kind))

    result: list[int] = []
    for src in sources:
        if src['name'] in existing_by_name:
            result.append(existing_by_name[src['name']]['id'])
            continue
        ascii_slug = bool(re.fullmatch(r'[a-z0-9-]+', src['slug']))
        base = src['slug'] if ascii_slug else slugify(names[src['name']] or src['name'])
        body = {'name': names[src['name']], 'slug': base + SUFFIX}
        if not ascii_slug:
            body['description'] = src['name']
        if src.get('description'):
            # 分類描述在前台分類頁會顯示，也翻成英文
            body['description'] = strip_fences(llm([
                {'role': 'user', 'content': f'Translate this category description into natural {LANG_LABEL[LANG]}. Output only the text.\n\n' + src['description']}
            ], max_tokens=1000))
        created = wp('POST', taxonomy, body)
        print(f'  ＋ 建立 {kind} {created["slug"]}（{created["name"]}）')
        result.append(created['id'])
    return result


# ---------- 主流程 ----------

def translate_post(post_id: int, force: bool, dry_run: bool, status: str, retranslate: bool = False) -> None:
    post = get_post(post_id)
    slug = post['slug']
    if any(slug.endswith(x) for x in LANG_SUFFIX.values()):
        die(f'post {post_id}（{slug}）本身就是翻譯版，不能再翻')
    target_slug = slug + SUFFIX
    title = post['title']['raw']
    content = post['content']['raw']
    print(f'▶ post {post_id} {title}')

    existing = find_post_by_slug(target_slug)
    if existing and not force:
        print(f'  已有{LANG_LABEL[LANG]}版 post {existing["id"]}（{target_slug}），要重翻請加 --force')
        return

    CACHE_DIR.mkdir(exist_ok=True)
    cache_file = CACHE_DIR / f'{post_id}.{LANG}.json'
    cached = json.loads(cache_file.read_text()) if cache_file.exists() and not retranslate else None
    if cached and cached.get('source_modified') == post['modified']:
        print('  使用快取的翻譯（來源沒改過）')
        translated = cached
    else:
        chunks = split_html(content)
        print(f'  內文 {len(content)} 字元，切成 {len(chunks)} 段，模型 {MODEL}')
        out_chunks = []
        for i, chunk in enumerate(chunks):
            print(f'  翻譯第 {i + 1}/{len(chunks)} 段（{len(chunk)} 字元）…')
            out_chunks.append(translate_chunk(chunk, i, len(chunks)))
        en_content = normalize_punct(translate_leftovers(translate_svg_texts(''.join(out_chunks))))
        meta = translate_meta(title, content)
        translated = {
            'source_modified': post['modified'],
            'title': meta['title'],
            'excerpt': meta['excerpt'],
            'content': en_content,
        }
        cache_file.write_text(json.dumps(translated, ensure_ascii=False, indent=1))
        print(f'  翻譯完成，快取在 {cache_file.relative_to(ROOT)}')

    # 舊快取也補跑 SVG 與漏翻檢查（新翻的在上面已經跑過，這裡查不到東西就直接回傳）
    if SVG_TEXT_RE.search(translated['content']) or has_cjk(translated['content']):
        translated['content'] = translate_leftovers(translate_svg_texts(translated['content']))
        cache_file.write_text(json.dumps(translated, ensure_ascii=False, indent=1))
    if CJK_PUNCT_RE.search(re.sub(r'<style[\s\S]*?</style>', '', translated['content'])):
        translated['content'] = normalize_punct(translated['content'])
        cache_file.write_text(json.dumps(translated, ensure_ascii=False, indent=1))
    if has_cjk(translated['content']):
        cleaned = re.sub(r'[（(][^()（）]*[)）]', '', re.sub(r'<style[\s\S]*?</style>', '', translated['content']))
        leftovers = [m for m in re.findall(r'[\u4e00-\u9fff][^<]{0,24}', cleaned) if looks_untranslated(m)]
        print(f'  ⚠ 內文括號外還有中文字，交件前要看一下：{"、".join(leftovers[:8])}', file=sys.stderr)
    diff = structure_diff(content, translated['content'])
    if diff:
        print(f'  ⚠ 整篇標籤數跟原文不同：{", ".join(diff)}', file=sys.stderr)

    print(f'  英文標題：{translated["title"]}')
    print(f'  摘要：{translated["excerpt"]}')
    if dry_run:
        out_html = CACHE_DIR / f'{post_id}.html'
        out_html.write_text(translated['content'])
        print(f'  --dry-run：HTML 存在 {out_html.relative_to(ROOT)}，沒寫 WordPress')
        return

    category_ids = ensure_target_terms('categories', post.get('categories', []), 'category')
    tag_ids = ensure_target_terms('tags', post.get('tags', []), 'tag')
    body = {
        'title': translated['title'],
        'slug': target_slug,
        'content': translated['content'],
        'excerpt': translated['excerpt'],
        'status': status,
        'categories': category_ids,
        'tags': tag_ids,
        'featured_media': post.get('featured_media', 0),
    }
    if post.get('article_type'):
        body['article_type'] = post['article_type']

    if existing:
        saved = wp('POST', f'posts/{existing["id"]}', body)
        print(f'  ✓ 更新譯文 post {saved["id"]}：{saved["link"]}')
    else:
        saved = wp('POST', 'posts', body)
        print(f'  ✓ 建立譯文 post {saved["id"]}：{saved["link"]}')
    cat_slug = wp('GET', f'categories/{category_ids[0]}')['slug'] if category_ids else ''
    route_cat = cat_slug[: -len(SUFFIX)] if cat_slug.endswith(SUFFIX) else cat_slug
    print(f'  前台：{ENV.get("NEXT_PUBLIC_SITE_URL", "")}/{LANG}/{route_cat}/{slug}（ISR 最多一小時後換新）')


def main() -> None:
    global MODEL, LANG, SUFFIX
    parser = argparse.ArgumentParser(description='把 WordPress 中文文章翻成英文版')
    parser.add_argument('post_ids', nargs='+', type=int)
    parser.add_argument('--force', action='store_true', help='英文版已存在也覆蓋（翻譯有快取就直接用）')
    parser.add_argument('--retranslate', action='store_true', help='不用快取，重新呼叫模型翻')
    parser.add_argument('--dry-run', action='store_true', help='只翻譯存快取，不寫 WordPress')
    parser.add_argument('--status', default='publish', choices=['publish', 'draft'])
    parser.add_argument('--model', help=f'OpenRouter 模型（預設 {MODEL}）')
    parser.add_argument('--lang', default='en', choices=sorted(LANG_SUFFIX), help='目標語言（預設 en）')
    args = parser.parse_args()

    if args.model:
        MODEL = args.model
    LANG = args.lang
    SUFFIX = LANG_SUFFIX[LANG]
    if not WP or not ENV.get('WORDPRESS_APP_PASSWORD'):
        die('.env.local 缺 NEXT_PUBLIC_WORDPRESS_URL 或 WORDPRESS_APP_USER/PASSWORD')

    for post_id in args.post_ids:
        translate_post(post_id, force=args.force or args.retranslate, dry_run=args.dry_run, status=args.status, retranslate=args.retranslate)


if __name__ == '__main__':
    main()
