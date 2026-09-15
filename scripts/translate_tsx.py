#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 src/app/en 底下固定頁面（關於我們、推薦標準…）的英文字串翻成別的語言，就地改寫已複製好的
src/app/<lang> 檔案。文章內容走 translate_post.py，這支只處理寫死在 TSX 裡的版面文案。

用法：
  python3 scripts/translate_tsx.py ja --dry-run     # 只印出會被翻的字串
  python3 scripts/translate_tsx.py ja ko            # 實際翻譯並寫回檔案

抽取規則：JSX 的文字節點，加上「不是屬性值」的單引號字串。屬性值（href、className、id…）
與沒有字母的字串（日期、數字）一律跳過，翻完用完全比對換回去，再跑 type-check 驗證。
"""
import json, re, sys, subprocess, glob, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from translate_post import llm, strip_fences  # 共用同一支 OpenRouter 呼叫

LANG_NAME = {'ja': 'Japanese', 'ko': 'Korean'}
# 這些位置的單引號字串是程式用的，不能翻
ATTR = re.compile(r"(href|className|src|id|rel|target|dateTime|from|name|type|content|key|lang|hrefLang)\s*[=:]\s*$")


def extract(src: str) -> list[str]:
    out = []
    # 1. JSX 文字節點
    for m in re.finditer(r'>([^<>{}]+)<', src):
        t = m.group(1).strip()
        if len(t) > 1 and re.search(r'[A-Za-z]', t) and not t.startswith('//'):
            out.append(t)
    # 2. 單引號字串（排除屬性值）
    for m in re.finditer(r"'([^'\\\n]{2,})'", src):
        t = m.group(1)
        if not re.search(r'[A-Za-z]', t):
            continue
        if re.search(r'^[a-z0-9-]+$', t):          # slug、class 名這種
            continue
        if t.startswith('/') or t.startswith('http') or '@/' in t:
            continue
        if re.fullmatch(r'[a-z]{2}(_[A-Z]{2})?', t) or '/' in t:   # locale、import 路徑
            continue
        if re.search(r'from\s+$', src[max(0, m.start() - 8):m.start()]):
            continue
        if ATTR.search(src[max(0, m.start() - 24):m.start()]):
            continue
        out.append(t)
    seen = []
    for t in out:
        if t not in seen:
            seen.append(t)
    return seen


PROMPT = """Translate these UI and editorial strings from a Taiwanese consumer-recommendation website (spaceA) into %s.

Rules:
- Natural, idiomatic %s as a real content site would write it; not literal word-for-word.
- Keep the brand name "spaceA" exactly as-is, and keep email addresses, URLs and numbers unchanged.
- Keep any leading/trailing spaces and punctuation shape of the original where it matters for layout.
- A string ending with a colon or a comma is a sentence fragment that continues into a link; keep it a fragment.
- Dates written out in English (e.g. "August 28, 2026") should use the normal date format of the target language.
- These are legal/editorial pages (about, standards, privacy policy, terms), so keep the register formal and precise.
- Never use straight ASCII quotes (" or ') in the translation: they break the JSX build. Use 「」 for Japanese and “ ” for Korean when a quotation is needed.
- Return ONLY a JSON object mapping each original string to its translation, with every input key present.

%s
"""


def translate(strings: list[str], lang: str) -> dict:
    out = {}
    for i in range(0, len(strings), 40):          # 一次 40 條，太多會被截斷
        chunk = strings[i:i + 40]
        raw = strip_fences(llm([{ 'role': 'user', 'content': PROMPT % (
            LANG_NAME[lang], LANG_NAME[lang], json.dumps(chunk, ensure_ascii=False, indent=1))}], max_tokens=16000))
        raw = re.sub(r'^```(?:json)?\s*|\s*```$', '', raw)
        data = json.loads(raw)
        missing = [s for s in chunk if s not in data]
        if missing:
            print(f'  ⚠ {len(missing)} 條沒翻到，保留原文：{missing[:3]}', file=sys.stderr)
        out.update({k: str(v) for k, v in data.items() if v})
        print(f'  翻好 {min(i + 40, len(strings))}/{len(strings)}')
    return out


def apply(path: str, mapping: dict) -> int:
    s = open(path).read()
    n = 0
    # 只動引號內的字串與 JSX 文字節點，不做全檔全域取代（避免把識別字換掉）。
    # 長的先換，短字串才不會先把長字串切斷
    for src in sorted(mapping, key=len, reverse=True):
        dst = mapping[src]
        if src == dst:
            continue
        before = s
        s = s.replace(f"'{src}'", f"'{dst}'")
        s = re.sub(r'(>)(\s*)' + re.escape(src) + r'(\s*)(<)',
                   lambda m: m.group(1) + m.group(2) + dst + m.group(3) + m.group(4), s)
        if s != before:
            n += 1
    open(path, 'w').write(s)
    return n


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry-run' in sys.argv
    for lang in args:
        files = sorted(glob.glob(f'src/app/{lang}/*/page.tsx'))
        assert files, f'找不到 src/app/{lang}/*/page.tsx，要先從 en 複製一份'
        print(f'▶ {lang}：{len(files)} 個固定頁')
        for f in files:
            strings = extract(open(f).read())
            print(f'  {f}：{len(strings)} 條字串')
            if dry:
                for t in strings[:200]:
                    print('     ', repr(t))
                continue
            mapping = translate(strings, lang)
            print(f'  ✓ {f} 換掉 {apply(f, mapping)} 條')


if __name__ == '__main__':
    main()
