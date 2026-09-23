import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // 分類暫用圖用 SVG（public/categories/*.svg），是自己畫的靜態檔，不是遠端內容，可放心開放
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      // 舊 slug 還在 Google 索引裡（2026-09 時 12 天 88 次曝光、平均 11 名），
      // 文章早就改名成 australia-day-tours-guide，不接起來這些曝光全部掉進 404
      {
        source: '/travel/best-australia-tour-agencies',
        destination: '/travel/australia-day-tours-guide',
        permanent: true,
      },
      ...['en', 'ja', 'ko'].map((lang) => ({
        source: `/${lang}/travel/best-australia-tour-agencies`,
        destination: `/${lang}/travel/australia-day-tours-guide`,
        permanent: true,
      })),
    ]
  },
}

export default nextConfig
