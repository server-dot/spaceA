import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'

// 韓文版推薦標準。內容照 app/(zh)/standards/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  'spaceA가 공개 논의와 리뷰를 수집하는 방식, 교차 검증 방법, 광고·협업 공개 방식 및 오류 정정 요청 방법에 대한 설명입니다.'
const LAST_UPDATED = '2026-08-28'

const BREADCRUMBS = [
  { label: '홈', href: '/ko' },
  { label: '편집 기준', href: '/ko/standards' },
]

const TOC_ITEMS = [
  { label: '데이터 수집 방법', href: '#how' },
  { label: '하지 않는 일', href: '#limits' },
  { label: '광고 및 협업 고지', href: '#disclosure' },
  { label: '정정 안내', href: '#corrections' },
]

export const metadata: Metadata = {
  title: '편집 기준',
  description: DESCRIPTION,
  alternates: staticAlternates('ko', '/standards'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: SITE_NAME,
    title: '편집 기준',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function KoStandardsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-14 pt-8 pb-20 items-start">
            <article>
              <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px] text-balance">
                편집 기준
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 max-w-2xl text-balance">
                spaceA는 대만 기반의 추천 사이트입니다. 우리가 모든 것을 직접 시험해봤다고 주장하지 않습니다. 대신 공개된 온라인 논의를 수집하고 교차 검증한 뒤, 편집팀이 근거와 업데이트 날짜를 명시해 실제로 활용할 수 있는 권장안으로 정리합니다.
              </p>
              <p className="text-xs text-paper-muted mt-3">
                최종 갱신: <time dateTime={LAST_UPDATED}>2026년 8월 28일</time>
              </p>

              <section id="how" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  데이터를 어떻게 수집하고 추천 기사를 작성하나요?
                </h2>
                <ol className="grid gap-8 mt-8 pl-[34px] border-l-2 border-brand-200 list-none max-w-2xl">
                  {[
                    {
                      n: '01',
                      title: '수집',
                      body: '포럼, 소셜 미디어, 마켓플레이스에서 공개된 리뷰를 수집하고, 각 모델이 언급되는 빈도와 평점을 기록하며 반복해서 언급되는 장단점을 추려냅니다.',
                    },
                    {
                      n: '02',
                      title: '교차 검증',
                      body: '사양, 가격 및 서비스 약관은 항상 공식 페이지와 소매업체를 대조해 확인하며 단일 출처에 의존하지 않습니다. 출처들이 서로 모순될 경우에는 더 달콤한 쪽을 택하지 않고 기사에서 그 사실을 명시합니다.',
                    },
                    {
                      n: '03',
                      title: '출처 표기 및 갱신',
                      body: '각 기사는 끝부분에 출처 유형을 명시하고 발행일 및 최종 갱신일을 표기합니다. 가격과 소매업체 정보는 분기별로 재확인합니다.',
                    },
                  ].map((step) => (
                    <li key={step.n} className="relative">
                      <span className="absolute -left-[43px] top-0.5 w-[18px] h-[18px] rounded-full bg-brand-600" />
                      <b className="block text-xs font-bold tracking-wider text-brand-600">STEP {step.n}</b>
                      <b className="block text-lg font-bold text-paper-ink mt-1.5">{step.title}</b>
                      <p className="text-base leading-loose text-paper-body mt-2 text-balance">{step.body}</p>
                    </li>
                  ))}
                </ol>
              </section>

              <section id="limits" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">하지 않는 일</h2>
                <ul className="grid mt-6 divide-y divide-[#eeeae2] text-base leading-loose text-paper-body max-w-2xl">
                  <li className="py-4 text-balance">
                    스폰서 콘텐츠와 순위 판매를 하지 않습니다. 판매하는 것은 광고로 표시된 광고 지면뿐이며, 브랜드는 추천, 순위 또는 결론을 대가로 구입할 수 없고 초안을 검토할 권한도 없습니다.
                  </li>
                  <li className="py-4 text-balance">
                    직접 진행하지 않은 테스트를 마치 한 것처럼 주장하지 않습니다. 각 기사는 결론이 테스트, 사용자 피드백, 또는 브랜드 자료 중 어디에 근거하는지 명시합니다.
                  </li>
                  <li className="py-4 text-balance">
                    근거 없는 수치 사용 금지: 검증 가능한 수치가 없을 경우에는 숫자 없이 서술하거나 데이터가 불충분하다고 밝힙니다.
                  </li>
                  <li className="py-4 text-balance">
                    순위를 맞추기 위해 목록을 늘리지 않습니다. 추천할 가치가 있는 옵션이 세 개뿐이면 세 개만 제시합니다.
                  </li>
                  <li className="py-4 text-balance">
                    개인 맞춤형 의료·법률·투자 조언을 제공하지 않습니다. 건강 관련 내용은 담당 의료진의 조언을 따르십시오.
                  </li>
                </ul>
              </section>

              <section id="disclosure" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">
                  광고와 협업 관계는 어떻게 공개하나요?
                </h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  spaceA의 수익은 광고 지면에서 나옵니다. 판매하는 것은 광고로 표시된 지면이며, 기사 자체는 판매하지 않습니다:
                </p>
                <ul className="grid gap-[18px] mt-6 list-none max-w-2xl">
                  {[
                    '기사 속 링크는 브랜드 공식 사이트나 판매 페이지로 바로 연결됩니다. 제휴 링크가 아니며, 클릭이나 구매로 spaceA가 수익을 얻지 않습니다.',
                    '광고 지면은 게재 신청을 받습니다. 광고는 광고로 표시하고 기사와 분리해 게재하며, 리뷰로 위장된 광고는 없습니다. 광고를 집행해도 추천 목록에 들어가거나 순위가 올라가지 않습니다.',
                    '스폰서 콘텐츠와 순위 판매를 하지 않습니다. 추천 목록, 순위, 결론은 판매 대상이 아니며, 브랜드는 초안을 검토하거나 수정할 수 없습니다. 브랜드로부터 제품을 대여받아 테스트한 경우에는 기사 상단에 그 사실을 명시합니다.',
                  ].map((text) => (
                    <li key={text} className="grid grid-cols-[8px_1fr] gap-4 items-start">
                      <span className="w-2 h-2 rounded-full bg-brand-400 mt-3" />
                      <span className="text-base leading-loose text-paper-body text-balance">{text}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section id="corrections" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">오류를 찾으셨나요?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  알려주시면 출처를 확인하고 오류일 경우 기사를 수정하며 최종 갱신일을 업데이트합니다. 변경이 원래 추천에 영향을 미칠 경우에는 조용히 수정하지 않고 문서 하단에 정정 내용을 명시합니다.
                </p>
                <div className="flex gap-3 flex-wrap mt-6">
                  <Link
                    href="/ko/contact#form"
                    className="inline-flex items-center bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors"
                  >
                    오류 신고
                  </Link>
                  <Link
                    href="/ko/contact#form"
                    className="inline-flex items-center bg-paper-card hover:border-brand-600 hover:text-brand-600 text-paper-ink font-bold text-sm px-6 py-3 border border-paper-border rounded-lg transition-colors"
                  >
                    제휴 및 광고
                  </Link>
                </div>
              </section>
            </article>

            <PageToc items={TOC_ITEMS} title="On this page" />
          </div>
        </div>
      </div>
    </>
  )
}
