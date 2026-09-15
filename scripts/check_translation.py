#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
翻譯版文章的把關工具。給看不懂日／韓文的人用：把「不需要語言能力就能驗」的東西自動挑出來，
再把譯文用中文回譯，讓你讀中文就能判斷意思有沒有跑掉。

用法：
  python3 scripts/check_translation.py 326 --lang ja              # 只跑機器檢查，不花錢
  python3 scripts/check_translation.py 326 --lang ja --review     # 加 AI 審閱（另一個模型）
  python3 scripts/check_translation.py --lang ja --all            # 該語言全部文章
  python3 scripts/check_translation.py 326 --lang ja --review -o report.md

三道關卡：
  1. 數字核對 — 價格、電話、年份、數量在譯文裡必須跟中文原文一模一樣。翻錯價格是最嚴重的錯，
     而且完全不需要懂日文就驗得出來。
  2. 連結核對 — 每個 href 都要原樣保留，不能少也不能多。
  3. AI 審閱（--review）— 用跟翻譯時「不同的模型」逐段比對中文原文與譯文，只回報意思有出入的地方，
     並附上該段的中文回譯，讓你直接讀中文判斷。

報告是 Markdown，預設印在畫面上，用 -o 可存成檔案。
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from translate_post import ENV, LANG_LABEL, LANG_SUFFIX, die, llm, strip_fences, wp  # 共用設定與 API 呼叫

# 審閱刻意用跟翻譯不同的模型，避免同一顆模型替自己的輸出背書
DEFAULT_REVIEW_MODEL = 'google/gemini-2.5-flash'


# ---------- 取文與清理 ----------

def clean(html: str) -> str:
    """拿掉不該參與比對的區塊：樣式、腳本，以及 SVG（裡面全是座標數字，會把數字核對洗版）"""
    html = re.sub(r'<style[\s\S]*?</style>', '', html)
    html = re.sub(r'<script[\s\S]*?</script>', '', html)
    return re.sub(r'<svg[\s\S]*?</svg>', '', html)


def text_nodes(html: str) -> list[str]:
    return [t.strip() for t in re.findall(r'>([^<]+)<', clean(html)) if t.strip()]


BLOCK_TAGS = r'p|li|h[1-6]|dt|dd|td|th|figcaption|blockquote|summary|div'
BLOCK_RE = re.compile(
    rf'<({BLOCK_TAGS})(?:\s[^>]*)?>((?:(?!<(?:{BLOCK_TAGS})[\s>])[\s\S])*?)</\1>', re.I)


def blocks(html: str) -> list[str]:
    """以「最內層的區塊元素」為單位取文字，行內的 <strong>、<a> 合併進同一段。
    逐個文字節點配對會因為譯文把 <strong> 的位置挪一下就整篇錯位，審閱模型接著把後面每一段都報成
    「翻到下一段去了」；區塊層級兩邊結構一樣（結構核對有把關），配對就穩。"""
    out = []
    for _, inner in BLOCK_RE.findall(clean(html)):
        text = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', inner)).strip()
        if text:
            out.append(text)
    return out


def _wan(m: re.Match) -> str:
    """「6 萬」「3.8万」「3 萬 8」→ 60000／38000／38000，跟譯文展開後的全數字比得起來"""
    base = float(m.group(1)) * 10000
    if m.group(2):
        base += int(m.group(2)) * 1000
    return str(int(round(base)))


def numbers(html: str) -> list[str]:
    """抓出正文裡的數字。千分位統一去掉，1,200 與 1200 視為同一個；中文的「萬」先展開成全數字"""
    out = []
    for t in text_nodes(html):
        t = re.sub(r'(\d+(?:\.\d+)?)\s*[萬万]\s*(\d)?(?![\d,])', _wan, t)
        for m in re.finditer(r'\d[\d,]*(?:\.\d+)?', t):
            out.append(m.group(0).replace(',', ''))
    return out


def links(html: str) -> list[str]:
    return re.findall(r'href="([^"]+)"', clean(html))


def tag_counts(html: str) -> dict:
    body = clean(html)
    return {t: len(re.findall(rf'<{t}[\s>/]', body, re.I)) for t in ['h2', 'h3', 'p', 'li', 'img', 'a', 'tr', 'dt', 'dd']}


# ---------- WordPress ----------

def fetch(post_id: int, lang: str):
    src = wp('GET', f'posts/{post_id}', params={'context': 'edit'})
    if any(src['slug'].endswith(x) for x in LANG_SUFFIX.values()):
        die(f'post {post_id} 本身就是譯文，請給中文原文的 id')
    target_slug = src['slug'] + LANG_SUFFIX[lang]
    rows = wp('GET', 'posts', params={'slug': target_slug, 'status': 'any', 'context': 'edit'})
    if not rows:
        die(f'找不到 {lang} 版（{target_slug}），請先用 translate_post.py 翻譯')
    return src, rows[0]


# ---------- 三道關卡 ----------

def check_numbers(src_html: str, dst_html: str) -> list[str]:
    from collections import Counter
    a, b = Counter(numbers(src_html)), Counter(numbers(dst_html))
    issues = []
    for n, c in (a - b).items():
        # 年份與極短的數字容易因為句型改寫而消失，單獨標註；價格這種長數字才是重點
        level = '⚠' if len(n) >= 3 else '·'
        issues.append(f'{level} 譯文少了數字 {n}（原文出現 {a[n]} 次、譯文 {b[n]} 次）')
    for n, c in (b - a).items():
        if len(n) >= 3:
            issues.append(f'⚠ 譯文多了原文沒有的數字 {n}（{c} 次）')
    return issues


def check_links(src_html: str, dst_html: str) -> list[str]:
    a, b = set(links(src_html)), set(links(dst_html))
    issues = [f'⚠ 譯文少了連結 {u}' for u in sorted(a - b)]
    issues += [f'⚠ 譯文多了連結 {u}' for u in sorted(b - a)]
    return issues


def check_structure(src_html: str, dst_html: str) -> list[str]:
    a, b = tag_counts(src_html), tag_counts(dst_html)
    return [f'⚠ <{t}> 數量對不上：原文 {a[t]}、譯文 {b[t]}' for t in a if a[t] != b[t]]


REVIEW_PROMPT = """You are proof-reading a %(lang)s translation of a Traditional Chinese article from a Taiwanese
recommendation website. The reviewer does NOT read %(lang)s, so your report must be written in Traditional Chinese.

Below are paragraph pairs. `zh` is the original, `t` is the %(lang)s translation.

Report ONLY real problems, and grade each one:
- "嚴重" = a reader would be misled: a fact, price, number, currency or unit that does not match the
  original; meaning reversed or clearly changed; a whole clause missing or invented; Chinese left
  untranslated; a place/brand name left in English or pinyin where the target language normally uses
  its own script.
- "普通" = correct but a native speaker would notice it is off: unnatural wording, wrong register,
  a nuance lost.

Do NOT report at all: legitimate rephrasing, word order, punctuation style, sentence splitting,
or the brand name spaceA. House rules that are deliberate, never problems: Taiwan-dollar amounts
are written with the NT$ prefix even when the Chinese only says 萬/元 (6 萬 → NT$60,000, 3 萬 8 →
NT$38,000, 6 到 10 萬 → NT$60,000~100,000 or NT$6〜10万); Western brand names stay in Latin letters
(諾保科 → Nobel Biocare); section labels use the fixed target-language names. If a pair is fine, omit it. Most pairs should be fine — do not pad the list.

Return ONLY a JSON array. Each item:
{"i": <index>, "嚴重度": "嚴重" 或 "普通", "問題": "<用繁體中文說明哪裡不對>", "建議": "<這段該怎麼改，用繁體中文寫>", "回譯": "<把該段譯文回譯成繁體中文>"}

%(pairs)s
"""


def ai_review(src_html: str, dst_html: str, lang: str, model: str) -> list[dict]:
    a, b = blocks(src_html), blocks(dst_html)
    if len(a) != len(b):
        print(f'  ⚠ 段落數對不上（原文 {len(a)}、譯文 {len(b)}），逐段比對可能錯位，僅供參考', file=sys.stderr)
    pairs = [{'i': i, 'zh': x, 't': y} for i, (x, y) in enumerate(zip(a, b)) if len(x) > 8]
    found, failed = [], 0
    for i in range(0, len(pairs), 25):
        chunk = pairs[i:i + 25]
        raw = strip_fences(llm(
            [{'role': 'user', 'content': REVIEW_PROMPT % {
                'lang': LANG_LABEL[lang], 'pairs': json.dumps(chunk, ensure_ascii=False, indent=1)}}],
            max_tokens=8000, model=model))
        # 模型偶爾會在 JSON 前後多寫一兩句，直接挖出第一個陣列
        m = re.search(r'\[[\s\S]*\]', raw)
        try:
            found += json.loads(m.group(0) if m else raw)
        except (json.JSONDecodeError, AttributeError):
            failed += 1
            print(f'  ⚠ 第 {i // 25 + 1} 批審閱回傳無法解析：{raw[:80]}', file=sys.stderr)
        print(f'  審閱 {min(i + 25, len(pairs))}/{len(pairs)} 段')
    by_index = {p['i']: p for p in pairs}
    for f in found:
        f['原文'] = by_index.get(f.get('i'), {}).get('zh', '')
        f['譯文'] = by_index.get(f.get('i'), {}).get('t', '')
    return found, failed


# ---------- 報告 ----------

def report_for(post_id: int, lang: str, do_review: bool, model: str) -> str:
    src, dst = fetch(post_id, lang)
    s, d = src['content']['raw'], dst['content']['raw']
    out = [f"## post {post_id} → {lang} post {dst['id']}",
           f"- 中文：{src['title']['raw']}",
           f"- 譯文：{dst['title']['raw']}",
           f"- 網址：{ENV.get('NEXT_PUBLIC_SITE_URL', '')}/{lang}/…/{src['slug']}", '']

    for name, issues in [('數字核對', check_numbers(s, d)),
                         ('連結核對', check_links(s, d)),
                         ('結構核對', check_structure(s, d))]:
        warn = [i for i in issues if i.startswith('⚠')]
        out.append(f'### {name}：{"✅ 通過" if not warn else f"{len(warn)} 個問題"}')
        out += [f'- {i}' for i in issues] or ['- （無）']
        out.append('')

    if do_review:
        print(f'  AI 審閱中（模型 {model}）…')
        found, failed = ai_review(s, d, lang, model)
        # 有批次失敗時絕對不能顯示「通過」，那是假的安心
        status = f'{len(found)} 處要看' if found else '沒抓到問題'
        if failed:
            status = f'⚠ {failed} 批解析失敗，結果不完整；' + status
        elif not found:
            status = '✅ ' + status
        bad = [f for f in found if f.get('嚴重度') == '嚴重']
        minor = [f for f in found if f.get('嚴重度') != '嚴重']
        if found:
            status = f'{len(bad)} 處嚴重、{len(minor)} 處普通'
            if failed:
                status = f'⚠ {failed} 批解析失敗，結果不完整；' + status
        out.append(f'### AI 審閱：{status}')
        for title, group in [('嚴重（會誤導讀者，要改）', bad), ('普通（讀得懂但不夠自然）', minor)]:
            if not group:
                continue
            out.append(f'\n#### {title}')
            for f in group:
                out += [f"- **{f.get('問題', '')}**",
                        f"  - 中文原文：{f.get('原文', '')[:180]}",
                        f"  - 譯文回譯：{f.get('回譯', '')[:180]}"]
                if f.get('建議'):
                    out.append(f"  - 建議：{f['建議'][:180]}")
        out.append('')
    return '\n'.join(out)


def main() -> None:
    ap = argparse.ArgumentParser(description='檢查翻譯版文章')
    ap.add_argument('post_ids', nargs='*', type=int, help='中文原文的 post id')
    ap.add_argument('--lang', required=True, choices=sorted(LANG_SUFFIX))
    ap.add_argument('--review', action='store_true', help='加跑 AI 審閱（會呼叫 API）')
    ap.add_argument('--model', default=DEFAULT_REVIEW_MODEL, help=f'審閱模型（預設 {DEFAULT_REVIEW_MODEL}）')
    ap.add_argument('--all', action='store_true', help='該語言已翻的全部文章')
    ap.add_argument('-o', '--out', help='把報告寫成檔案')
    args = ap.parse_args()

    ids = args.post_ids
    if args.all:
        suffix = LANG_SUFFIX[args.lang]
        translated = {p['slug'][: -len(suffix)] for p in wp('GET', 'posts', params={'per_page': 100, 'search': suffix})
                      if p['slug'].endswith(suffix)}
        ids = [p['id'] for p in wp('GET', 'posts', params={'per_page': 100})
               if p['slug'] in translated]
    if not ids:
        die('沒有指定文章（給 post id 或加 --all）')

    parts = [f'# 翻譯檢查報告（{LANG_LABEL[args.lang]}）\n']
    for pid in ids:
        print(f'▶ post {pid}')
        parts.append(report_for(pid, args.lang, args.review, args.model))
    text = '\n'.join(parts)
    if args.out:
        open(args.out, 'w').write(text)
        print(f'✓ 報告寫到 {args.out}')
    else:
        print(text)


if __name__ == '__main__':
    main()
