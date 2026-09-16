import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import PageToc from '@/components/layout/PageToc'
import { SITE_NAME, EDITORIAL_EMAIL } from '@/lib/constants'
import Link from 'next/link'
import Reveal from '@/components/ui/Reveal'

// 韓文版關於我們。內容照 app/(zh)/about/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  'spaceA는 대만의 번체 중국어 추천 사이트로, 현재 영어판도 제공하고 있습니다. 왜 만들었는지, 편집팀 구성, 자주 묻는 질문 및 사이트 진행 상황을 안내합니다.'
const LAST_UPDATED = '2026-09-04'

const BREADCRUMBS = [
  { label: '홈', href: '/ko' },
  { label: '소개', href: '/ko/about' },
]

const TOC_ITEMS = [
  { label: '사이트 존재 이유', href: '#why' },
  { label: '편집팀', href: '#team' },
  { label: '자주 묻는 질문', href: '#faq' },
  { label: '사이트 진행 상황', href: '#timeline' },
]

const TIMELINE = [
  {
    date: '2026년 5월',
    title: '구축 시작',
    body: '페이지 채우기가 아니라 독자들이 실제로 검색하고 비교하는 주제에서 출발해 사이트 구조와 콘텐츠 방향을 기획했습니다.',
  },
  {
    date: '2026년 8월',
    title: '첫 기사 게시',
    body: '첫 추천 기사가 공개되었으며, 수집-검증-검토의 전체 프로세스를 실제로 운영하면서 필요한 부분을 조정했습니다.',
  },
  {
    date: '2026년 9월',
    title: '공개 출범 및 영어판 제공',
    body: '우선 콘텐츠 기반을 다진 뒤 카테고리를 확장합니다. 단순히 숫자를 채우기 위해 대량의 기사를 무차별로 추가하지 않습니다.',
  },
]

const FAQ_ITEMS = [
  {
    question: '기사 업데이트 주기는 어떻게 되나요?',
    answer:
      '사양, 가격, 요금제는 시간이 지나며 변동하므로 공식 페이지와 판매처 정보를 분기별로 재확인합니다. 독자가 오류를 신고하면 즉시 검증하고 업데이트합니다. 모든 기사 상단에 최종 수정일을 표시합니다.',
  },
  {
    question: '어떤 주제를 다룰지 어떻게 결정하나요?',
    answer:
      '선택지가 많지만 공개 정보가 혼란스러운 주제를 우선합니다. 독자들이 무엇을 먼저 정리해주길 필요로 하는지에 따라 주제를 선정하며, 브랜드의 홍보 요구가 아니라 실제 독자의 검색·비교 행태를 기준으로 결정합니다.',
  },
  {
    question: '브랜드가 대가를 지불해 콘텐츠를 변경할 수 있나요?',
    answer:
      '아니요. spaceA가 판매하는 것은 광고로 표시된 광고 지면뿐입니다. 후원성 콘텐츠를 받지 않으며 추천 목록, 순위, 결론에 대한 유료 배치도 판매하지 않습니다. 자세한 규정은 편집 기준 페이지를 참조하세요.',
  },
  {
    question: '오류나 깨진 링크를 발견하면 어떻게 하나요?',
    answer: `Email ${EDITORIAL_EMAIL} or use the contact page. We verify, correct the article and update its last-updated date.`,
  },
]

export const metadata: Metadata = {
  title: '소개',
  description: DESCRIPTION,
  alternates: staticAlternates('ko', '/about'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: SITE_NAME,
    title: '소개',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function KoAboutPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <FaqJsonLd items={FAQ_ITEMS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-14 pt-8 pb-20 items-start">
            <article>
              <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px] text-balance">
                spaceA 소개
              </h1>
              <p className="text-[17px] leading-loose text-paper-body mt-5 max-w-2xl text-balance">
                spaceA는 대만에서 운영되는 추천 사이트입니다. 다양한 분야에서 엄선한 추천 기사를 작성하여 소비자가 결정하기 전에 정직하고 유용한 참고 정보를 제공합니다.
              </p>
              <p className="text-xs text-paper-muted mt-3">
                최종 수정일: <time dateTime={LAST_UPDATED}>2026년 9월 4일</time>
              </p>

              <Reveal as="section" id="why" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">왜 이 사이트를 만들었나요?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  온라인에서 정보를 찾을 때의 문제는 정답이 전혀 없는 것이 아니라, 너무 많은 관점에서 쏟아지는 과다한 답변입니다. 후원 게시물이 모든 브랜드를 1위로 치켜세우고, 포럼의 댓글은 검증하기 어려우며, 비교 목록은 선택을 돕기보다 길이를 채우기 위해 과장되는 경우가 많습니다. spaceA는 이를 바로잡기 위해 존재합니다. 다양한 플랫폼에 흩어진 공개 토론, 사양, 가격 정보를 모아 교차 검증하고, 실제로 읽기 쉬운 방식으로 판단 기준을 정리합니다.
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  흔한 예로, 어떤 제품군을 검색해도 열 건 중 아홉 건은 브랜드 이름만 바뀐 거의 동일한 “장점”을 나열합니다. 이는 각 사이트가 자체 확인을 하지 않고 같은 보도자료를 공유했을 가능성이 큽니다. 많은 정보처럼 보이지만 선택에는 도움이 되지 않으며, 오히려 모든 옵션을 비슷하게 보이게 만들 수 있습니다.
                </p>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  We are not telling you what you should pick. We lay out the criteria and let you decide whether to follow them.
                  When we cannot reach a confident conclusion, we say the data is insufficient instead of forcing a tidy answer. The
                  full process is on the{' '}
                  <Link href="/ko/standards" className="font-bold text-brand-600">
                    편집 기준
                  </Link>{' '}
                  page.
                </p>
              </Reveal>

              <Reveal as="section" id="team" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">누가 이 글들을 작성하나요?</h2>
                <p className="text-base leading-loose text-paper-body mt-4 max-w-2xl text-balance">
                  기사들은 spaceA 편집팀이 작성하며, 공개 토론을 수집·정리하는 역할, 사양과 가격을 검증하는 역할, 검토 및 게재하는 역할의 세 가지로 나뉩니다. 모든 기사에는 책임 편집자가 표시됩니다.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 mt-7 max-w-2xl">
                  {[
                    { title: '조사', body: '공개 토론과 리뷰를 수집해 비교 목록으로 정리합니다.' },
                    { title: '검증', body: '공식 페이지 및 판매처 정보를 기준으로 사양과 가격을 확인합니다.' },
                    { title: '검토', body: '모든 결론에 근거가 있는지, 모든 출처가 인용되었는지 확인합니다.' },
                  ].map((role) => (
                    <div key={role.title} className="border-t-2 border-brand-600 pt-3.5">
                      <b className="text-base font-bold text-paper-ink">{role.title}</b>
                      <p className="text-sm leading-loose text-paper-secondary mt-1.5">{role.body}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal as="section" id="faq" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">자주 묻는 질문</h2>
                <div className="grid mt-6 divide-y divide-[#eeeae2] max-w-2xl">
                  {FAQ_ITEMS.map((item) => (
                    <div key={item.question} className="py-5">
                      <b className="block text-base font-bold text-paper-ink">{item.question}</b>
                      <p className="text-base leading-loose text-paper-body mt-2 text-balance">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal as="section" id="timeline" className="mt-14 pt-10 border-t border-paper-border">
                <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">사이트 진행 상황</h2>
                <ol className="grid gap-8 mt-6 pl-[34px] border-l-2 border-brand-200 list-none max-w-2xl">
                  {TIMELINE.map((item, i) => (
                    <Reveal as="li" key={item.date} delay={i * 120} className="relative">
                      <span className="absolute -left-[43px] top-0.5 w-[18px] h-[18px] rounded-full bg-brand-600" />
                      <b className="block text-xs font-bold tracking-wider text-brand-600">{item.date}</b>
                      <b className="block text-lg font-bold text-paper-ink mt-1.5">{item.title}</b>
                      <p className="text-base leading-loose text-paper-body mt-2 text-balance">{item.body}</p>
                    </Reveal>
                  ))}
                </ol>
              </Reveal>
            </article>

            <PageToc items={TOC_ITEMS} title="On this page" />
          </div>
        </div>
      </div>
    </>
  )
}
