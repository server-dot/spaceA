# -*- coding: utf-8 -*-
import json,sys,base64,urllib.request
S=sys.argv[1]
key=[l.split('=',1)[1].strip() for l in open('/Users/kc/stacktools/.env') if l.startswith('OPENROUTER_IMAGE_API_KEY=')][0] or [l.split('=',1)[1].strip() for l in open('/Users/kc/stacktools/.env') if l.startswith('OPENROUTER_API_KEY=')][0]
prompt='''16:9 橫幅用的空景照片，真實攝影質感，不是插畫。

場景：一張淺色橡木桌（淺蜂蜜色、木紋清楚），從大約 65 度的高角度俯拍，整張桌面都有東西，不要有大片光禿禿的桌面。

畫面右邊三分之一：右上角一杯黑咖啡（白瓷杯放在小木托盤上）、右上方一小碟帶殼可可豆、右邊中間一小撮撒開的可可粉和幾顆散落的可可豆、右下角一角淺米色亞麻餐巾。

畫面左邊三分之二是文字區，要有「柔和、低對比」的道具鋪底，不能空、也不能太雜：一塊淺米色亞麻布從左下往中間斜鋪，蓋住左下角到中間一大塊桌面，布面有自然皺褶；左上角有幾片綠色植物葉子入鏡，只入鏡角落一小部分；左邊靠上有一小碟可可粉（淺色小陶碟）和三四顆散落的可可豆；桌面其餘露出的地方有淡淡的可可粉粉塵。左邊這些道具要淺色、柔焦一點、對比低，讓深色文字壓上去還看得清楚。

整張圖不能出現任何巧克力、禮盒、包裝、紙盒、糖果、甜點，也不能有任何文字、logo、標籤、書本、手機、人物或手。照片必須滿版鋪到四個邊角，四個邊角都是桌面、布或道具的實景，不能有大面積純白、過曝、留白或霧化，不要外框、不要邊條。'''
body={"model":"google/gemini-3.1-flash-image","modalities":["image","text"],"image_config":{"aspect_ratio":"16:9"},"messages":[{"role":"user","content":[{"type":"text","text":prompt}]}]}
req=urllib.request.Request("https://openrouter.ai/api/v1/chat/completions",data=json.dumps(body).encode(),headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"})
resp=json.load(urllib.request.urlopen(req,timeout=180))
imgs=resp['choices'][0]['message'].get('images') or []
if not imgs: print(json.dumps(resp)[:1500]); sys.exit(1)
open(f'{S}/scene308_v3.png','wb').write(base64.b64decode(imgs[0]['image_url']['url'].split(',',1)[1])); print('saved')
