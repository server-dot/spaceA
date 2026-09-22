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

翻譯結果會先快取在 scripts/.translate-cache/<post id>.<lang>.json，寫 WP 失敗重跑不會再燒一次 API。
原文改過再跑 --force 時只翻改過的段落：拿 WP 修訂版當上次的原文，逐段對 hash，沒改的段沿用 WP 上現在的譯文
（手動改過的名字、數字都保得住）。要整篇重翻請加 --retranslate。
"""

from __future__ import annotations

import argparse
import base64
import hashlib
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

# 專有名詞：英文用官方英文名或拼音；日文讀者直接讀漢字，不要塞英文；韓文用韓文音譯＋括號漢字
NAME_RULE = {
    'en': 'use the official English name when one exists (e.g. 日月潭 → Sun Moon Lake, 清境農場 → Cingjing Farm, '
          '妮娜巧克力 → Cona\'s Chocolate). If there is no known English name, transliterate it (Hanyu Pinyin for mainland, '
          'common Taiwan spelling for Taiwanese places) and add the Chinese in parentheses on first mention only, '
          'e.g. "Huisun Forest (惠蓀林場)". Never leave Chinese characters in running text otherwise.',
    'ja': 'Japanese readers read kanji directly. Keep Taiwanese place, brand and product names in their original kanji '
          '(日月潭, 清境農場, 妮娜巧克力, 九族文化村) — do NOT replace them with English or pinyin, and do not add an '
          'English name in parentheses. Western brand names (Nobel Biocare, Straumann, Osstem, BioHorizons, Neobiotech) '
          'stay in Latin letters exactly as written — NEVER invent a katakana reading for a brand. '
          'A well-known Japanese name for a place may be used (e.g. 台北 stays 台北).',
    'ko': 'Write Taiwanese place, brand and product names in hangul by their MANDARIN pronunciation following 외래어 표기법 '
          '(九日 → 주르, 重心 → 중신, 佳誠 → 자청, 悅庭 → 위에팅, 日月潭 → 르웨탄, 清境農場 → 칭징 농장), never the Korean '
          'hanja reading (not 구일, 중심, 가성, 월정), and never pinyin or an English rendering (not Long Island for 長島). '
          'Pick ONE hangul form per name and use exactly that form everywhere in the article. Add the original Chinese '
          'in parentheses on first mention only, e.g. 칭징 농장(清境農場). Western brand names (Nobel Biocare, Straumann, '
          'Osstem) stay in Latin letters as written — do not invent a hangul spelling for a brand.',
}

# 標點：日文沿用全形句讀，英韓改成西式
CURRENCY_RULE = {
    'en': 'Write full digits: 三萬八 → NT$38,000; 6 到 10 萬 → NT$60,000–100,000; 300 萬元 → NT$3 million (NT$3,000,000).',
    'ja': 'Japanese readers use 万: 三萬八 → NT$3.8万 or NT$38,000; 6 到 10 萬 → NT$6〜10万; 300 萬元 → NT$300万.',
    'ko': 'Write full digits, never 万/萬 and never the Chinese 到: 三萬八 → NT$38,000; 6 到 10 萬 → NT$60,000~100,000; 300 萬元 → NT$3,000,000.',
}

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
5. Brand, place and product names: %(names)s
6. Tone: natural, idiomatic %(lang)s for a reader in that language who is planning to buy or visit in Taiwan. Prefer complete sentences. Convert Chinese punctuation (，。、：「」) to English punctuation; use "Q:"/"A:" for FAQ prefixes. Keep the meaning and every fact; do not summarize, embellish, or add disclaimers.
7. Domain terminology must be the standard term of the target language, not a character-by-character copy of the Chinese term. Dental examples — Japanese: 單顆 → 1本, 全口重建 → 全顎再建（フルマウス）, 植體 → インプラント体, 補骨 → 骨造成, 舒眠 → 静脈内鎮静; Korean: 單顆 → 1개, 全口重建 → 전악 재건, 植體 → 임플란트 픽스처, 補骨 → 골이식, 舒眠 → 수면마취. Apply the same principle to every field (travel, skincare, marketing).
8. Currency: every Taiwan dollar amount gets the NT$ prefix and keeps the source's magnitude exactly. %(currency)s A bare 元/万元/円/원 will be read as the reader's own currency, and 萬 must never turn into 円 or 원. Units stay as in the source (km, minutes); 公尺 becomes m or the target language's word for metre. Dates stay as written.
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

def _looks_complete_json(raw: str) -> bool:
    start = min((i for i in (raw.find('{'), raw.find('[')) if i >= 0), default=-1)
    if start < 0:
        return False
    try:
        json.loads(raw[start:])
        return True
    except json.JSONDecodeError:
        end = max(raw.rfind('}'), raw.rfind(']'))
        try:
            json.loads(raw[start:end + 1])
            return True
        except json.JSONDecodeError:
            return False


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
            # 回應偶爾被截斷（Cloudflare 中途斷線），解不出 JSON 就當它沒回，重抓一次；建立文章除外
            if method == 'GET' and not _looks_complete_json(raw) and attempt < 2:
                print(f'  ⚠ WordPress {method} {path} 回應不完整，重抓', file=sys.stderr)
                time.sleep(3)
                continue
            break
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors='replace')[:500]
            # Cloudflare 對大 payload 偶爾回 520／524，等一下重送。
            # 但「建立文章」不能重送——WP 可能已經建好了，重送會多一篇；那條路由交給呼叫端用 slug 補救
            is_create = method == 'POST' and path == 'posts'
            if e.code >= 500 and attempt < 2 and not is_create:
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

def split_parts(html: str) -> list[str]:
    """照 <h2> 切章，單一章超過上限（推薦清單那章常常兩三萬字）再往下照 <h3>、再照 <div> 切。
    這是「局部重翻」的最小單位：每一小段對原文算 hash，原文沒改的段直接沿用上次的譯文。"""
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
    return [p for p in parts if p]


def split_like(source: str, translated: str) -> list[str] | None:
    """把譯文切成跟 split_parts(source) 一樣多的段：切法完全照原文的長度決定（譯文通常比中文長，
    直接對譯文跑 split_parts 會多切出幾段對不上）。哪一層對不齊就回 None。"""
    out: list[str] = []
    src_h2 = [x for x in re.split(r'(?=<h2[\s>])', source) if x]
    tr_h2 = [x for x in re.split(r'(?=<h2[\s>])', translated) if x]
    if len(src_h2) != len(tr_h2):
        return None
    for sec, tsec in zip(src_h2, tr_h2):
        if len(sec) <= CHUNK_CHARS:
            out.append(tsec)
            continue
        src_h3 = [x for x in re.split(r'(?=<h3[\s>])', sec) if x]
        tr_h3 = [x for x in re.split(r'(?=<h3[\s>])', tsec) if x]
        if len(src_h3) != len(tr_h3):
            return None
        for sub, tsub in zip(src_h3, tr_h3):
            if len(sub) <= CHUNK_CHARS:
                out.append(tsub)
                continue
            src_div = [x for x in re.split(r'(?=<div[\s>])', sub) if x]
            tr_div = [x for x in re.split(r'(?=<div[\s>])', tsub) if x]
            if len(src_div) != len(tr_div):
                return None
            out.extend(tr_div)
    return out


def part_hash(part: str) -> str:
    return hashlib.sha1(part.strip().encode()).hexdigest()[:16]


def merge_parts(parts: list[str]) -> list[str]:
    """把相鄰的小段併到 CHUNK_CHARS 以內再送模型，每段開頭是完整的章，模型比較不會亂掉。"""
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


def split_html(html: str) -> list[str]:
    return merge_parts(split_parts(html))


def previous_source(post_id: int, modified: str) -> str | None:
    """上次翻譯時的原文：WP 修訂版裡 modified 對得上的那一版。"""
    try:
        revs = wp('GET', f'posts/{post_id}/revisions', params={'per_page': 50, 'context': 'edit'})
    except SystemExit:
        return None
    for rev in revs:
        if rev.get('modified') == modified or rev.get('date') == modified:
            return rev['content']['raw']
    return None


def reusable_parts(post_id: int, cached: dict | None, existing: dict | None) -> dict[str, str]:
    """局部重翻用：把上次翻譯的原文切段算 hash，對上譯文切出來的同位置段落。
    譯文優先拿 WP 上現在那篇（手動修過的名字、數字都在那裡），沒有才用快取。"""
    if not cached:
        return {}
    old_src = previous_source(post_id, cached.get('source_modified', ''))
    if not old_src:
        return {}
    translated = (existing or {}).get('content', {}).get('raw') or cached.get('content', '')
    old_parts = split_parts(old_src)
    tr_parts = split_like(old_src, translated)
    if not tr_parts or not old_parts:
        print('  ⚠ 舊譯文的章節數跟舊原文對不起來，整篇重翻', file=sys.stderr)
        return {}
    return {part_hash(src): out for src, out in zip(old_parts, tr_parts)}


def translate_parts(parts: list[str], reuse: dict[str, str]) -> list[str]:
    """原文段有舊譯文就沿用，沒有的併成大段送模型；模型回來的段落切不回同樣的段數就一段一段翻。"""
    out: list[str | None] = [reuse.get(part_hash(p)) for p in parts]
    todo = [i for i, o in enumerate(out) if o is None]
    print(f'  {len(parts)} 段裡沿用 {len(parts) - len(todo)} 段、要翻 {len(todo)} 段')
    if not todo:
        return [o or '' for o in out]
    # 相鄰的待翻段併在一起送
    groups: list[list[int]] = []
    for i in todo:
        if groups and groups[-1][-1] == i - 1 and sum(len(parts[j]) for j in groups[-1]) + len(parts[i]) <= CHUNK_CHARS:
            groups[-1].append(i)
        else:
            groups.append([i])
    for g_index, group in enumerate(groups):
        chunk = ''.join(parts[i] for i in group)
        print(f'  翻譯第 {g_index + 1}/{len(groups)} 批（{len(group)} 段、{len(chunk)} 字元）…')
        result = translate_chunk(chunk, g_index, len(groups))
        pieces = split_like(chunk, result)
        if pieces and len(pieces) == len(group):
            for i, piece in zip(group, pieces):
                out[i] = piece
        else:
            print(f'  ⚠ 這批回來的章節切不回原本的 {len(group)} 段，改成逐段翻', file=sys.stderr)
            for i in group:
                out[i] = translate_chunk(parts[i], g_index, len(groups))
    return [o or '' for o in out]


# 卡片裡的固定標籤（dt、評價欄標題、使用感受／回購那兩行、小編點評）每段是分開翻的，
# 模型每次選字都不一樣（Pricing／Pricing model／Price…），同一篇八張卡會出現三四種寫法。
# 這些標籤在原文是固定字串，翻完照原文的順序逐個換成統一譯法。
LABELS: dict[str, dict[str, str]] = {
    '產品定位': {'en': 'Product positioning', 'ja': '商品の位置づけ', 'ko': '상품 포지셔닝'},
    '服務定位': {'en': 'Service positioning', 'ja': 'サービスの位置づけ', 'ko': '서비스 포지셔닝'},
    '景點定位': {'en': 'About the spot', 'ja': '観光地の位置づけ', 'ko': '관광지 포지셔닝'},
    '產品價格': {'en': 'Price', 'ja': '価格', 'ko': '가격'},
    '收費模式': {'en': 'Pricing', 'ja': '料金体系', 'ko': '요금 체계'},
    '門票': {'en': 'Admission', 'ja': '入場料', 'ko': '입장료'},
    '官網價格': {'en': 'Official price', 'ja': '公式価格', 'ko': '공식 가격'},
    '每包膠原蛋白': {'en': 'Collagen per pack', 'ja': '1包あたりのコラーゲン', 'ko': '1포당 콜라겐'},
    '主要特色': {'en': 'Key features', 'ja': '主な特徴', 'ko': '주요 특징'},
    '主要規格': {'en': 'Key specs', 'ja': '主な仕様', 'ko': '주요 사양'},
    '核心功能': {'en': 'Core functions', 'ja': '主な機能', 'ko': '핵심 기능'},
    '保固期限': {'en': 'Warranty', 'ja': '保証期間', 'ko': '보증 기간'},
    '隨附配件': {'en': 'Included accessories', 'ja': '付属品', 'ko': '구성품'},
    '核心成分': {'en': 'Key ingredients', 'ja': '主要成分', 'ko': '핵심 성분'},
    '劑量': {'en': 'Dosage', 'ja': '配合量', 'ko': '용량'},
    '劑型': {'en': 'Form', 'ja': '剤形', 'ko': '제형'},
    '複方成分': {'en': 'Other ingredients', 'ja': 'その他の成分', 'ko': '기타 성분'},
    '包裝份量': {'en': 'Pack size', 'ja': '内容量', 'ko': '포장 단위'},
    '產地': {'en': 'Origin', 'ja': '原産地', 'ko': '원산지'},
    '適用場景': {'en': 'Best for', 'ja': '適したシーン', 'ko': '적합한 상황'},
    '適合怎麼玩': {'en': 'How to enjoy it', 'ja': '楽しみ方', 'ko': '즐기는 방법'},
    '官方資訊': {'en': 'Official information', 'ja': '公式情報', 'ko': '공식 정보'},
    '網友正面評價': {'en': 'What users like', 'ja': '利用者の声（良い点）', 'ko': '사용자 긍정 후기'},
    '網友負面評價': {'en': 'What users complain about', 'ja': '利用者の声（悪い点）', 'ko': '사용자 부정 후기'},
    '實際使用感受：': {'en': 'Hands-on impressions: ', 'ja': '使用感：', 'ko': '실제 사용 후기: '},
    '回購傾向：': {'en': 'Likelihood to repurchase: ', 'ja': 'リピート意向：', 'ko': '재구매 의향: '},
    '合作體驗：': {'en': 'Working experience: ', 'ja': '取引の実感：', 'ko': '협업 경험: '},
    '續約意願：': {'en': 'Likelihood to renew: ', 'ja': '契約更新の意向：', 'ko': '재계약 의향: '},
    '入住體驗：': {'en': 'Stay experience: ', 'ja': '宿泊体験：', 'ko': '투숙 경험: '},
    '回訪意願：': {'en': 'Likelihood to return: ', 'ja': '再訪の意向：', 'ko': '재방문 의향: '},
    '小編點評': {'en': "Editor's take", 'ja': '編集部のひとこと', 'ko': '에디터 코멘트'},
}
LABEL_SLOTS = [
    re.compile(r'(<dt>)(.*?)(</dt>)'),
    re.compile(r'(<p class="col-title">)(.*?)(</p>)'),
    re.compile(r'(<p class="repurchase-line"><strong>)(.*?)(</strong>)'),
    re.compile(r'(<span class="lbl">)(.*?)(</span>)'),
]


def normalize_labels(source: str, translated: str) -> str:
    """照原文順序把卡片固定標籤換成統一譯法；某一種標籤的數量對不上就那一種不動。"""
    for pat in LABEL_SLOTS:
        src = [m.group(2).strip() for m in pat.finditer(source)]
        tr = list(pat.finditer(translated))
        if len(src) != len(tr):
            continue
        out = []
        last = 0
        for m, label in zip(tr, src):
            canon = LABELS.get(label, {}).get(LANG)
            out.append(translated[last:m.start()])
            out.append(m.group(1) + (canon if canon else m.group(2)) + m.group(3))
            last = m.end()
        out.append(translated[last:])
        translated = ''.join(out)
    return translated


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


# 台灣繁體用、現代日文不用（日文用新字體或根本沒這個字）的字。日文段落裡出現這些字，幾乎就是中文沒翻到
TRAD_ONLY_RE = re.compile('[這們說於與從個兩內訊網價產發點樂藝會學對關應數實處廠廣齒醫觀纖顆嚴寶靈繼續讓體麼嗎呢吧嘛沒隻餘裡裏覺臺灣擁團國圖劃劑圓區歲單邊幫證讚驗鹽鐵錄雙雜顏驅髮鬆麵黃齊經來當將條總樣顯戶擇據險傳盡舊帶聯壓讀鑽濟變營緣號狀輕徵譯齡靜聲賣賴賺賽轉辦釋鏈閱參圍壘寫覽詢氣鍊隨]')


# 每個字日文都有、但組起來是中文詞的（服務、收費、品牌…），也當漏翻
ZH_WORD_RE = re.compile('服務|收費|情境|官方|品牌|療程|諮詢|洽詢|評價|網友|優惠|適合|價格|價位|方案|說明|查詢|預約|營業|地址|門票|住宿|飯店|景點|建議|總結|前言|常見|參考資料|小編|點評|對象|主打|資訊|需求|模式')


def looks_untranslated(text: str) -> bool:
    """這段文字看起來是漏翻的中文嗎。

    日文的漢字跟中文同一個 Unicode 區段，不能單看有沒有漢字，否則整篇日文都會被誤判。
    改看「連續 6 個以上漢字、整段又沒有半個假名」——正常日文幾乎不會這樣寫。
    英文與韓文沒這個問題，出現兩個以上漢字就是漏翻。
    """
    if LANG == 'ja':
        # 日文句子幾乎一定有假名。有漢字卻一個假名都沒有，再看裡面有沒有「現代日文不用的繁體字」
        # （這、們、說、與、體…），有才算漏翻；不然「目次」「入場券」「公式情報」每次都被抓去補翻，白燒額度
        return bool(re.search(CJK_RE, text)) and not re.search(KANA_RE, text) and bool(TRAD_ONLY_RE.search(text) or ZH_WORD_RE.search(text))
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
            'lang': LANG_LABEL[LANG], 'headings': HEADINGS[LANG], 'punct': PUNCT_RULE[LANG], 'names': NAME_RULE[LANG],
            'currency': CURRENCY_RULE[LANG]}},
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
    prompt_head = (
        f'These are leftover fragments from a Chinese→{LANG_LABEL[LANG]} translation of a Taiwanese product-recommendation article. '
        f'Translate each fragment into natural {LANG_LABEL[LANG]}. '
        'If a fragment is already correct in the target language, return it unchanged — Japanese words written only in '
        'kanji (価格, 住所, 編集部) are already correct, do not touch them. '
        'Keep brand/product names that are '
        'already romanised, and keep prices and numbers. '
        'Chinese inside parentheses only stays as-is when it is a brand, place or product name kept as a gloss; '
        'an ordinary Chinese phrase in parentheses (e.g. 用現有手機) must be translated like the rest. '
        + ('Taiwanese place, brand, clinic and product names stay in their original kanji exactly as given (九日牙醫集團, 汐潔牙醫診所) — '
           'do NOT transliterate them into katakana and do not add parentheses. ' if LANG == 'ja' else
           'For a brand or product name with no known name in the target language, transliterate it and add the Chinese in parentheses once. ')
        + f'Use these fixed section names: {HEADINGS[LANG]}. '
        'Return ONLY a JSON object mapping each original fragment to its translation.\n\n'
    )
    # 一次全送會爆 max_tokens（10 家品牌的文章可能有上百個片段），分批送
    mapping: dict[str, str] = {}
    for i in range(0, len(targets), 40):
        batch = targets[i:i + 40]
        out = strip_fences(llm(
            [{'role': 'user', 'content': prompt_head + json.dumps(batch, ensure_ascii=False)}],
            max_tokens=12000))
        m = re.search(r'\{[\s\S]*\}', out)
        try:
            mapping.update({k: str(v) for k, v in json.loads(m.group(0) if m else out).items() if v})
        except (json.JSONDecodeError, AttributeError):
            print(f'  ⚠ 第 {i // 40 + 1} 批補翻結果不是合法 JSON，這批維持原文', file=sys.stderr)
    if not mapping:
        return html
    print(f'  補翻 {len(mapping)} 個漏翻片段（共 {len(targets)} 個候選）')

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


# 模型（gpt-5-mini）就算提示詞明講，還是會把中文術語原字搬進日文（単顆、全口、診所、微創…）。
# 這些是確定性的錯，用對照表在文字節點裡直接換掉，比再叫一次模型便宜又穩。
# 括號裡的內容（品牌原名 (汐潔牙醫診所)）不動；前面接著漢字的也不動（歐仕美牙醫診所 是店名）。
# 中文原文用中文譯名寫西方植體品牌，日韓讀者看不懂，換回原文
BRAND_FIX = [(r'諾保科', 'Nobel Biocare'), (r'百好', 'BioHorizons'), (r'鈕白特', 'Neobiotech'),
             (r'士卓曼', 'Straumann'), (r'奧齒泰', 'Osstem'), (r'登騰', 'Dentium')]

TERM_FIX: dict[str, list[tuple[str, str]]] = {
    'ja': [
        # 模型愛把 <dt> 標籤加上「」（「公式情報」），原文沒有
        (r'^「(目次|公式情報|参考資料|はじめに|まとめ|よくある質問)」$', r'\1'),
        (r'単顆インプラント', 'インプラント1本'),
        (r'植体', 'インプラント体'),
        (r'[単單]顆', '1本'),
        (r'需諮詢', '要相談'),
        (r'數位化', 'デジタル'),
        (r'高齡評估', '高齢者評価'),
        (r'治療療程', '治療コース'),
        (r'全口', '全顎'),
        (r'全瓷冠', 'オールセラミッククラウン'),
        (r'微創', '低侵襲'),
        (r'舒眠', '静脈内鎮静'),
        (r'補骨', '骨造成'),
        (r'(?<![\u4e00-\u9fff])診所', 'クリニック'),
        (r'欧仕美', '歐仕美'),
        (r'(?<![\u4e00-\u9fff])植牙', 'インプラント'),
        (r'療程', '治療コース'),
        (r'(?<![\u4e00-\u9fff])保固', '保証'),
        (r'(?<![\u4e00-\u9fff])洽詢', '問い合わせ'),
        (r'主打する', '売りにする'),
        (r'(?<![\u4e00-\u9fff])主打', '主力'),
        # 「1枚約27元」沒帶 NT$ 會被當人民幣或日圓
        (r'(?<![NT$\d.,])(\d[\d,]*(?:\.\d+)?)\s*元(?![\u4e00-\u9fff])', r'NT$\1'),
        # 「8万〜12万」沒帶 NT$ 會被當日圓
        (r'(?<![NT$\d.])(\d+(?:\.\d+)?)万〜(\d+(?:\.\d+)?)万', r'NT$\1〜\2万'),
    ],
    'ko': [
        (r'需諮詢|需洽詢', '상담 필요'),

        (r'(?<![\u4e00-\u9fff])診所', '병원'),
        (r'欧仕美', '歐仕美'),
        (r'(?<![(（])今周刊(?![)）])', '금주간(今周刊)'),
    ],
    'en': [
        # 「60,000–100,000 NTD」「NTD 38,000」→ NT$ 前綴；沒帶幣別的千位數區間幾乎都是價格
        (r'(?<![\d$])(\d{1,3}(?:,\d{3})+(?:\s*[–~-]\s*\d{1,3}(?:,\d{3})+)?)\s*NTD\b', r'NT$\1'),
        (r'\bNTD\s*(\d)', r'NT$\1'),
        (r'(?<![\d$,.])(\d{1,3}(?:,\d{3})+\s*[–~-]\s*\d{1,3}(?:,\d{3})+)', r'NT$\1'),
    ],
}


def _wan_to_digits(m: re.Match) -> str:
    def num(x: str) -> str:
        return f'{int(round(float(x) * 10000)):,}'
    lo, hi = m.group(1), m.group(2)
    return f'NT${num(lo)}~{num(hi)}' if hi else f'NT${num(lo)}'


# 韓文讀者不用「万」；模型會照中文寫成 NT$6〜10萬、NT$5 到 10 萬，一律換成全數字
KO_WAN_RE = re.compile(r'NT\$\s*(\d+(?:\.\d+)?)\s*[万萬만]?(?:\s*(?:[〜~–\-]|到)\s*(\d+(?:\.\d+)?))?\s*[万萬만](?:\s*(?:元|원))?')
KO_BARE_WAN_RE = re.compile(r'(?<![NT$\d.,])(\d+(?:\.\d+)?)만\s*[~〜]\s*(\d+(?:\.\d+)?)만(?:\s*원)?')
DUP_PAREN_RE = re.compile(r'(\([^()（）]{1,20}\))\1+|(（[^()（）]{1,20}）)\2+')


# 日文：模型愛把台灣店名音譯成片假名再括號附漢字（ジウリツ歯科グループ（九日牙醫集團）），每處讀音還不一樣。
# 日本媒體寫台灣店名一律用漢字（鼎泰豐、誠品書店），所以收斂成漢字原名。
# 條件：括號裡沒假名、這串字在中文原文出現過（是名字不是註解）、前面的片假名不是一般名詞。
JA_GENERIC_KATAKANA = {'ゲイシャ', 'スナック', 'キャラクター', 'ツアー', 'ガイド', 'チケット', 'ビーチ', 'スポット', 'レビュー', 'イメージ',
                       'レストラン', 'テーマルーム', 'アメニティ', 'エキストラベッド', 'ビジネスセンター', 'マッサージバスタブ',
                       'エレガントダブルルーム', 'コミュニケーション', 'ペンギンコース', 'コトビガモ', 'エクソソーム', 'エキソソーム',
                       'アルデヒド', 'フォルム', 'エッセンス', 'ツボクサ', 'ブランド', 'メディア', 'サービス', 'タイムライン',
                       'カスタマーサポート', 'チーム', 'デジタルガイド', 'ジンバル', 'スマホ', 'プラットフォーム', 'サイクリングロード',
                       'ダークチョコレート', 'オプション', 'パッケージ', 'リターン', 'サイト', 'サイトシステム', 'クリニック', 'ホテル',
                       'グループ', 'モーテル', 'マーケティング'}
JA_GENERIC_TAIL = r'(?:歯科|美学歯科|美學歯科|クリニック|ホテル|ビジネスホテル|モーテル|グループ|チョコレート|デジタル|テクノロジー|マーケティング|林場|荘園|山荘|園区|コーヒー荘園)'
JA_KATAKANA_NAME_RE = re.compile(r'([ァ-ヶー・]+(?:\s*' + JA_GENERIC_TAIL + r')*[ァ-ヶー・]*)\s*[（(]([^()（）]+)[)）]')


def collapse_ja_names(html: str, source_html: str) -> str:
    """把「片假名音譯（漢字原名）」收斂成漢字原名；回傳改好的 HTML"""
    def repl(m: re.Match) -> str:
        kata, name = m.group(1).strip(), m.group(2).strip()
        core = re.sub(r'\s*' + JA_GENERIC_TAIL + r'\s*', '', kata)
        if re.search(r'[\u3040-\u30ff]', name) or core in JA_GENERIC_KATAKANA or kata in JA_GENERIC_KATAKANA or len(core) < 3:
            return m.group(0)
        return name if name in source_html else m.group(0)
    out = JA_KATAKANA_NAME_RE.sub(repl, html)
    # 收斂完可能變成「汐潔牙醫診所（汐潔牙醫診所）」
    return re.sub(r'([\u4e00-\u9fff][^<>（()）]{1,20})\s*[（(]\1[)）]', r'\1', out)


# 韓文：模型對同一個名字每段給不同的音譯（毛天使 → 마오톈스／마오천사／마오톈시），還會寫成「臭味滾(臭味滾)」。
# 規則講了不聽，改成事後收斂：同一個括號漢字底下所有「變體(漢字)」、「漢字(漢字)」、光漢字，全部換成最常見的那個變體，
# 括號漢字只留第一次出現。變體是「拉丁／韓文詞（最多兩個詞）」，且那串漢字要在中文原文出現過（是名字不是註解）。
KO_NAME_RE = re.compile(r'((?:[A-Za-z][A-Za-z0-9]*|[가-힣]+)(?:\s(?:[A-Za-z][A-Za-z0-9]*|[가-힣]+))?)?\s*[（(]([\u4e00-\u9fff]{2,10})[)）]')
KO_SKIP_BEFORE = {'먼저', '것은', '반면', '또는', '및', '그리고', '이나', '때', '원하면', '처리하려면', '뿌리려면', '선택하세요'}


def collapse_ko_names(html: str, source_html: str) -> str:
    text_only = re.sub(r'<[^>]+>', ' ', html)
    variants: dict[str, dict[str, int]] = {}
    for m in KO_NAME_RE.finditer(text_only):
        var, name = (m.group(1) or '').strip(), m.group(2)
        if name not in source_html or re.search(r'[\u4e00-\u9fff]', var):
            continue
        # 「먼저 베인(貝恩)」這種前面黏到普通詞的，只取最後一個詞
        words = var.split()
        if len(words) == 2 and words[0] in KO_SKIP_BEFORE:
            var = words[1]
        if var and var != name:
            variants.setdefault(name, {})
            variants[name][var] = variants[name].get(var, 0) + 1
    if not variants:
        return html
    seen: set[str] = set()

    def fix_text(m: re.Match) -> str:
        text = m.group(1)
        for name, forms in variants.items():
            canon = max(forms.items(), key=lambda kv: (kv[1], -len(kv[0])))[0]
            alt = '|'.join(re.escape(v) for v in sorted(forms, key=len, reverse=True))
            text = re.sub(r'(?:' + alt + '|' + name + r')?\s*[（(]' + name + r'[)）](?:\s*[（(]' + name + r'[)）])?', '\x00' + name + '\x00', text)
            text = re.sub(r'(?<![\u4e00-\u9fff\x00])' + name + r'(?![\u4e00-\u9fff\x00])', '\x00' + name + '\x00', text)
            text = re.sub(r'(?<![가-힣A-Za-z])(?:' + alt + r')(?![가-힣A-Za-z])', '\x00' + name + '\x00', text)

        def place(p: re.Match) -> str:
            name = p.group(1)
            canon = max(variants[name].items(), key=lambda kv: (kv[1], -len(kv[0])))[0]
            if name in seen:
                return canon
            seen.add(name)
            return f'{canon}({name})'
        return '>' + re.sub('\x00([^\x00]+)\x00', place, text) + '<'

    parts = re.split(r'(<style[\s\S]*?</style>)', html)
    return ''.join(part if part.startswith('<style') else re.sub(r'>([^<]*)<', fix_text, part) for part in parts)


def fix_plain(text: str) -> str:
    """標題、摘要這種純文字也過一次術語表"""
    return fix_terms('>' + text + '<')[1:-1]


def fix_terms(html: str) -> str:
    rules = [(re.compile(pat), rep) for pat, rep in TERM_FIX.get(LANG, []) + BRAND_FIX]

    def fix_text(m: re.Match) -> str:
        text = DUP_PAREN_RE.sub(lambda d: d.group(1) or d.group(2), m.group(1))  # 주화(爵華)(爵華) → 주화(爵華)
        # 韓文會寫成 백호(百好)、Nobel Biocare(諾保科)：整組換成原文品牌
        for pat, brand in BRAND_FIX:
            text = re.sub(r'(?:[가-힣]+|' + re.escape(brand) + r')?\s*[（(]' + pat + r'[)）]', brand, text)
        if LANG == 'ko':  # 金額括號裡的也要換（「(NT$3.8 萬 入門プラン)」這種）
            text = KO_BARE_WAN_RE.sub(lambda b: f'NT${b.group(1)}만~{b.group(2)}만', text)
            text = KO_WAN_RE.sub(_wan_to_digits, text)
            text = re.sub(r'(NT\$\s*\d[\d,]*(?:\.\d+)?)\s*원(?!래|인|칙)', r'\1', text)
            # 光禿禿的「7,000원」會被當韓元
            text = re.sub(r'(?<![NT$\d.,])(\d[\d,]*(?:\.\d+)?)\s*원(?!래|인|칙|천|장|료|자|고|본|가|형|리)', r'NT$\1', text)
        if LANG == 'en':  # 英文規則只有幣值，括號裡的也要換
            for rx, rep in rules:
                text = rx.sub(rep, text)
        pieces = re.split(r'([（(][^()（）]*[)）])', text)
        for i in range(0, len(pieces), 2):  # 偶數位是括號外的文字
            for rx, rep in rules:
                pieces[i] = rx.sub(rep, pieces[i])
        return '>' + ''.join(pieces) + '<'

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


def has_suffix(slug: str) -> bool:
    return re.search(re.escape(SUFFIX) + r'(-\d+)?$', slug) is not None


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
            # 同名 slug 撞到時 WP 會加 -2、-3（tag-ja-27），所以不能只看 endswith
            found = next((r for r in target_terms if has_suffix(r['slug']) and r.get('description') == src['name']), None)
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
        if src.get('description') and taxonomy == 'categories':
            # 分類描述在前台分類頁會顯示，也翻成英文（標籤的描述前台不顯示，留著當中文原名對照鍵）
            body['description'] = strip_fences(llm([
                {'role': 'user', 'content': f'Translate this category description into natural {LANG_LABEL[LANG]}. Output only the text.\n\n' + src['description']}
            ], max_tokens=1000))
        try:
            created = wp('POST', taxonomy, body)
        except SystemExit:
            # 同名 term 已經在（上一輪建的，但 description 被翻譯覆蓋掉、對不回中文名），
            # WP 回 term_exists 並附 term_id，直接沿用
            hit = next((r for r in wp('GET', taxonomy, params={'search': body['name'], 'per_page': 20})
                        if r['name'] == body['name'] and has_suffix(r['slug'])), None)
            if not hit:
                raise
            created = hit
            print(f'  = 沿用既有 {kind} {created["slug"]}（{created["name"]}）')
        else:
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
    legacy_cache = CACHE_DIR / f'{post_id}.json'   # 還沒有 --lang 之前的英文快取
    if LANG == 'en' and not cache_file.exists() and legacy_cache.exists():
        cache_file = legacy_cache
    cached = json.loads(cache_file.read_text()) if cache_file.exists() and not retranslate else None
    if cached and cached.get('source_modified') == post['modified']:
        print('  使用快取的翻譯（來源沒改過）')
        translated = cached
    else:
        parts = split_parts(content)
        # 原文只改了幾段時，沒改的段沿用上次的譯文（拿 WP 修訂版當舊原文對 hash），只翻改過的
        reuse = {} if retranslate else reusable_parts(post_id, cached, existing)
        print(f'  內文 {len(content)} 字元，切成 {len(parts)} 段，模型 {MODEL}')
        out_parts = translate_parts(parts, reuse)
        en_content = fix_terms(normalize_punct(translate_leftovers(translate_svg_texts(''.join(out_parts)))))
        en_content = normalize_labels(content, en_content)
        if LANG == 'ja':
            en_content = collapse_ja_names(en_content, content)
        if LANG == 'ko':
            en_content = collapse_ko_names(en_content, content)
        # 標題沒改、第一段（前言）沒改，標題與摘要也沿用
        if cached and reuse and cached.get('source_title') == title and part_hash(parts[0]) in reuse:
            meta = {'title': cached['title'], 'excerpt': cached['excerpt']}
            print('  標題與摘要沿用上次')
        else:
            meta = translate_meta(title, content)
        translated = {
            'source_modified': post['modified'],
            'source_title': title,
            'title': meta['title'],
            'excerpt': meta['excerpt'],
            'content': en_content,
            'leftovers_done': True,
        }
        cache_file = CACHE_DIR / f'{post_id}.{LANG}.json'
        cache_file.write_text(json.dumps(translated, ensure_ascii=False, indent=1))
        print(f'  翻譯完成，快取在 {cache_file.relative_to(ROOT)}')

    # 舊快取也補跑 SVG 與漏翻檢查，但只跑一次：跑過就在快取記下來，之後 --force 重推不再送模型
    # （手動修好的漢字店名會被再音譯一遍，而且每次都燒額度）
    if not translated.get('leftovers_done') and (SVG_TEXT_RE.search(translated['content']) or has_cjk(translated['content'])):
        translated['content'] = translate_leftovers(translate_svg_texts(translated['content']))
    translated['leftovers_done'] = True
    cache_file.write_text(json.dumps(translated, ensure_ascii=False, indent=1))
    if CJK_PUNCT_RE.search(re.sub(r'<style[\s\S]*?</style>', '', translated['content'])):
        translated['content'] = normalize_punct(translated['content'])
        cache_file.write_text(json.dumps(translated, ensure_ascii=False, indent=1))
    fixed = normalize_labels(content, fix_terms(translated['content']))
    if LANG == 'ja':
        fixed = collapse_ja_names(fixed, content)
    if LANG == 'ko':
        fixed = collapse_ko_names(fixed, content)
    if fixed != translated['content']:
        translated['content'] = fixed
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
        'title': fix_plain(translated['title']),
        'slug': target_slug,
        'content': translated['content'],
        'excerpt': fix_plain(translated['excerpt']),
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
        # Cloudflare 對大 payload 偶爾回 520，但 WordPress 其實已經建好了；直接重送會建出第二篇
        # （slug 變成 -ko-2）。所以建立失敗先用 slug 找一次，找到就改成更新
        try:
            saved = wp('POST', 'posts', body)
        except SystemExit:
            dup = find_post_by_slug(target_slug)
            if not dup:
                raise
            print(f'  ⚠ 建立時回錯但文章已存在（post {dup["id"]}），改成更新', file=sys.stderr)
            saved = wp('POST', f'posts/{dup["id"]}', body)
        print(f'  ✓ 建立譯文 post {saved["id"]}：{saved["link"]}')
    cat_slug = wp('GET', f'categories/{category_ids[0]}')['slug'] if category_ids else ''
    route_cat = cat_slug[: -len(SUFFIX)] if cat_slug.endswith(SUFFIX) else cat_slug
    revalidate(target_slug, cat_slug)
    print(f'  前台：https://spacea.com.tw/{LANG}/{route_cat}/{slug}')


def revalidate(post_slug: str, category_slug: str) -> None:
    """寫完 WP 直接叫正式站清快取，不用再手動跑 scripts/revalidate.sh。失敗只印警告，譯文已經存好了。"""
    secret = ENV.get('REVALIDATE_SECRET')
    if not secret or not category_slug:
        print('  ⚠ 沒有 REVALIDATE_SECRET 或分類，前台要自己跑 scripts/revalidate.sh', file=sys.stderr)
        return
    site = ENV.get('REVALIDATE_SITE_URL', 'https://spacea.com.tw').rstrip('/')
    req = urllib.request.Request(
        f'{site}/api/revalidate',
        data=json.dumps({'slug': post_slug, 'category': category_slug}).encode(),
        # Cloudflare 會擋 urllib 預設的 Python-urllib UA（回 403），要帶瀏覽器 UA
        headers={'x-revalidate-secret': secret, 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (spaceA translate_post)'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f'  ✓ 前台快取已清（{resp.status}）')
    except Exception as e:  # noqa: BLE001
        print(f'  ⚠ 清前台快取失敗：{e}，自己跑 scripts/revalidate.sh {post_slug} {category_slug}', file=sys.stderr)


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

    failed = []
    for post_id in args.post_ids:
        # 一篇掛掉不要拖垮整批，記下來最後一起報
        try:
            translate_post(post_id, force=args.force or args.retranslate, dry_run=args.dry_run,
                           status=args.status, retranslate=args.retranslate)
        except SystemExit as e:
            print(f'✗ post {post_id} 失敗，跳過繼續下一篇（{e}）', file=sys.stderr)
            failed.append(post_id)
        except Exception as e:  # noqa: BLE001 — 這裡就是要攔下所有例外
            print(f'✗ post {post_id} 失敗，跳過繼續下一篇（{type(e).__name__}: {e}）', file=sys.stderr)
            failed.append(post_id)
    if failed:
        print(f'\n⚠ 這些沒翻成功，補跑：{" ".join(map(str, failed))}', file=sys.stderr)


if __name__ == '__main__':
    main()
