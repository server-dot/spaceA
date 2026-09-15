import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { LANG_TAG, ui, type Lang } from '@/lib/i18n'

export default function WebsiteJsonLd({ lang }: { lang: Lang }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: ui(lang).siteDescription,
    url: SITE_URL,
    inLanguage: LANG_TAG[lang],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?s={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
