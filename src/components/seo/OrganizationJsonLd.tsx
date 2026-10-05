import { SITE_NAME, SITE_URL, EDITORIAL_EMAIL, ORG_SAME_AS, COMPANY_NAME } from '@/lib/constants'
import { langPrefix, ui, type Lang } from '@/lib/i18n'

export default function OrganizationJsonLd({ lang }: { lang: Lang }) {
  const t = ui(lang)
  const prefix = langPrefix(lang)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-sa-mark.png` },
    description: t.orgDescription,
    // 站名 spaceA 是品牌，法律實體是積木媒體；兩個寫在一起搜尋引擎才對得起來
    legalName: COMPANY_NAME,
    sameAs: ORG_SAME_AS.length > 0 ? ORG_SAME_AS : undefined,
    // 推薦標準與聯絡頁四語都有，連到讀者正在看的語言
    publishingPrinciples: `${SITE_URL}${prefix}/standards`,
    correctionsPolicy: `${SITE_URL}${prefix}/standards#corrections`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: t.orgContactType,
      email: EDITORIAL_EMAIL,
      url: `${SITE_URL}${prefix}/contact`,
      // 編輯部實際用中文回信，這欄不跟頁面語言換
      availableLanguage: 'zh-TW',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
