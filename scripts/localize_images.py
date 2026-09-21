#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把推薦文卡片裡外連別家 CDN 的圖片下載進 WordPress 媒體庫，內文改指自家網址。
外站（shopline、cybassets、momo、cloudfront…）換圖或擋外連就破圖，校稿完跑一次。

用法：
  python3 scripts/localize_images.py 527          # 處理 post 527（中文版）
  python3 scripts/localize_images.py 527 --all-langs   # 連英日韓譯文一起（slug 加 -en/-ja/-ko）
  python3 scripts/localize_images.py 527 --dry-run

只動 <div class="brand-card"> 裡的 <img>；封面（featured image）本來就在媒體庫，不碰。
上傳一律用 curl（python urllib 上傳 WP media 會 403，見記憶）。
"""
import argparse, json, os, re, subprocess, sys, tempfile, urllib.request
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = {}
for line in open(os.path.join(ROOT, '.env.local')):
    line = line.strip()
    if line and not line.startswith('#') and '=' in line:
        k, v = line.split('=', 1); ENV[k] = v.strip().strip('"').strip("'")
WP = ENV['NEXT_PUBLIC_WORDPRESS_URL'].rstrip('/')
AUTH = f"{ENV['WORDPRESS_APP_USER']}:{ENV['WORDPRESS_APP_PASSWORD']}"
OWN_HOST = urlparse(WP).netloc

def curl_json(url, method='GET', data=None, headers=(), binary=None):
    cmd = ['curl', '-s', '-u', AUTH, '-X', method, url]
    for h in headers: cmd += ['-H', h]
    if data is not None: cmd += ['-H', 'Content-Type: application/json', '--data-binary', '@' + data]
    if binary is not None: cmd += ['--data-binary', '@' + binary]
    # WP 主機偶爾回 520/502，重試三次再放棄
    import time
    for attempt in range(3):
        out = subprocess.run(cmd, capture_output=True, text=True).stdout
        try: return json.loads(out)
        except Exception:
            if attempt < 2: time.sleep(5); continue
            sys.exit(f'WP 回傳不是 JSON：{out[:300]}')

def download(url, dest):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Referer': 'https://' + urlparse(url).netloc + '/'})
    with urllib.request.urlopen(req, timeout=30) as r:
        ctype = r.headers.get('Content-Type', '')
        open(dest, 'wb').write(r.read())
    return ctype

def ext_for(ctype, url):
    if 'png' in ctype: return 'png'
    if 'webp' in ctype: return 'webp'
    if 'jpeg' in ctype or 'jpg' in ctype: return 'jpg'
    m = re.search(r'\.(png|jpe?g|webp)(?:$|\?)', url, flags=re.I)
    return (m.group(1).lower().replace('jpeg', 'jpg') if m else 'jpg')

def slugify(s):
    s = re.sub(r'[^\w\-]+', '-', s.lower()).strip('-')
    return s[:60] or 'card'

def own_card_images(slug):
    """譯文的卡片圖跟中文版是同一張，直接沿用中文版已經傳進媒體庫的網址，不重複上傳"""
    m = re.match(r'(.*)-(en|ja|ko)$', slug)
    if not m: return {}
    zh = curl_json(f'{WP}/wp-json/wp/v2/posts?slug={m.group(1)}&_fields=content')
    if not zh: return {}
    out = {}
    for i, card in enumerate(zh[0]['content']['rendered'].split('<div class="brand-card">')[1:], 1):
        img = re.search(r'<div class="card-hero">\s*<img[^>]*?src="([^"]+)"', card)
        if img and urlparse(img.group(1)).netloc == OWN_HOST: out[i] = img.group(1)
    return out

def process(post_id, dry_run):
    post = curl_json(f'{WP}/wp-json/wp/v2/posts/{post_id}?context=edit&_fields=id,slug,content')
    content = post['content']['raw']; slug = post['slug']
    cards = content.split('<div class="brand-card">')
    reuse = own_card_images(slug)
    changed = 0
    for i, card in enumerate(cards[1:], 1):
        m = re.search(r'(<div class="card-hero">\s*<img[^>]*?src=")([^"]+)(")', card)
        if not m: continue
        src = m.group(2)
        if urlparse(src).netloc == OWN_HOST: continue
        if i in reuse:
            cards[i] = card.replace(m.group(0), m.group(1) + reuse[i] + m.group(3), 1)
            print(f'  {i:2d}. 沿用中文版 → {reuse[i].split("/")[-1]}'); changed += 1
            continue
        name = re.search(r'<h3>(.*?)</h3>', card)
        label = re.sub('<[^>]+>', '', name.group(1)) if name else f'card-{i}'
        print(f'  {i:2d}. {label[:30]} ← {src[:70]}')
        if dry_run: changed += 1; continue
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.bin').name
        try:
            ctype = download(src, tmp)
        except Exception as e:
            print(f'      ✗ 下載失敗：{e}'); continue
        ext = ext_for(ctype, src)
        fname = f'{slug}-card-{i}-{slugify(label.split()[0] if label.split() else label)}.{ext}'
        media = curl_json(f'{WP}/wp-json/wp/v2/media', 'POST',
                          headers=[f'Content-Disposition: attachment; filename={fname}', f'Content-Type: image/{"jpeg" if ext=="jpg" else ext}'],
                          binary=tmp)
        os.unlink(tmp)
        new_url = media.get('source_url')
        if not new_url:
            print(f'      ✗ 上傳失敗：{str(media)[:200]}'); continue
        alt = re.search(r'alt="([^"]*)"', card)
        if alt:
            with tempfile.NamedTemporaryFile('w', delete=False, suffix='.json') as f:
                json.dump({'alt_text': alt.group(1)}, f, ensure_ascii=False); altfile = f.name
            curl_json(f'{WP}/wp-json/wp/v2/media/{media["id"]}', 'POST', data=altfile); os.unlink(altfile)
        cards[i] = card.replace(m.group(0), m.group(1) + new_url + m.group(3), 1)
        print(f'      ✓ media {media["id"]} → {new_url.split("/")[-1]}')
        changed += 1
    if dry_run or changed == 0:
        print(f'  {"（dry-run）" if dry_run else ""}共 {changed} 張要換' if dry_run else '  沒有外連圖片，不用動'); return
    new_content = '<div class="brand-card">'.join(cards)
    with tempfile.NamedTemporaryFile('w', delete=False, suffix='.json') as f:
        json.dump({'content': new_content}, f, ensure_ascii=False); body = f.name
    r = curl_json(f'{WP}/wp-json/wp/v2/posts/{post_id}', 'POST', data=body); os.unlink(body)
    print(f'  → post {post_id} 更新 {changed} 張' if r.get('id') else f'  ✗ 更新失敗：{str(r)[:200]}')
    if r.get('id'):
        revalidate(post_id, r.get('slug', post['slug']))

def revalidate(post_id, post_slug):
    """換完圖直接叫正式站清這篇的快取；失敗只提示，改用 scripts/revalidate.sh"""
    secret = ENV.get('REVALIDATE_SECRET')
    if not secret:
        print('  ⚠ .env.local 沒有 REVALIDATE_SECRET，前台要自己跑 scripts/revalidate.sh'); return
    cats = curl_json(f'{WP}/wp-json/wp/v2/categories?post={post_id}&_fields=slug')
    cat = cats[0]['slug'] if isinstance(cats, list) and cats else ''
    site = ENV.get('REVALIDATE_SITE_URL', 'https://spacea.com.tw').rstrip('/')
    out = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', '-X', 'POST', f'{site}/api/revalidate',
                          '-H', f'x-revalidate-secret: {secret}', '-H', 'Content-Type: application/json',
                          '-d', json.dumps({'slug': post_slug, 'category': cat})], capture_output=True, text=True).stdout
    print(f'  ✓ 前台快取已清' if out == '200' else f'  ⚠ 清前台快取回 {out}，自己跑 scripts/revalidate.sh {post_slug} {cat}')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('post_ids', nargs='+', type=int)
    ap.add_argument('--all-langs', action='store_true', help='連 -en/-ja/-ko 譯文一起處理')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    ids = list(a.post_ids)
    if a.all_langs:
        for pid in list(ids):
            slug = curl_json(f'{WP}/wp-json/wp/v2/posts/{pid}?_fields=slug')['slug']
            for suf in ('en', 'ja', 'ko'):
                found = curl_json(f'{WP}/wp-json/wp/v2/posts?slug={slug}-{suf}&_fields=id')
                if found: ids.append(found[0]['id'])
    for pid in ids:
        print(f'post {pid}')
        process(pid, a.dry_run)

if __name__ == '__main__':
    main()
