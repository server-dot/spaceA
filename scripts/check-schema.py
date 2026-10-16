#!/usr/bin/env python3
"""
照 Google 搜尋結果功能的規則檢查前台 JSON-LD，抓 GSC 會寄信的錯誤（產品摘要、麵包屑、常見問題、文章…）。
GSC 已經兩次來信（Offer 被當商家資訊、Product 缺 offers），這支在 Google 之前先抓到。

用法：
  scripts/check-schema.py                 掃 sitemap 全部網址
  scripts/check-schema.py <url> [<url>…]  只掃指定網址（revalidate.sh 清完快取會自動跑該篇）
有錯 exit 1。新增別的 schema 類型時，先在 RULES 補上 Google 的必填欄位再上線。
"""
import json
import re
import sys
import urllib.request

SITE = "https://spacea.com.tw"
# Cloudflare 會擋 Python 預設 UA
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36"}

# Google 有搜尋結果功能、但我們沒處理過規則的類型：出現就擋，先補規則再說
UNHANDLED = {
    "Review", "AggregateRating", "Recipe", "Event", "JobPosting", "Course", "VideoObject",
    "HowTo", "QAPage", "SoftwareApplication", "Movie", "Book", "Dataset", "ClaimReview",
    "EmployerAggregateRating", "MathSolver", "DiscussionForumPosting", "ProfilePage",
    "Vehicle", "ProductGroup", "MerchantReturnPolicy", "OfferShippingDetails",
}


def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read().decode()


def nonempty(v):
    return v not in (None, "", [], {})


def types_of(node):
    t = node.get("@type")
    return set(t) if isinstance(t, list) else {t}


def check_node(n, err):
    ts = types_of(n)
    name = n.get("name") or n.get("headline") or ""

    for t in ts & UNHANDLED:
        err(f"{t}：還沒寫檢查規則，先對 Google 文件補進 RULES")

    if "Product" in ts:
        if not nonempty(n.get("name")):
            err("Product 缺 name")
        if not any(nonempty(n.get(k)) for k in ("offers", "review", "aggregateRating")):
            err(f"Product「{name}」缺 offers／review／aggregateRating（產品摘要重大問題）")

    if "Offer" in ts:
        # 單一 Offer 會被當商家資訊，要退貨政策、運費；我們不是賣家
        err(f"用了 Offer（會進商家資訊檢查），改 AggregateOffer：{json.dumps(n, ensure_ascii=False)[:120]}")

    if "AggregateOffer" in ts:
        lp = n.get("lowPrice")
        if not isinstance(lp, (int, float)) or lp <= 0:
            err(f"AggregateOffer lowPrice 不是正數：{lp!r}")
        if not nonempty(n.get("priceCurrency")):
            err("AggregateOffer 缺 priceCurrency")

    if "BreadcrumbList" in ts:
        items = n.get("itemListElement") or []
        if not items:
            err("BreadcrumbList 沒有項目")
        for i, li in enumerate(items):
            if not isinstance(li.get("position"), int):
                err(f"麵包屑第 {i + 1} 項缺 position")
            if not nonempty(li.get("name")) and not (isinstance(li.get("item"), dict) and nonempty(li["item"].get("name"))):
                err(f"麵包屑第 {i + 1} 項缺 name")
            if i < len(items) - 1 and not nonempty(li.get("item")):
                err(f"麵包屑第 {i + 1} 項缺 item（只有最後一項可以省）")

    if "FAQPage" in ts:
        qs = n.get("mainEntity") or []
        if not qs:
            err("FAQPage 沒有問題")
        for q in qs:
            if not nonempty(q.get("name")):
                err("FAQ 問題缺 name")
            if not nonempty((q.get("acceptedAnswer") or {}).get("text")):
                err(f"FAQ「{q.get('name', '')[:30]}」缺答案")

    if ts & {"Article", "BlogPosting", "NewsArticle"}:
        if not nonempty(n.get("headline")):
            err("Article 缺 headline")
        if not nonempty(n.get("image")):
            err("Article 缺 image")
        authors = n.get("author")
        for a in authors if isinstance(authors, list) else [authors]:
            if not isinstance(a, dict) or not nonempty(a.get("name")):
                err("Article author 缺 name")
        for k in ("datePublished", "dateModified"):
            if not re.match(r"\d{4}-\d{2}-\d{2}T", str(n.get(k, ""))):
                err(f"Article {k} 不是 ISO 8601：{n.get(k)!r}")

    if "Organization" in ts and nonempty(n.get("logo")):
        logo = n["logo"]
        if isinstance(logo, dict) and not nonempty(logo.get("url")):
            err("Organization logo 缺 url")


def walk(o, err):
    if isinstance(o, dict):
        if "@type" in o:
            check_node(o, err)
        for v in o.values():
            walk(v, err)
    elif isinstance(o, list):
        for v in o:
            walk(v, err)


def check_url(url):
    problems = []
    try:
        html = fetch(url)
    except Exception as e:
        return [f"抓不到頁面：{e}"]
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            data = json.loads(block)
        except json.JSONDecodeError as e:
            problems.append(f"JSON-LD 解析失敗（GSC 無法剖析的結構化資料）：{e}")
            continue
        walk(data, problems.append)
    return problems


def sitemap_urls():
    return re.findall(r"<loc>([^<]+)</loc>", fetch(f"{SITE}/sitemap.xml"))


def main():
    urls = sys.argv[1:] or sitemap_urls()
    bad = 0
    for url in urls:
        problems = check_url(url)
        if problems:
            bad += 1
            print(f"✗ {url}")
            for p in sorted(set(problems)):
                print(f"    {p}")
    print(f"結構化資料檢查：{len(urls)} 頁，{bad} 頁有問題")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
