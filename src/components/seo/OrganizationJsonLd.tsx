import { SITE_NAME, SITE_URL, EDITORIAL_EMAIL } from '@/lib/constants'

export default function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-sa-mark.png` },
    description:
      'spaceA 是推薦文內容平台，做法是彙整論壇、社群、電商評論與專業評測中的公開討論，交叉核對後由編輯部撰寫，並標註每則資訊的來源。',
    publishingPrinciples: `${SITE_URL}/standards`,
    correctionsPolicy: `${SITE_URL}/standards#corrections`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: '編輯部',
      email: EDITORIAL_EMAIL,
      url: `${SITE_URL}/contact`,
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
