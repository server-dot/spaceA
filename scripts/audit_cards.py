# -*- coding: utf-8 -*-
"""把一篇推薦文的品牌卡片攤平印出來（款名、連結、點評、每一格 dt/dd），事實查核用。
用法：set -a && . .env.local && set +a && python3 scripts/audit_cards.py <post id>
配合 docs/推薦文交件檢查清單.md 第 0 節：每一格拿去對官網。原始 HTML 順便存到 scratchpad。"""
import os,sys,json,re,html,urllib.request,base64
WP=os.environ['NEXT_PUBLIC_WORDPRESS_URL'].rstrip('/'); AUTH=base64.b64encode(f"{os.environ['WORDPRESS_APP_USER']}:{os.environ['WORDPRESS_APP_PASSWORD']}".encode()).decode()
pid=sys.argv[1]
d=json.load(urllib.request.urlopen(urllib.request.Request(f'{WP}/wp-json/wp/v2/posts/{pid}?context=edit&_fields=id,title,content',headers={'Authorization':'Basic '+AUTH,'User-Agent':'Mozilla/5.0'})))
c=d['content']['raw']; open(f'/tmp/{pid}.raw.html','w').write(c)
print('TITLE:',d['title']['raw'])
cards=re.split(r'<div class="brand-card">',c)[1:]
for i,card in enumerate(cards,1):
    h3=re.search(r'<h3>(.*?)</h3>',card); link=re.search(r'class="ref-link"><a href="([^"]+)"',card); img=re.search(r'<img src="([^"]+)"',card)
    verdict=re.search(r'<span class="lbl">小編點評</span>(.*?)</div>',card,re.S)
    facts=re.findall(r'<dt>(.*?)</dt><dd>(.*?)</dd>',card,re.S)
    print(f'\n#{i} {html.unescape(h3.group(1)) if h3 else "?"}\n  link: {link.group(1) if link else "-"}\n  點評: {html.unescape(re.sub("<[^>]+>","",verdict.group(1))).strip()[:200] if verdict else ""}')
    for k,v in facts:
        v=html.unescape(re.sub(r'<li[^>]*>','\n      • ',re.sub(r'<[^>]+>','',re.sub(r'<li[^>]*>','<li>',v)))).strip()
        if k in ('官方資訊',): v='\n      '+v.replace('\n','\n      ')
        print(f'  {k}: {v[:300]}')
