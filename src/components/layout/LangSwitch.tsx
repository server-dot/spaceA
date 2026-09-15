'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { switchLangHref, ui, type Lang } from '@/lib/i18n'

/**
 * 中／EN 切換。目標網址由目前路徑推算（見 switchLangHref）：
 * 首頁、分類頁、文章頁對應到另一語言的同一頁，其他只有中文的頁面切到英文時回英文首頁。
 * 對應頁不存在（該篇還沒翻）會落到英文站的 404，那頁會說明英文版尚未提供。
 */
export default function LangSwitch({ lang }: { lang: Lang }) {
  const pathname = usePathname()
  const t = ui(lang)
  const to: Lang = lang === 'en' ? 'zh' : 'en'
  return (
    <Link
      href={switchLangHref(pathname, to)}
      hrefLang={to === 'en' ? 'en' : 'zh-TW'}
      title={t.switchLangTitle}
      className="shrink-0 text-xs font-bold tracking-wider text-paper-secondary border border-paper-border rounded-full px-3 py-1.5 hover:text-brand-600 hover:border-brand-600 transition-colors"
    >
      {t.switchLang}
    </Link>
  )
}
