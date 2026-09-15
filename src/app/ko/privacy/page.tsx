import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import Link from 'next/link'
import { SITE_NAME, EDITORIAL_EMAIL } from '@/lib/constants'

// 韓文版隱私權政策。內容照 app/(zh)/privacy/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  'spaceA가 수집하는 데이터, 쿠키 및 분석 도구의 사용 방식, 제휴 링크 추적 방식, 그리고 귀하가 행사할 수 있는 권리.'
const LAST_UPDATED = '2026-08-28'

const BREADCRUMBS = [
  { label: '홈', href: '/ko' },
  { label: '개인정보 처리방침', href: '/ko/privacy' },
]

const TOC_ITEMS = [
  { label: '수집 항목', href: '#collect' },
  { label: '사용 목적', href: '#use' },
  { label: '쿠키 및 분석', href: '#cookie' },
  { label: '제휴 링크 추적', href: '#affiliate' },
  { label: '귀하의 권리', href: '#rights' },
]

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description: DESCRIPTION,
  alternates: staticAlternates('ko', '/privacy'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: SITE_NAME,
    title: '개인정보 처리방침',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function KoPrivacyPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-14 pt-8 pb-20 items-start">
            <article className="max-w-3xl">
              <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px]">
                개인정보 처리방침
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 text-balance">
                귀하의 프라이버시를 중요하게 생각합니다. 이 페이지에서는 spaceA가 수집하는 데이터, 그 사용 목적, 그리고 귀하가 권리를 행사하는 방법을 설명합니다.
              </p>
              <p className="text-xs text-paper-muted mt-3">
                최종 수정일: <time dateTime={LAST_UPDATED}>2026년 8월 28일</time>
              </p>

              <section id="collect" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">어떤 데이터를 수집하나요?</h2>
                <ul className="grid mt-6 divide-y divide-[#eeeae2] text-base leading-loose text-paper-body">
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">귀하가 제공하는 데이터</b>: 문의 양식 또는 이메일을 통해 보내는 이름, 이메일, 전화번호 및 메시지.
                  </li>
                  <li className="py-4">
                    <b className="font-bold text-paper-ink">익명 사용 통계</b>: 방문한 페이지, 유입 경로, 기기 및 브라우저 종류 등으로, 어떤 콘텐츠가 도움이 되는지 파악하기 위해 사용됩니다.
                  </li>
                </ul>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  회원제 시스템이 없으며, 주민등록번호·은행 정보 등 민감한 개인 정보를 요구하지 않습니다.
                </p>
              </section>

              <section id="use" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">데이터는 어떤 용도로 사용되나요?</h2>
                <ul className="grid gap-[18px] mt-6 list-none">
                  {[
                    '정정 요청, 주제 제안, 제휴 문의 등 귀하의 메시지에 회신하기 위함.',
                    '어떤 주제를 더 다루어야 하는지, 어떤 페이지에서 이탈이 발생하는지 등 사이트 콘텐츠와 이용 경험을 개선하기 위함.',
                    '추천이 독자에게 유용한지 파악하기 위해 제휴 링크 클릭 및 결과를 측정하기 위함.',
                  ].map((text) => (
                    <li key={text} className="grid grid-cols-[8px_1fr] gap-4 items-start">
                      <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                      <span className="text-base leading-loose text-paper-body text-balance">{text}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  귀하의 데이터를 마케팅 목록에 추가하지 않으며, 법률상 요구되거나 별도의 동의를 받지 않는 한 제3자에게 판매하거나 제공하지 않습니다.
                </p>
              </section>

              <section id="cookie" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">쿠키와 분석 도구는 어떻게 작동하나요?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  이 사이트는 트래픽 분석을 위해 Google Analytics 등 제3자 도구를 사용합니다. 이들은 쿠키를 통해 익명화된 방문 정보를 기록합니다. 광고 및 제휴 플랫폼은 사용자가 링크를 클릭할 때 전환 출처를 기록하기 위해 쿠키를 설정할 수 있습니다.
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  브라우저 설정에서 쿠키를 비활성화하거나 삭제할 수 있습니다. 쿠키를 비활성화해도 사이트는 정상적으로 읽을 수 있으나 일부 추적 기능은 작동하지 않을 수 있습니다.
                </p>
              </section>

              <section id="affiliate" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">제휴 링크는 무엇을 추적하나요?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  게시글 내 구매 링크는 제휴 링크일 수 있습니다. 클릭 시 리테일러나 제휴 플랫폼은 수수료 계산을 위해 방문 경로가 spaceA에서 왔음을 기록합니다. 가격은 리테일러에 직접 방문했을 때와 동일하며, 저희는 주문 내역이나 결제 정보를 받지 않습니다.
                </p>
                <p className="text-sm leading-relaxed text-paper-secondary mt-3">
                  The full disclosure is in our{' '}
                  <Link href="/ko/standards#disclosure" className="text-brand-600 font-bold">
                    편집 기준
                  </Link>
                  .
                </p>
              </section>

              <section id="rights" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">어떤 권리를 행사할 수 있나요?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 text-balance">
                  저희가 보유한 귀하의 데이터에 대한 열람·정정·삭제를 요청하거나 사용 중단을 요구할 수 있습니다. 이메일로 요청해 주시면 신원 확인 후 조치를 취하겠습니다.
                </p>
                <div className="mt-6 border-l-2 border-brand-200 pl-[22px]">
                  <b className="text-xs font-bold tracking-wider text-brand-600">문의</b>
                  <p className="text-base leading-loose text-paper-body mt-2 text-balance">
                    For privacy matters, email{' '}
                    <a href={`mailto:${EDITORIAL_EMAIL}`} className="text-brand-600 font-bold">
                      {EDITORIAL_EMAIL}
                    </a>{' '}
                    or use the{' '}
                    <Link href="/ko/contact#form" className="text-brand-600 font-bold">
                      문의 양식
                    </Link>
                    .
                  </p>
                </div>
              </section>

              <section className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="text-xs font-bold tracking-wider text-paper-secondary">정책 변경</h2>
                <p className="text-[15px] leading-loose text-paper-secondary mt-2.5 text-balance">
                  이 정책이 변경되는 경우 본 페이지와 최종 수정일을 갱신합니다. 주요 변경 사항은 홈페이지에 공지됩니다.
                </p>
              </section>
            </article>

            <PageToc
              items={TOC_ITEMS}
              title="On this page"
              extraLinks={[
                { label: '이용 약관', href: '/ko/terms' },
                { label: '당사 기준', href: '/ko/standards' },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  )
}
