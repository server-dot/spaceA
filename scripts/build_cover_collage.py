# -*- coding: utf-8 -*-
# 商品類推薦文封面：真實商品圖拼底圖 + 版型文字（PingFang）+ 從 AI 版型圖裁下來的徽章／便利貼
# 用法：python3 scripts/build_cover_collage.py <素材資料夾> <輸出.jpg>
# 素材資料夾要有 prod/（10 張商品圖）、el_badge1~3.png、el_note.png（從 AI 版型圖裁下來，見 TODO.md「封面」）
# 標題、副標、tiles 清單依文章改；post 308 是第一篇用這套
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import sys
S = sys.argv[1]
FONT = '/System/Library/AssetsV2/com_apple_MobileAsset_Font7/3419f2a427639ad8c8e139149a287865a90fa17e.asset/AssetData/PingFang.ttc'
def font(size, idx=10):  # 10 = PingFang TC Semibold, 6 = Medium
    return ImageFont.truetype(FONT, size, index=idx)

W, H = 1600, 900
NAVY = (15, 42, 74); SKY = (2, 132, 199); DARK = (38, 38, 42); PILL = (23, 55, 110)

# 1. 底圖：10 張商品圖 5×2，object-fit cover，白色細縫
tiles = [
    ('prod/rebirth_94592', None), ('prod/03_tc', (150, 900, 1250, 1650)), ('prod/01_conas', None),
    ('prod/04_chocoarts', None), ('prod/05_vk', None),
    ('prod/sunrise_63967', None), ('prod/07_joyce', None), ('prod/08_f18', None),
    ('prod/09_darkolake', None), ('prod/10_terra', None),
]
cols, rows, gap = 5, 2, 6
tw = (W - gap * (cols - 1)) / cols; th = (H - gap * (rows - 1)) / rows
bg = Image.new('RGB', (W, H), (255, 255, 255))
for i, (f, crop) in enumerate(tiles):
    im = Image.open(f'{S}/{f}').convert('RGB')
    if crop: im = im.crop(crop)
    # cover
    sc = max(tw / im.width, th / im.height)
    im = im.resize((int(im.width * sc) + 1, int(im.height * sc) + 1), Image.LANCZOS)
    x0 = (im.width - tw) / 2; y0 = (im.height - th) / 2
    im = im.crop((int(x0), int(y0), int(x0 + tw), int(y0 + th)))
    c, r = i % cols, i // cols
    bg.paste(im, (int(c * (tw + gap)), int(r * (th + gap))))

# 2. 左側白色漸層，撐住文字可讀性
grad = Image.new('L', (W, 1), 0)
for x in range(W):
    t = x / W
    if t < 0.405: a = 255
    elif t < 0.45: a = int(255 * (1 - (t - 0.405) / 0.045))
    else: a = 0
    grad.putpixel((x, 0), a)
grad = grad.resize((W, H))
white = Image.new('RGB', (W, H), (252, 250, 246))
bg = Image.composite(white, bg, grad)
# 底圖整體稍微降一點對比，讓文字更穩
canvas = bg.convert('RGBA')
d = ImageDraw.Draw(canvas)

# 3. 膠囊標籤
pill_f = font(34)
txt = '2026 最新推薦'
tb = d.textbbox((0, 0), txt, font=pill_f)
px, py, pad = 90, 62, 22
pw = tb[2] - tb[0] + pad * 2; ph = tb[3] - tb[1] + 28
d.rounded_rectangle((px, py, px + pw, py + ph), radius=ph // 2, fill=PILL)
d.text((px + pad - tb[0], py + 14 - tb[1]), txt, font=pill_f, fill=(255, 255, 255))
# 右上三筆手繪短斜線
for k in range(3):
    x = px + pw + 18 + k * 14; y = py - 10 + k * 4
    d.line([(x, y + 26), (x + 12, y)], fill=SKY, width=5)

# 4. 大標兩行
t1, t2 = '黑巧克力禮盒', '怎麼選？'
f_title = font(112)
y1 = py + ph + 26
d.text((px - 6, y1), t1, font=f_title, fill=NAVY)
b1 = d.textbbox((px - 6, y1), t1, font=f_title)
y2 = b1[3] + 6
d.text((px - 6, y2), t2, font=f_title, fill=SKY)
b2 = d.textbbox((px - 6, y2), t2, font=f_title)
# 手繪筆刷橫線
uy = b2[3] + 14
brush = Image.new('RGBA', (W, H), (0, 0, 0, 0)); bd = ImageDraw.Draw(brush)
bd.line([(px, uy), (px + 440, uy + 4)], fill=(125, 205, 240, 200), width=16)
bd.line([(px + 30, uy + 10), (px + 400, uy + 12)], fill=(125, 205, 240, 140), width=9)
canvas = Image.alpha_composite(canvas, brush); d = ImageDraw.Draw(canvas)

# 5. 副標兩行，只有數字變色
f_sub = font(42)
sy = uy + 44
parts = [('精選 ', DARK), ('10', SKY), (' 款台灣黑巧克力禮盒', DARK)]
x = px
for s, col in parts:
    d.text((x, sy), s, font=f_sub, fill=col); x += d.textlength(s, font=f_sub)
sy2 = sy + 60
d.text((px, sy2), '價格、克數、苦度一次看懂', font=f_sub, fill=DARK)

# 6. 徽章（從 AI 版型圖裁下來的）
by = H - 60 - 176
bx = px
for i in range(3):
    e = Image.open(f'{S}/el_badge{i+1}.png').convert('RGBA').resize((176, 176), Image.LANCZOS)
    canvas.alpha_composite(e, (bx, by))
    if i < 2:
        d.line([(bx + 176 + 22, by + 30), (bx + 176 + 22, by + 146)], fill=(150, 150, 150, 200), width=2)
    bx += 176 + 46

# 7. 便利貼（右下）
note = Image.open(f'{S}/el_note.png').convert('RGBA')
nh = 300; note = note.resize((int(note.width * nh / note.height), nh), Image.LANCZOS)
# 陰影
sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); shd = ImageDraw.Draw(sh)
nx, ny = W - note.width - 48, H - note.height - 40
shd.rounded_rectangle((nx + 8, ny + 12, nx + note.width - 4, ny + note.height + 4), radius=6, fill=(0, 0, 0, 90))
sh = sh.filter(ImageFilter.GaussianBlur(10))
canvas = Image.alpha_composite(canvas, sh)
canvas.alpha_composite(note, (nx, ny))

out = sys.argv[2]
canvas.convert('RGB').save(out, quality=82, optimize=True)
print('saved', out)
