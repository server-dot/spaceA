import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'

// 韓文版使用條款。內容照 app/(zh)/terms/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  'spaceA 콘텐츠의 사용 방식, 재게시 및 인용 규정, 면책사항, 제3자 링크, 그리고 약관 변경에 관한 사항.'
const LAST_UPDATED = '2026-08-28'

const BREADCRUMBS = [
  { label: '홈', href: '/ko' },
  { label: '이용 약관', href: '/ko/terms' },
]

const TOC_ITEMS = [
  { label: '콘텐츠 사용 및 재게시', href: '#content' },
  { label: '면책사항', href: '#disclaimer' },
  { label: '제3자 링크 및 광고', href: '#thirdparty' },
  { label: '금지 행위', href: '#conduct' },
]

export const metadata: Metadata = {
  title: '이용 약관',
  description: DESCRIPTION,
  alternates: staticAlternates('ko', '/terms'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: SITE_NAME,
    title: '이용 약관',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function KoTermsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-14 pt-8 pb-20 items-start">
            <article className="max-w-3xl">
              <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px]">
                이용 약관
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 text-balance">
                spaceA를 이용하시기 전에 다음 내용을 읽어 주십시오. 사이트를 계속 이용하면 본 약관에 동의하는 것으로 간주됩니다.
              </p>
              <p className="text-xs text-paper-muted mt-3">
                최종 업데이트: <time dateTime={LAST_UPDATED}>2026년 8월 28일</time>
              </p>

              <section id="content" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">콘텐츠는 어떻게 사용할 수 있나요?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  이 사이트의 기사, 차트 및 편집물은 spaceA와 라이선서의 저작권입니다. 합리적인 범위 내에서 읽고, 링크를 공유하며 인용하는 것은 허용됩니다.
                </p>
                <ul className="grid mt-6 divide-y divide-[#eeeae2] text-base leading-loose text-paper-body">
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">허용됨</b>: 출처 표기와 원문 링크를 포함한 단락 또는 그림 단일 인용.
                  </li>
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">라이선스 필요</b>: 전체 기사 재게시, 번역, 재작성, 상업적 출판 또는 상업용 모델 학습에 사용.
                  </li>
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">금지됨</b>: 출처 표기 제거 또는 결론을 변경한 채로 여전히 spaceA&apos;s 콘텐츠로 제시하는 행위.
                  </li>
                </ul>
                <p className="text-sm leading-relaxed text-paper-secondary mt-3">
                  For licensing, use the{' '}
                  <Link href="/ko/contact#form" className="text-brand-600 font-bold">
                    문의 양식
                  </Link>{' '}
                  and select &quot;Content licensing&quot;.
                </p>
              </section>

              <section id="disclaimer" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  면책사항의 범위는 무엇입니까?
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  당사의 콘텐츠는 공개 정보와 사용자의 의견을 편집자가 검증하여 편집한 것으로 참고용입니다. 개인 맞춤형 조언이 아닙니다. 사양, 가격 및 재고는 언제든 변경될 수 있으니 구매 전 판매처 및 공식 정보를 확인하시기 바랍니다.
                </p>
                <ul className="grid gap-[18px] mt-6 list-none">
                  <li className="grid grid-cols-[8px_1fr] gap-4 items-start">
                    <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                    <span className="text-base leading-loose text-paper-body text-balance">
                      의학, 건강, 법률 및 재무 관련 콘텐츠는 전문가의 진단이나 조언을 대체할 수 없습니다.
                    </span>
                  </li>
                  <li className="grid grid-cols-[8px_1fr] gap-4 items-start">
                    <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                    <span className="text-base leading-loose text-paper-body text-balance">
                      본 사이트의 정보를 바탕으로 한 구매 또는 기타 결정은 전적으로 사용자 본인의 책임입니다.
                    </span>
                  </li>
                  <li className="grid grid-cols-[8px_1fr] gap-4 items-start">
                    <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                    <span className="text-base leading-loose text-paper-body text-balance">
                      If you find an error, please follow the{' '}
                      <Link href="/ko/standards#corrections" className="text-brand-600 font-bold">
                        정정 절차
                      </Link>{' '}
                      and we will verify and act on it.
                    </span>
                  </li>
                </ul>
              </section>

              <section id="thirdparty" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  제3자 링크 및 광고는 어떻게 처리되나요?
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  본 사이트는 마켓플레이스, 브랜드 웹사이트 및 기타 사이트로 연결되는 링크를 제공하며, 모두 직접 링크이고 제휴 링크가 아닙니다. 해당 사이트들의 콘텐츠, 약관 및 개인정보처리방침은 해당 사이트의 책임이며, spaceA는 이를 통제하거나 책임을 지지 않습니다.
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  광고는 편집 기사와 분리해 게재합니다. 판매하는 것은 광고로 표시된 광고 지면뿐이며, 후원성 콘텐츠를 받지 않고 추천 목록과 순위도 판매하지 않습니다. 자세한 내용은{' '}
                  <Link href="/ko/standards#disclosure" className="text-brand-600 font-bold">
                    광고·협업 고지
                  </Link>
                  을 참조하세요.
                </p>
              </section>

              <section id="conduct" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">이 사이트에서 피해야 할 행위는 무엇입니까?</h2>
                <ul className="grid mt-6 divide-y divide-[#eeeae2] text-base leading-loose text-paper-body">
                  <li className="py-4">자동화 도구로 대량으로 콘텐츠를 수집하거나 사이트의 정상적인 운영을 방해하는 행위.</li>
                  <li className="py-4">타인을 사칭하여 허위 정정 요청이나 제휴 문의를 보내는 행위.</li>
                  <li className="py-4">소비자를 오도하는 마케팅에 본 사이트의 콘텐츠를 사용하는 행위.</li>
                </ul>
              </section>

              <section className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="text-xs font-bold tracking-wider text-paper-secondary">변경 사항 및 준거법</h2>
                <p className="text-[15px] leading-loose text-paper-secondary mt-2.5 text-balance">
                  약관이 변경되는 경우 본 페이지와 최종 업데이트 날짜를 갱신합니다. 본 약관은 중화민국(대만) 법률에 따라 규율됩니다. 두 언어 버전이 상이할 경우 번체 중국어 버전이 우선합니다.
                </p>
              </section>
            </article>

            <PageToc
              items={TOC_ITEMS}
              title="On this page"
              extraLinks={[
                { label: '개인정보 처리방침', href: '/ko/privacy' },
                { label: '당사의 기준', href: '/ko/standards' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  )
}
