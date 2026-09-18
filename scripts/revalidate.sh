#!/usr/bin/env bash
# 叫前台重抓一篇文章（文章頁＋分類頁＋首頁）。改完 WP 內文或封面就跑一次，不用等 ISR 一小時。
# 用法：scripts/revalidate.sh <slug> <category-slug>   例：scripts/revalidate.sh best-frozen-meal-packs food
# 英日韓版傳 WP 的 slug（帶 -en/-ja/-ko），route 會自己換算成前台網址。
set -euo pipefail
[ $# -eq 2 ] || { echo "usage: $0 <slug> <category>" >&2; exit 1; }
cd "$(dirname "$0")/.."
set -a; . ./.env.local; set +a
: "${REVALIDATE_SECRET:?.env.local 缺 REVALIDATE_SECRET}"
curl -s -w " HTTP %{http_code}\n" -X POST "${NEXT_PUBLIC_SITE_URL%/}/api/revalidate" \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" -H "Content-Type: application/json" \
  -d "{\"slug\":\"$1\",\"category\":\"$2\"}"
