#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
照 check_translation.py 的審閱報告，把「嚴重」的段落逐段重翻並寫回 WordPress。

用法：
  python3 scripts/fix_translation.py /tmp/review_ja.md --lang ja            # 修報告裡所有文章的嚴重項
  python3 scripts/fix_translation.py /tmp/review_ja.md --lang ja --dry-run  # 只印出會改什麼
  python3 scripts/fix_translation.py /tmp/review_ja.md --lang ja --minor    # 連「普通」也修

做法：每條問題把（中文原文、目前譯文、審閱意見）丟給翻譯模型，要它交出修正後的那一段。
審閱模型（gemini）跟翻譯模型（gpt-5-mini）是兩顆不同的模型，這裡明講「審閱意見若是錯的就原樣退回」，
讓兩邊互相牽制，不會被一顆模型的誤判帶著走。
修完用完全比對把譯文那一段換掉，動不到別的地方；接著再跑一次 check_translation.py 看有沒有收斂。
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import translate_post as tp
from translate_post import LANG_LABEL, LANG_SUFFIX, HEADINGS, NAME_RULE, PUNCT_RULE, llm, strip_fences, wp


def parse_report(path: str, include_minor: bool) -> dict[int, list[dict]]:
    """把 Markdown 報告解回 {post_id: [問題…]}"""
    text = open(path).read()
    out: dict[int, list[dict]] = {}
    for block in re.split(r'(?=^## post )', text, flags=re.M)[1:]:
        m = re.match(r'## post (\d+) → \w+ post (\d+)', block)
        if not m:
            continue
        pid, tid = int(m.group(1)), int(m.group(2))
        sections = [('嚴重', block.split('#### 嚴重')[1].split('####')[0] if '#### 嚴重' in block else '')]
        if include_minor and '#### 普通' in block:
            sections.append(('普通', block.split('#### 普通')[1]))
        items = []
        for level, sec in sections:
            for it in re.finditer(r'^- \*\*(.*?)\*\*\n  - 中文原文：(.*)\n  - 譯文回譯：(.*)(?:\n  - 建議：(.*))?', sec, re.M):
                items.append({'level': level, '問題': it.group(1), '原文片段': it.group(2).strip(),
                              '回譯': it.group(3), '建議': it.group(4) or ''})
        if items:
            out[pid] = items
            out[pid + 1_000_000] = [{'target_id': tid}]  # 順便把譯文 id 帶出去
    return out


FIX_PROMPT = """You are correcting one paragraph of a %(lang)s translation of a Traditional Chinese article
from a Taiwanese consumer-recommendation website.

A separate reviewer flagged this paragraph. Reviewers are sometimes wrong. Your job:
1. Read the Chinese original and the current translation.
2. If the reviewer's complaint is valid, rewrite the translation so it is faithful, natural %(lang)s.
3. If the current translation is actually correct and the reviewer is mistaken, return the current
   translation UNCHANGED.

Rules for the rewrite:
- Keep every fact, number and price exactly as in the Chinese original.
- %(names)s
- Currency: Taiwan dollar amounts always carry the NT$ prefix; a bare 元/万元/원 will be misread as the reader's own currency.
- %(punct)s
- Fixed section names: %(headings)s
- Output ONLY the corrected paragraph text, no quotes, no explanation, no HTML tags.

Chinese original:
%(zh)s

Current translation:
%(t)s

Reviewer's complaint (may be wrong):
%(issue)s
%(hint)s
"""


def fix_post(pid: int, items: list[dict], lang: str, dry_run: bool) -> int:
    src = wp('GET', f'posts/{pid}', params={'context': 'edit'})
    target_slug = src['slug'] + LANG_SUFFIX[lang]
    rows = wp('GET', 'posts', params={'slug': target_slug, 'status': 'any', 'context': 'edit'})
    if not rows:
        print(f'  ✗ 找不到 {target_slug}', file=sys.stderr)
        return 0
    dst = rows[0]
    html = dst['content']['raw']
    body = re.sub(r'<style[\s\S]*?</style>|<svg[\s\S]*?</svg>', '', html)
    nodes = [t.strip() for t in re.findall(r'>([^<]+)<', body) if t.strip()]
    zh_nodes = [t.strip() for t in re.findall(r'>([^<]+)<', re.sub(r'<style[\s\S]*?</style>|<svg[\s\S]*?</svg>', '', src['content']['raw'])) if t.strip()]

    changed = 0
    for it in items:
        # 報告裡的「中文原文」被截到 180 字，用前綴去對回完整的中文節點，再用同一個索引找譯文節點
        frag = it['原文片段'][:60]
        idx = next((i for i, z in enumerate(zh_nodes) if z.startswith(frag)), None)
        if idx is None or idx >= len(nodes):
            print(f'  · 對不回原文節點，跳過：{frag[:30]}…', file=sys.stderr)
            continue
        zh, cur = zh_nodes[idx], nodes[idx]
        prompt = FIX_PROMPT % {
            'lang': LANG_LABEL[lang], 'names': NAME_RULE[lang], 'punct': PUNCT_RULE[lang],
            'headings': HEADINGS[lang], 'zh': zh, 't': cur, 'issue': it['問題'],
            'hint': f"Reviewer's suggestion: {it['建議']}" if it['建議'] else '',
        }
        fixed = strip_fences(llm([{'role': 'user', 'content': prompt}], max_tokens=4000)).strip().strip('"「」')
        if not fixed or fixed == cur:
            print(f'  = 維持原樣（審閱意見不成立）：{zh[:28]}…')
            continue
        if dry_run:
            print(f'  ~ 會改：{zh[:28]}…\n      舊：{cur[:70]}\n      新：{fixed[:70]}')
            changed += 1
            continue
        # 只換這個文字節點，用 > … < 包起來比對，避免誤傷相同字串出現在別處（例如屬性）
        new_html, n = re.subn(r'(>\s*)' + re.escape(cur) + r'(\s*<)', lambda m: m.group(1) + fixed + m.group(2), html, count=1)
        if n:
            html = new_html
            changed += 1
            print(f'  ✓ {zh[:28]}…')
        else:
            print(f'  · 譯文節點找不到，跳過：{cur[:30]}…', file=sys.stderr)

    if changed and not dry_run:
        wp('POST', f'posts/{dst["id"]}', {'content': html})
        # 快取也同步，之後 --force 重推才不會蓋回舊的
        cache = tp.CACHE_DIR / f'{pid}.{lang}.json'
        if cache.exists():
            data = json.loads(cache.read_text())
            data['content'] = html
            cache.write_text(json.dumps(data, ensure_ascii=False, indent=1))
        print(f'  → post {dst["id"]} 更新 {changed} 段')
    return changed


def main() -> None:
    ap = argparse.ArgumentParser(description='照審閱報告修正譯文')
    ap.add_argument('report')
    ap.add_argument('--lang', required=True, choices=sorted(LANG_SUFFIX))
    ap.add_argument('--minor', action='store_true', help='連「普通」等級也修')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    tp.LANG = args.lang
    tp.SUFFIX = LANG_SUFFIX[args.lang]

    report = parse_report(args.report, args.minor)
    total = 0
    for pid, items in report.items():
        if pid > 1_000_000:
            continue
        print(f'▶ post {pid}：{len(items)} 條')
        total += fix_post(pid, items, args.lang, args.dry_run)
    print(f'\n{"會" if args.dry_run else "已"}修正 {total} 段')


if __name__ == '__main__':
    main()
