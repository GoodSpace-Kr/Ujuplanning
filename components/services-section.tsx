'use client';

import { ArrowRight } from 'lucide-react';

const SERVICES = [
  {
    id: 'strategy',
    headline: '브랜드와 마케팅 방향을 정리하고',
    title: '전략기획',
    description: '브랜드가 나아갈 방향과 시장에서의 기준점을 정리합니다.',
    items: ['브랜드·시장 분석', '마케팅 전략 수립', '캠페인 기획', '브랜드 메시지 및 커뮤니케이션 방향 설계'],
    href: '',
  },
  {
    id: 'creative',
    headline: '좋은 콘텐츠를 지속해서 만들고',
    title: '영상·사진 제작 & 콘텐츠 크리에이티브',
    description: '브랜드의 메시지를 영상, 이미지, 디자인과 카피로 일관되게 제작합니다.',
    items: ['브랜드 영상', '광고 영상', '숏폼', '인터뷰', '행사 스케치', '제품 촬영', '콘텐츠 기획', '디자인', '카피라이팅', '카드뉴스', '광고 소재 제작'],
    href: '',
  },
  {
    id: 'performance',
    headline: '광고 성과와 고객 전환을 높이고',
    title: '디지털 퍼포먼스',
    description: '콘텐츠와 광고를 실제 유입, 행동과 전환으로 연결합니다.',
    items: ['네이버·구글·메타 광고 운영', '매체 전략 수립', '광고 소재 기획', '성과 분석', '캠페인 개선 및 최적화'],
    href: '',
  },
  {
    id: 'social',
    headline: 'SNS와 온라인 채널을 체계적으로 운영하고',
    title: 'SNS·바이럴 마케팅',
    description: '흩어진 온라인 채널을 하나의 브랜드 흐름으로 연결하고 지속적으로 운영합니다.',
    items: ['SNS 채널 기획 및 운영', '블로그 콘텐츠', '숏폼 콘텐츠', '인플루언서 협업', '체험단 운영', '바이럴 및 확산 콘텐츠'],
    href: '',
  },
  {
    id: 'experience',
    headline: '오프라인 행사와 브랜드 경험을 만들고',
    title: '브랜드 경험·BTL·행사',
    description: '온라인에서 전달한 브랜드 메시지를 실제 공간과 고객 경험으로 확장합니다.',
    items: ['전시', '팝업스토어', '프로모션', '브랜드 행사', '공간 디자인 및 제작', '현장 운영', '행사 영상 및 사진 기록'],
    href: '',
  },
];

export function ServicesSection() {
  return (
    <div className="services" id="services">
      <header className="services-heading">
        <h2>고객의 브랜드의<br />빈 우주를 발견하기 위해</h2>
      </header>

      {SERVICES.map((service) => (
        <section
          className="service-section"
          id={`service-${service.id}`}
          key={service.id}
          aria-labelledby={`service-heading-${service.id}`}
        >
          <h3 id={`service-heading-${service.id}`} className="service-headline">
            {service.headline}
          </h3>
          <div className="service-card">
            {/* Add the detail URL to href when the page is ready. */}
            <a
              className="service-image-link"
              href={service.href || '#'}
              aria-label={`${service.title} 자세히 보기 (준비 중)`}
              aria-disabled={!service.href}
              onClick={(event) => {
                if (!service.href) event.preventDefault();
              }}
            >
              <span className="service-image-placeholder" aria-hidden="true" />
              <span className="service-card-arrow" aria-hidden="true">
                <ArrowRight strokeWidth={1.6} />
              </span>
            </a>
            <div className="service-card-copy">
              <h4>{service.title}</h4>
              <p>{service.description}</p>
              <ul aria-label={`${service.title} 세부 서비스`}>
                {service.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
