#!/usr/bin/env python3
# 用 /usr/bin/python3 跑（homebrew 那支沒裝 Pillow）
# -*- coding: utf-8 -*-
"""
幫每篇推薦文補 4:3 與 1:1 兩個比例的圖，寫進 Article schema 的 image 陣列。

為什麼要這個：封面是 16:9（1376×768），Google 搜尋結果的縮圖框接近正方形，
16:9 塞進去上下會留白，看起來就是一條橫的。Google 的做法是同一篇給多個比例
（16x9 / 4x3 / 1x1）讓它自己挑，所以這支把第一張卡片的圖（有客戶的篇就是客戶）
裁成 4:3 與 1:1 傳進媒體庫，再把網址記到 src/lib/social-crops.json 給前端讀。

封面不拿來裁：封面左邊是大標、右下有便利貼，裁成方形會切出半個字，很難看。

用法：
  python3 scripts/make_social_crops.py 224
  python3 scripts/make_social_crops.py --all
  python3 scripts/make_social_crops.py 224 --dry-run      # 只存到本機 /tmp 不上傳
  python3 scripts/make_social_crops.py 527 --source <網址> # 卡片圖太小時自己指定原圖

譯文不用跑：英日韓共用中文版的封面，前端是用封面網址當 key 去查表。
上傳一律用 curl（python urllib 上傳 WP media 會 403）。
"""
import argparse, io, json, os, re, subprocess, sys, tempfile, urllib.parse, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP_FILE = os.path.join(ROOT, 'src', 'lib', 'social-crops.json')
ENV = {}
for line in open(os.path.join(ROOT, '.env.local')):
    line = line.strip()
    if line and not line.startswith('#') and '=' in line:
        k, v = line.split('=', 1); ENV[k] = v.strip().strip('"').strip("'")
WP = ENV['NEXT_PUBLIC_WORDPRESS_URL'].rstrip('/')
AUTH = f"{ENV['WORDPRESS_APP_USER']}:{ENV['WORDPRESS_APP_PASSWORD']}"

# Google 建議一張圖至少 80 萬像素，1200 見方剛好過線
TARGET = {'1x1': (1200, 1200), '4x3': (1200, 900)}


def curl_json(url, method='GET', data=None, headers=(), binary=None):
    cmd = ['curl', '-s', '-u', AUTH, '-X', method, url]
    for h in headers: cmd += ['-H', h]
    if data is not None: cmd += ['-H', 'Content-Type: application/json', '--data-binary', '@' + data]
    if binary is not None: cmd += ['--data-binary', '@' + binary]
    import time
    for attempt in range(3):
        out = subprocess.run(cmd, capture_output=True, text=True).stdout
        try: return json.loads(out)
        except Exception:
            if attempt < 2: time.sleep(5); continue
            sys.exit(f'WP 回傳不是 JSON：{out[:300]}')


def fetch_image(url):
    # 檔名有中文的要先 percent-encode，不然 urllib 會丟 ascii codec 錯
    safe = urllib.parse.quote(url, safe=':/?&=%')
    req = urllib.request.Request(safe, headers={'User-Agent': 'Mozilla/5.0',
                                                'Referer': 'https://' + urllib.parse.urlparse(url).netloc + '/'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return Image.open(io.BytesIO(r.read())).convert('RGB')


def crop(im, ratio):
    """置中裁成指定比例再縮到目標尺寸；來源不夠大就放大（縮圖只有 92px，放大看不出來）"""
    tw, th = TARGET[ratio]
    w, h = im.size
    want = tw / th
    if w / h > want:
        nw = int(h * want); box = ((w - nw) // 2, 0, (w - nw) // 2 + nw, h)
    else:
        nh = int(w / want); box = (0, (h - nh) // 2, w, (h - nh) // 2 + nh)
    return im.crop(box).resize((tw, th), Image.LANCZOS)


def upload(img, fname):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg').name
    img.save(tmp, quality=88)
    media = curl_json(f'{WP}/wp-json/wp/v2/media', 'POST',
                      headers=[f'Content-Disposition: attachment; filename={fname}', 'Content-Type: image/jpeg'],
                      binary=tmp)
    os.unlink(tmp)
    if not media.get('source_url'):
        print(f'      ✗ 上傳失敗：{str(media)[:200]}'); return None
    return media['source_url']


def process(post_id, source_override, dry_run):
    post = curl_json(f'{WP}/wp-json/wp/v2/posts/{post_id}?_fields=id,slug,content,featured_media')
    slug = post['slug']
    if re.search(r'-(en|ja|ko)$', slug):
        print(f'  {slug} 是譯文，共用中文版的圖，跳過'); return None
    if not post.get('featured_media'):
        print(f'  post {post_id} 沒有封面（featured image），前端查表是用封面網址當 key，先設封面'); return None
    cover = curl_json(f'{WP}/wp-json/wp/v2/media/{post["featured_media"]}?_fields=source_url')['source_url']

    src = source_override
    if not src:
        m = re.search(r'class="card-hero">\s*<img[^>]*?src="([^"]+)"', post['content']['rendered'])
        if not m:
            print(f'  {slug} 找不到卡片圖，要自己用 --source 指定'); return None
        src = m.group(1)
    im = fetch_image(src)
    short = min(im.size)
    note = '' if short >= 900 else f'  ⚠ 來源只有 {im.size[0]}×{im.size[1]}，方形邊長 {short}，會放大'
    print(f'  {slug} ← {src.split("/")[-1][:50]}{note}')

    base = re.sub(r'\.(jpg|jpeg|png|webp)$', '', cover.split('/')[-1], flags=re.I)
    out = {}
    for ratio in ('4x3', '1x1'):
        img = crop(im, ratio)
        fname = f'{base}-{ratio}.jpg'
        if dry_run:
            path = os.path.join('/tmp', fname); img.save(path, quality=88)
            print(f'      （dry-run）{path}'); out[ratio] = path; continue
        url = upload(img, fname)
        if not url: return None
        print(f'      ✓ {ratio} → {url.split("/")[-1]}')
        out[ratio] = url
    return cover, out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('post_ids', nargs='*', type=int)
    ap.add_argument('--all', action='store_true', help='跑所有中文文章')
    ap.add_argument('--source', help='自己指定 1:1 的來源圖網址（卡片圖太小時用）')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()

    ids = list(a.post_ids)
    if a.all:
        posts = curl_json(f'{WP}/wp-json/wp/v2/posts?per_page=100&_fields=id,slug')
        ids += [p['id'] for p in posts if not re.search(r'-(en|ja|ko)$', p['slug']) and p['id'] not in ids]
    if not ids: sys.exit('要給 post id 或 --all')
    if a.source and len(ids) != 1: sys.exit('--source 一次只能配一篇')

    mapping = json.load(open(MAP_FILE)) if os.path.exists(MAP_FILE) else {}
    for pid in sorted(ids):
        r = process(pid, a.source, a.dry_run)
        if r and not a.dry_run:
            cover, out = r
            mapping[cover] = out
    if not a.dry_run:
        os.makedirs(os.path.dirname(MAP_FILE), exist_ok=True)
        json.dump(mapping, open(MAP_FILE, 'w'), ensure_ascii=False, indent=2, sort_keys=True)
        print(f'\n已寫入 {os.path.relpath(MAP_FILE, ROOT)}（{len(mapping)} 篇），記得 commit 並部署')


if __name__ == '__main__':
    main()
