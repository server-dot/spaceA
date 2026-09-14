# -*- coding: utf-8 -*-
# 商品類封面 B 案：AI 空景 + 真實商品去背合成 + 版型文字
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import sys
S = sys.argv[1]; OUT = sys.argv[2]; LIGHT = len(sys.argv) > 3 and sys.argv[3] == 'light'
FONT = '/System/Library/AssetsV2/com_apple_MobileAsset_Font7/3419f2a427639ad8c8e139149a287865a90fa17e.asset/AssetData/PingFang.ttc'
def font(size, idx=10): return ImageFont.truetype(FONT, size, index=idx)
W, H = 1600, 900
if LIGHT:
    T1 = (15, 42, 74); T2 = (2, 132, 199); SUB = (38, 38, 42); NUM = (2, 132, 199)
else:
    T1 = (255, 252, 246); T2 = (125, 211, 252); SUB = (245, 242, 236); NUM = (125, 211, 252)
PILL = (23, 55, 110); SKY = (2, 132, 199)

scene = Image.open(f'{S}/' + (sys.argv[4] if len(sys.argv) > 4 else 'scene308.png')).convert('RGB').resize((W, H), Image.LANCZOS)
canvas = scene.convert('RGBA')

def place(name, box_w, cx, cy, rot=0, shadow=(10, 18)):
    """貼一個去背商品：等比縮到寬 box_w，中心 (cx,cy)，加柔和陰影"""
    global canvas
    im = Image.open(f'{S}/{name}').convert('RGBA'); im = im.crop(im.getbbox())
    sc = box_w / im.width; im = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS)
    if rot: im = im.rotate(rot, expand=True, resample=Image.BICUBIC)
    x, y = int(cx - im.width / 2), int(cy - im.height / 2)
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    a = im.split()[3].point(lambda v: int(v * 0.55))
    sh.paste(Image.new('RGBA', im.size, (20, 10, 5, 255)), (x + shadow[0], y + shadow[1]), a)
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    canvas = Image.alpha_composite(canvas, sh)
    canvas.alpha_composite(im, (x, y))

# 商品：Joyce 生巧盒（主）、18度C 生巧托盤（副）
place('cut_07_joyce_box.png', 500, 1010, 400, rot=-7)
place('cut_08_f18.png', 430, 1000, 735, rot=6)

d = ImageDraw.Draw(canvas)
# 膠囊
pill_f = font(34); txt = '2026 最新推薦'
tb = d.textbbox((0, 0), txt, font=pill_f); px, py, pad = 90, 62, 22
pw = tb[2] - tb[0] + pad * 2; ph = tb[3] - tb[1] + 28
d.rounded_rectangle((px, py, px + pw, py + ph), radius=ph // 2, fill=PILL)
d.text((px + pad - tb[0], py + 14 - tb[1]), txt, font=pill_f, fill=(255, 255, 255))
for k in range(3):
    x = px + pw + 18 + k * 14; y = py - 10 + k * 4
    d.line([(x, y + 26), (x + 12, y)], fill=SKY, width=5)
# 大標
f_title = font(112); y1 = py + ph + 26
d.text((px - 6, y1), '黑巧克力禮盒', font=f_title, fill=T1)
b1 = d.textbbox((px - 6, y1), '黑巧克力禮盒', font=f_title); y2 = b1[3] + 6
d.text((px - 6, y2), '怎麼選？', font=f_title, fill=T2)
b2 = d.textbbox((px - 6, y2), '怎麼選？', font=f_title); uy = b2[3] + 14
brush = Image.new('RGBA', (W, H), (0, 0, 0, 0)); bd = ImageDraw.Draw(brush)
bd.line([(px, uy), (px + 440, uy + 4)], fill=(125, 205, 240, 200), width=16)
bd.line([(px + 30, uy + 10), (px + 400, uy + 12)], fill=(125, 205, 240, 140), width=9)
canvas = Image.alpha_composite(canvas, brush); d = ImageDraw.Draw(canvas)
# 副標
f_sub = font(42); sy = uy + 44; x = px
for s, col in [('精選 ', SUB), ('10', NUM), (' 款台灣黑巧克力禮盒', SUB)]:
    d.text((x, sy), s, font=f_sub, fill=col); x += d.textlength(s, font=f_sub)
d.text((px, sy + 60), '價格、克數、苦度一次看懂', font=f_sub, fill=SUB)
# 徽章
by = H - 60 - 176; bx = px
for i in range(3):
    e = Image.open(f'{S}/el_badge{i+1}.png').convert('RGBA').resize((176, 176), Image.LANCZOS)
    canvas.alpha_composite(e, (bx, by))
    if i < 2: d.line([(bx + 198, by + 30), (bx + 198, by + 146)], fill=(200, 200, 200, 200), width=2)
    bx += 222
# 便利貼
note = Image.open(f'{S}/el_note.png').convert('RGBA'); nh = 300
note = note.resize((int(note.width * nh / note.height), nh), Image.LANCZOS)
nx, ny = W - note.width - 48, H - note.height - 40
sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(sh).rounded_rectangle((nx + 8, ny + 12, nx + note.width - 4, ny + note.height + 4), radius=6, fill=(0, 0, 0, 110))
canvas = Image.alpha_composite(canvas, sh.filter(ImageFilter.GaussianBlur(10)))
canvas.alpha_composite(note, (nx, ny))
canvas.convert('RGB').save(OUT, quality=82, optimize=True); print('saved', OUT)
