# -*- coding: utf-8 -*-
import json,sys,base64,urllib.request
S=sys.argv[1]
key=[l.split('=',1)[1].strip() for l in open('/Users/kc/stacktools/.env') if l.startswith('OPENROUTER_IMAGE_API_KEY=')][0] or [l.split('=',1)[1].strip() for l in open('/Users/kc/stacktools/.env') if l.startswith('OPENROUTER_API_KEY=')][0]
prompt='''16:9 橫幅用的空景照片，真實攝影質感，淺景深，不是插畫、不是平拍。

視角：相機在桌子前方偏上，大約 45 度俯角看向桌面，畫面有前後深度：前景是桌面，背景是失焦的明亮室內（窗邊、淺色牆、一點綠色植物的模糊色塊），背景要明顯柔焦。

桌面是淺色橡木（淺蜂蜜色），桌面上的道具：右後方一杯黑咖啡（白瓷杯放在小木托盤上）、右邊一小碟帶殼可可豆、右前方一小撮撒開的可可粉和幾顆散落的可可豆；左前方到中間鋪一塊淺米色亞麻布，布面有自然皺褶，斜斜地往畫面中間延伸；左上角有幾片綠色植物葉子入鏡角落一小部分；左邊靠上有一小碟可可粉（淺色小陶碟）。畫面左邊三分之二是之後要壓文字的區域，那裡的道具要淺色、低對比、柔焦，不能空也不能雜。畫面中央偏右、大約三分之一寬、一半高的桌面區域必須完全空著，之後會合成商品進去。

光線是窗邊柔和的自然光從左上方來，色調溫暖乾淨。整張圖不能出現任何巧克力、禮盒、包裝、紙盒、糖果、甜點，也不能有任何文字、logo、標籤、書本、手機、人物或手。照片必須滿版鋪到四個邊角，不能有大面積純白、過曝、留白，不要外框、不要邊條。'''
body={"model":"google/gemini-3.1-flash-image","modalities":["image","text"],"image_config":{"aspect_ratio":"16:9"},"messages":[{"role":"user","content":[{"type":"text","text":prompt}]}]}
req=urllib.request.Request("https://openrouter.ai/api/v1/chat/completions",data=json.dumps(body).encode(),headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"})
resp=json.load(urllib.request.urlopen(req,timeout=180))
imgs=resp['choices'][0]['message'].get('images') or []
if not imgs: print(json.dumps(resp)[:1500]); sys.exit(1)
open(f'{S}/scene308_v4.png','wb').write(base64.b64decode(imgs[0]['image_url']['url'].split(',',1)[1])); print('saved')
