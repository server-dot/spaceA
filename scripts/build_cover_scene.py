# -*- coding: utf-8 -*-
# 商品類封面：AI 空景（無商品）+ 真實商品去背合成 + 版型文字
# 用法：python3 build_cover_scene.py <素材資料夾> <輸出.jpg> <空景檔名>
# 素材資料夾要有：空景、cut_*.png（去背商品）、el_badge1~3.png、el_note.png、NotoSansCJKtc-Black.otf
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import sys
S = sys.argv[1]; OUT = sys.argv[2]; SCENE = sys.argv[3]
FONT = f'{S}/NotoSansCJKtc-Black.otf'
def font(size): return ImageFont.truetype(FONT, size)
W, H = 1600, 900
NAVY = (18, 40, 80); SKY = (2, 132, 199); DARK = (32, 32, 36); WHITE = (255, 255, 255)
PILL = (23, 55, 110)

scene = Image.open(f'{S}/{SCENE}').convert('RGB').resize((W, H), Image.LANCZOS)
canvas = scene.convert('RGBA')

def place(name, box_w, cx, cy, rot=0, shadow=(10, 18)):
    """貼一個去背商品：等比縮到寬 box_w，中心 (cx,cy)，加柔和陰影"""
    global canvas
    im = Image.open(f'{S}/{name}').convert('RGBA'); im = im.crop(im.getbbox())
    sc = box_w / im.width; im = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS)
    if rot: im = im.rotate(rot, expand=True, resample=Image.BICUBIC)
    x, y = int(cx - im.width / 2), int(cy - im.height / 2)
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    a = im.split()[3].point(lambda v: int(v * 0.5))
    sh.paste(Image.new('RGBA', im.size, (25, 12, 5, 255)), (x + shadow[0], y + shadow[1]), a)
    canvas = Image.alpha_composite(canvas, sh.filter(ImageFilter.GaussianBlur(14)))
    canvas.alpha_composite(im, (x, y))

# 商品（角度要跟空景一致：越靠畫面下方的越俯視）
place('cut_07_joyce_box.png', 470, 1090, 470, rot=-4)   # Joyce 25 顆生巧盒（蓋子切掉，角度對不上），約 50 度
place('cut_08_f18.png', 400, 1000, 775, rot=-4)     # 18度C 托盤，約 70 度，放前景

d = ImageDraw.Draw(canvas)
def text(xy, s, f, fill, stroke=0):
    d.text(xy, s, font=f, fill=fill, stroke_width=stroke, stroke_fill=WHITE)

# 1. 膠囊（深藍底、白邊）
f_pill = font(34); txt = '2026 最新推薦'
tb = d.textbbox((0, 0), txt, font=f_pill); px, py, pad = 96, 58, 24
pw = tb[2] - tb[0] + pad * 2; ph = tb[3] - tb[1] + 26
d.rounded_rectangle((px - 4, py - 4, px + pw + 4, py + ph + 4), radius=(ph + 8) // 2, fill=WHITE)
d.rounded_rectangle((px, py, px + pw, py + ph), radius=ph // 2, fill=PILL)
d.text((px + pad - tb[0], py + 13 - tb[1]), txt, font=f_pill, fill=WHITE)
for k in range(3):  # 右上三筆手繪短斜線
    x = px + pw + 22 + k * 15; y = py - 14 + k * 4
    d.line([(x, y + 26), (x + 12, y)], fill=SKY, width=6)

# 2. 大標一行：主題深藍 ＋「怎麼選？」亮藍，白色描邊
f_title = font(104); ty = py + ph + 22
t1, t2 = '黑巧克力禮盒', '怎麼選？'
text((px, ty), t1, f_title, NAVY, stroke=7)
w1 = d.textlength(t1, font=f_title)
text((px + w1 + 6, ty), t2, f_title, SKY, stroke=7)
b = d.textbbox((px, ty), t1, font=f_title)

# 3. 副標兩行：只有數字變色，白色描邊
f_sub = font(56); sy = b[3] + 30; x = px
for s, col in [('精選 ', DARK), ('10', SKY), (' 款台灣黑巧克力禮盒', DARK)]:
    text((x, sy), s, f_sub, col, stroke=5); x += d.textlength(s, font=f_sub)
text((px, sy + 74), '價格、克數、苦度一次看懂', f_sub, DARK, stroke=5)

# 4. 徽章（從 AI 版型圖裁下來的），之間細直線
by = H - 56 - 184; bx = px
for i in range(3):
    e = Image.open(f'{S}/el_badge{i+1}.png').convert('RGBA').resize((184, 184), Image.LANCZOS)
    canvas.alpha_composite(e, (bx, by))
    if i < 2: d.line([(bx + 206, by + 34), (bx + 206, by + 150)], fill=(90, 90, 90, 160), width=2)
    bx += 228

# 5. 便利貼（右下）
note = Image.open(f'{S}/el_note.png').convert('RGBA'); nh = 300
note = note.resize((int(note.width * nh / note.height), nh), Image.LANCZOS)
nx, ny = W - note.width - 48, H - note.height - 40
sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(sh).rounded_rectangle((nx + 8, ny + 12, nx + note.width - 4, ny + note.height + 4), radius=6, fill=(0, 0, 0, 110))
canvas = Image.alpha_composite(canvas, sh.filter(ImageFilter.GaussianBlur(10)))
canvas.alpha_composite(note, (nx, ny))

canvas.convert('RGB').save(OUT, quality=82, optimize=True); print('saved', OUT)
