#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
日文版：把模型自創的片假名音譯「ジウリツ歯科グループ（九日牙醫集團）」收斂成漢字原名「九日牙醫集團」。
邏輯在 translate_post.collapse_ja_names（翻譯流程本身也會跑），這支只是拿來對既有快取補跑。

用法：python3 scripts/fix_ja_names.py 326 308 --dry-run
"""
from __future__ import annotations

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import translate_post as tp


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('post_ids', nargs='+', type=int)
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    tp.LANG, tp.SUFFIX = 'ja', '-ja'
    for pid in a.post_ids:
        src = tp.get_post(pid)['content']['raw']
        path = tp.CACHE_DIR / f'{pid}.ja.json'
        data = json.loads(path.read_text())
        new = tp.collapse_ja_names(data['content'], src)
        print(f'▶ post {pid}：{"有改" if new != data["content"] else "沒變"}{"（dry-run）" if a.dry_run else ""}')
        if new != data['content'] and not a.dry_run:
            data['content'] = new
            path.write_text(json.dumps(data, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
