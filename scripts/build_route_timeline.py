# -*- coding: utf-8 -*-
# 三條路線的橫向行程時間軸 SVG：每條路線兩列（Day 1／Day 2），節點之間箭頭標車程，住宿點用琥珀色房子特別標出來
INK = '#0369a1'; ACC = '#0284c7'; LODGE = '#b45309'; LODGE_BG = '#fff7d6'; LODGE_ST = '#f59e0b'
W = 720; LEFT = 110; RIGHT = 608
ROUTES = [
  ('路線 1｜清境＋合歡山（兩天一夜）', [
    ('Day 1', [('埔里', '午餐補給', None), ('青青草原', '14:30 綿羊秀', '40 分'), ('小瑞士花園', '或天空步道', '5 分'), ('住 佛羅倫斯山莊', '一泊二食', '5 分', True)]),
    ('Day 2', [('武嶺看日出', '04:00 出發', None), ('石門山', '來回 40 分', '10 分'), ('埔里', '下山', '1 小時'), ('妮娜巧克力城堡', 'DIY 先預約', '10 分'), ('回程', '', None)]),
  ]),
  ('路線 2｜日月潭＋九族（兩天）', [
    ('Day 1', [('向山遊客中心', '租腳踏車', None), ('水社碼頭', '搭船', '騎 3 公里'), ('伊達邵', '午餐', '船 15 分'), ('鹿篙咖啡莊園', '下午茶', '20 分'), ('住 水社碼頭周邊', '走路有晚餐', '25 分', True)]),
    ('Day 2', [('伊達邵', '搭日月潭纜車', None), ('九族文化村', '玩到閉園', '纜車 15 分'), ('纜車回伊達邵', '取車回程', None)]),
  ]),
  ('路線 3｜溪頭＋妖怪村（一天一夜）', [
    ('Day 1', [('溪頭園區', '15:00 星光票', None), ('大學池', '空中走廊', '步行'), ('妖怪村', '晚餐、點燈', '走路 10 分'), ('住 溪頭福華／明山', '園區旁', '走路', True)]),
    ('Day 2', [('07:00 再進園', '竹林沒人', None), ('竹山', '接國道三號回程', '40 分')]),
  ]),
]

def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;')
out = []
y = 24
out.append(f'<text x="{W/2}" y="{y+14}" text-anchor="middle" font-size="17" font-weight="700" fill="{INK}" font-family="sans-serif">3 條南投路線的行程圖</text>')
y += 40
for title, days in ROUTES:
    # 路線標題帶
    out.append(f'<rect x="18" y="{y}" width="{W-36}" height="30" rx="15" fill="{ACC}"/>')
    out.append(f'<text x="34" y="{y+20}" font-size="14" font-weight="700" fill="#fff" font-family="sans-serif">{esc(title)}</text>')
    y += 46
    for day, stops in days:
        ly = y + 22  # 主線高度
        n = len(stops)
        xs = [LEFT + (RIGHT - LEFT) * (i / (n - 1)) if n > 1 else (LEFT + RIGHT) / 2 for i in range(n)]
        # Day 標籤
        out.append(f'<rect x="18" y="{ly-11}" width="52" height="22" rx="11" fill="#fff" stroke="{ACC}" stroke-width="1.5"/>')
        out.append(f'<text x="44" y="{ly+4}" text-anchor="middle" font-size="12" font-weight="700" fill="{INK}" font-family="sans-serif">{day}</text>')
        # 主線與箭頭
        out.append(f'<line x1="{xs[0]}" y1="{ly}" x2="{xs[-1]}" y2="{ly}" stroke="{ACC}" stroke-width="2.5"/>')
        for i in range(1, n):
            mx = (xs[i-1] + xs[i]) / 2
            ax = xs[i] - 12
            out.append(f'<path d="M{ax-6} {ly-5} L{ax} {ly} L{ax-6} {ly+5}" fill="none" stroke="{ACC}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>')
            drive = stops[i][2]
            if drive:
                out.append(f'<text x="{mx}" y="{ly-8}" text-anchor="middle" font-size="10.5" fill="{ACC}" font-family="sans-serif">{esc(drive)}</text>')
        # 節點
        for i, st in enumerate(stops):
            name, sub = st[0], st[1]; lodge = len(st) > 3 and st[3]
            x = xs[i]
            if lodge:
                out.append(f'<rect x="{x-14}" y="{ly-14}" width="28" height="28" rx="7" fill="{LODGE_BG}" stroke="{LODGE_ST}" stroke-width="2.5"/>')
                # 小房子
                out.append(f'<path d="M{x-8} {ly+1} L{x} {ly-7} L{x+8} {ly+1} M{x-5.5} {ly-1.5} V{ly+7} H{x+5.5} V{ly-1.5}" fill="none" stroke="{LODGE}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>')
                col = LODGE; wt = '700'
            else:
                out.append(f'<circle cx="{x}" cy="{ly}" r="9" fill="#fff" stroke="{ACC}" stroke-width="2.5"/>')
                col = INK; wt = '700'
            out.append(f'<text x="{x}" y="{ly+30}" text-anchor="middle" font-size="12.5" font-weight="{wt}" fill="{col}" font-family="sans-serif">{esc(name)}</text>')
            if sub:
                out.append(f'<text x="{x}" y="{ly+45}" text-anchor="middle" font-size="11" fill="{LODGE if lodge else "#6f6a63"}" font-family="sans-serif">{esc(sub)}</text>')
        y += 76
    y += 8
# 圖例
out.append(f'<rect x="18" y="{y}" width="{W-36}" height="1" fill="#e0f2fe"/>')
y += 16
out.append(f'<circle cx="34" cy="{y+6}" r="7" fill="#fff" stroke="{ACC}" stroke-width="2"/><text x="48" y="{y+10}" font-size="11.5" fill="#46433f" font-family="sans-serif">景點</text>')
out.append(f'<rect x="96" y="{y-4}" width="20" height="20" rx="5" fill="{LODGE_BG}" stroke="{LODGE_ST}" stroke-width="2"/><text x="124" y="{y+10}" font-size="11.5" fill="#46433f" font-family="sans-serif">住宿點</text>')
out.append(f'<text x="190" y="{y+10}" font-size="11.5" fill="{ACC}" font-family="sans-serif">箭頭上的數字是車程</text>')
out.append(f'<rect x="{W-110}" y="{y-4}" width="20" height="20" rx="6" fill="{ACC}"/><text x="{W-100}" y="{y+11}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="sans-serif">S</text><text x="{W-84}" y="{y+11}" font-size="14" font-weight="700" fill="{INK}" font-family="sans-serif">paceA</text>')
H = y + 30
svg = (f'<div class="route-timeline-wrap" style="overflow-x:auto;margin:24px 0;"><svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" style="min-width:680px;width:100%;height:auto;display:block;">\n'
       f'<rect x="5" y="5" width="{W-10}" height="{H-10}" rx="28" fill="#f0f9ff" stroke="{ACC}" stroke-width="9"/>\n' + '\n'.join(out) + '\n</svg></div>')
import sys
open(sys.argv[1], 'w', encoding='utf-8').write(svg)
print('ok', H)
