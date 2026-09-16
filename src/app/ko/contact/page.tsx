import type { Metadata } from 'next'
import { staticAlternates } from '@/lib/i18n'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ContactForm from '@/views/ContactForm'
import { SITE_NAME, COMPANY_ADDRESS, COMPANY_PHONE, EDITORIAL_EMAIL, TECH_EMAIL } from '@/lib/constants'
import Link from 'next/link'
import Reveal from '@/components/ui/Reveal'

// 韓文版聯絡我們。內容照 app/(zh)/contact/page.tsx 翻，兩邊改文案要一起改
const DESCRIPTION =
  '정정, 주제 제안, 광고 및 콘텐츠 라이선스 관련 spaceA 연락 방법. 정정은 우선 처리됩니다.'

const BREADCRUMBS = [
  { label: '홈', href: '/ko' },
  { label: '문의', href: '/ko/contact' },
]

export const metadata: Metadata = {
  title: '문의',
  description: DESCRIPTION,
  alternates: staticAlternates('ko', '/contact'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: SITE_NAME,
    title: '문의',
    description: DESCRIPTION,
    images: [{ url: '/og-default.jpg', width: 1024, height: 318 }],
  },
}

export default function KoContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <div className="bg-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <section className="pt-8 max-w-3xl">
            <Breadcrumbs items={BREADCRUMBS} label="Breadcrumb" />

            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-snug text-paper-ink mt-[18px]">
              문의하기
            </h1>
            <p className="text-[17px] leading-loose text-paper-body mt-5 text-balance">
              오류를 발견하셨거나 주제를 제안하고 싶거나 광고 및 콘텐츠 라이선스에 대해 논의하고 싶으신가요? 여기가 연락처입니다. 정정이 우선 처리됩니다: 확인 후 기사를 수정하고 최종 업데이트 날짜를 갱신합니다.
            </p>
            <p className="text-sm leading-loose text-paper-secondary mt-3.5 text-balance">
              spaceA가 판매하는 것은 광고로 표시된 광고 지면뿐입니다. 후원성 콘텐츠를 받지 않으며 추천 목록과 순위도 판매하지 않습니다. 자세한 내용은{' '}
              <Link href="/ko/standards" className="text-brand-600 font-bold">
                편집 기준
              </Link>
              을 참조하세요.
            </p>
          </section>

          <section
            id="form"
            className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 items-start mt-14 pt-10 border-t border-paper-border"
          >
            <div>
              <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">연락처</h2>
              <ul className="grid mt-6 divide-y divide-[#eeeae2]">
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">편집</b>
                  <a href={`mailto:${EDITORIAL_EMAIL}`} className="text-[15px] font-medium text-brand-600">
                    {EDITORIAL_EMAIL}
                  </a>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">
                    정정, 주제 제안 및 기타 문의
                  </p>
                </li>
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">기술 관련</b>
                  <a href={`mailto:${TECH_EMAIL}`} className="text-[15px] font-medium text-brand-600">
                    {TECH_EMAIL}
                  </a>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">
                    사이트 문제, 로드되지 않거나 표시 오류가 발생하는 페이지
                  </p>
                </li>
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">전화 및 근무 시간</b>
                  <a href="tel:+886227457601" className="text-[15px] font-medium text-brand-600">
                    +886 {COMPANY_PHONE.replace(/^0/, '')}
                  </a>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">월–금, 10:00–19:00 (UTC+8)</p>
                </li>
                <li className="py-[18px]">
                  <b className="block text-[15px] font-bold text-paper-ink">사무실</b>
                  <span className="text-[15px] text-paper-body">
                    11F, No. 49, Dongxing Rd., Xinyi District, Taipei, Taiwan ({COMPANY_ADDRESS})
                  </span>
                  <p className="text-[13px] leading-relaxed text-paper-secondary mt-1">
                    직접 방문을 원하시면 먼저 이메일로 예약해 주십시오.
                  </p>
                </li>
              </ul>

              <div className="mt-5 border border-paper-border rounded-2xl overflow-hidden">
                <iframe
                  title="Stack Media Marketing office map"
                  src="https://maps.google.com/maps?q=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%BF%A1%E7%BE%A9%E5%8D%80%E6%9D%B1%E8%88%88%E8%B7%AF49%E8%99%9F11%E6%A8%93&t=m&z=16&hl=en&output=embed&iwloc=near"
                  width="100%"
                  height="300"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block border-0"
                />
              </div>
            </div>

            <ContactForm lang="ko" />
          </section>

          <Reveal as="section" className="mt-14 pt-10 border-t border-paper-border">
            <h2 className="font-serif text-2xl font-bold leading-snug text-paper-ink">메시지 처리 방법</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 mt-7">
              <div className="border-t-2 border-brand-600 pt-3.5">
                <b className="text-base font-bold text-paper-ink">정정 우선 처리</b>
                <p className="text-[15px] leading-loose text-paper-secondary mt-1.5">
                  출처를 확인하고 기사를 수정하며 최종 업데이트 날짜를 갱신합니다; 원래 결론이 변경될 경우 정정 사항을 명시합니다.
                </p>
              </div>
              <div className="border-t-2 border-brand-600 pt-3.5">
                <b className="text-base font-bold text-paper-ink">항상 회신합니다</b>
                <p className="text-[15px] leading-loose text-paper-secondary mt-1.5">
                  제휴 문의와 주제 제안에는 모두 회신합니다; 이미 예정된 주제인 경우 일정(타임라인)을 안내해 드립니다.
                </p>
              </div>
              <div className="border-t-2 border-brand-600 pt-3.5">
                <b className="text-base font-bold text-paper-ink">추천 목록, 순위 또는 결론 변경을 대가로 자리를 구매하겠다는 요청은 정중히 거절합니다.</b>
                <p className="text-[15px] leading-loose text-paper-secondary mt-1.5">
                  추천 목록이나 노출 순서, 결론 변경을 구매하려는 문의는 정중히 거절합니다.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  )
}
