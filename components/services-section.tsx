'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { CREATIVE_PAGES, CreativeStudio } from '@/components/creative-studio';
import { PerformanceStudio } from '@/components/performance-studio';
import { SocialStudio } from '@/components/social-studio';
import { STRATEGY_PAGES, StrategyDocuments } from '@/components/strategy-documents';
import { ServiceDemoNavigation, useServiceDemoPlayback } from '@/components/service-demo';

const SERVICES = [
  {
    id: 'strategy',
    headline: '브랜드와 마케팅 방향을 정리하고',
    title: '전략기획',
    description: '브랜드가 나아갈 방향과 시장에서의 기준점을 정리합니다.',
    items: ['브랜드·시장 분석', '마케팅 전략 수립', '캠페인 기획', '브랜드 메시지 설계'],
  },
  {
    id: 'creative',
    headline: '좋은 콘텐츠를 지속해서 만들고',
    title: '영상·사진 제작 & 콘텐츠 크리에이티브',
    description: '브랜드의 메시지를 영상, 이미지, 디자인과 카피로 일관되게 제작합니다.',
    items: ['브랜드 영상', '광고 영상', '숏폼', '제품 촬영', '카드뉴스'],
  },
  {
    id: 'performance',
    headline: '광고 성과와 고객 전환을 높이고',
    title: '디지털 퍼포먼스',
    description: '콘텐츠와 광고를 실제 유입, 행동과 전환으로 연결합니다.',
    items: ['광고 운영', '매체 전략', '소재 기획', '성과 분석', '캠페인 최적화'],
  },
  {
    id: 'social',
    headline: 'SNS와 온라인 채널을 체계적으로 운영하고',
    title: 'SNS·바이럴 마케팅',
    description: '흩어진 온라인 채널을 하나의 브랜드 흐름으로 연결하고 지속적으로 운영합니다.',
    items: ['SNS 운영', '블로그 콘텐츠', '숏폼 콘텐츠', '인플루언서 협업', '바이럴 확산'],
  },
] as const;

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const strategyRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const strategy = useServiceDemoPlayback(strategyRef, activeIndex === 0, STRATEGY_PAGES);
  const creative = useServiceDemoPlayback(strategyRef, activeIndex === 1, CREATIVE_PAGES, 4000);
  const strategyPage = strategy.page;
  const strategyPanelId = useId();
  const creativePanelId = useId();
  const strategyTitle = STRATEGY_PAGES.find((page) => page.id === strategyPage)!.title;
  const creativeTitle = CREATIVE_PAGES.find((page) => page.id === creative.page)!.title;
  const currentDemo = activeIndex === 0 ? strategy : activeIndex === 1 ? creative : null;

  const selectService = (index: number) => {
    if (window.matchMedia('(max-width: 1020px)').matches) {
      setActiveIndex(index);
      return;
    }
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;
    const distance = Math.max(section.offsetHeight - sticky.offsetHeight, 0);
    window.scrollTo({
      top: window.scrollY + section.getBoundingClientRect().top + distance * index / (SERVICES.length - 1),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      const sticky = stickyRef.current;
      if (!section || !sticky) return;
      // On stacked layouts the preview is selected directly, not by scroll distance.
      if (window.matchMedia('(max-width: 1020px)').matches) return;

      const stickyHeight = sticky.offsetHeight || window.innerHeight;
      const scrollable = Math.max(section.offsetHeight - stickyHeight, 1);
      const nextProgress = Math.min(Math.max(-section.getBoundingClientRect().top / scrollable, 0), 1);
      const nextIndex = Math.min(SERVICES.length - 1, Math.round(nextProgress * (SERVICES.length - 1)));

      setActiveIndex(nextIndex);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <section className="services service-scroll-section" id="services" ref={sectionRef}>
      <div className="service-scroll-sticky" ref={stickyRef}>
        <div className="service-scroll-layout">
          <div className="service-scroll-copy" aria-label="서비스 목록">
            <div className="service-scroll-index" aria-hidden="true">
              {SERVICES.map((service, index) => (
                <span className={index === activeIndex ? 'is-active' : ''} key={service.id} />
              ))}
            </div>

            <div className="service-scroll-copy-window">
              <div
                className="service-scroll-copy-track"
                style={{ transform: `translate3d(0, ${-activeIndex * 100}%, 0)` }}
              >
                {SERVICES.map((service, index) => (
                  <article
                    className={`service-scroll-copy-panel ${index === activeIndex ? 'is-active' : ''}`}
                    id={`service-${service.id}`}
                    key={service.id}
                  >
                    <span className="service-kicker">{service.title}</span>
                    <h3>{service.headline}</h3>
                    <p>{service.description}</p>
                    <ul className="service-scroll-tags" aria-label={`${service.title} 세부 서비스`}>
                      {service.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div ref={strategyRef} className="service-notion-shell" data-service={SERVICES[activeIndex].id} aria-label={`${SERVICES[activeIndex].title} 화면 예시`}>
            <div className="service-mobile-picker">
              <span>Services</span>
              <select aria-label="서비스 화면 선택" value={activeIndex} onChange={(event) => selectService(Number(event.target.value))}>
                {SERVICES.map((service, index) => <option key={service.id} value={index}>{service.title}</option>)}
              </select>
            </div>
            <aside className="service-notion-sidebar">
              <div className="service-notion-logo"><i /> uju planning</div>
              <div className="service-notion-service-list">
                <span className="service-notion-section-label">Services</span>
                <nav className="service-notion-primary" aria-label="Services">
                  {SERVICES.map((service, index) => (
                    <button type="button" aria-current={index === activeIndex ? 'page' : undefined} onClick={() => selectService(index)} key={service.id}>
                      {service.title}
                    </button>
                  ))}
                </nav>
              </div>
              {currentDemo && <div className="service-notion-submenu">
                <span className="service-notion-section-label">{activeIndex === 0 ? '전략기획' : '콘텐츠 제작'}</span>
                {activeIndex === 0 ? (
                  <ServiceDemoNavigation pages={STRATEGY_PAGES} label="전략기획 문서" page={strategyPage} onSelect={strategy.select} panelId={strategyPanelId} target={strategy.target} phase={strategy.phase} running={strategy.running} />
                ) : (
                  <ServiceDemoNavigation pages={CREATIVE_PAGES} label="콘텐츠 제작 작업" page={creative.page} onSelect={creative.select} panelId={creativePanelId} target={creative.target} phase={creative.phase} running={creative.running} />
                )}
              </div>}
            </aside>
            <div className="service-notion-main">
              <div className="service-notion-toolbar">
                <span aria-hidden="true">{activeIndex === 0 ? '전략기획' : activeIndex === 1 ? '콘텐츠 제작' : '서비스'}</span>
                <i aria-hidden="true" />
                <strong aria-hidden="true">{activeIndex === 0 ? strategyTitle : activeIndex === 1 ? creativeTitle : SERVICES[activeIndex].title}</strong>
                {currentDemo && !currentDemo.reduced && <button className="strategy-playback-toggle" type="button" onClick={currentDemo.toggle} aria-label={currentDemo.paused ? '자동 재생 시작' : '자동 재생 일시정지'} title={currentDemo.paused ? '자동 재생 시작' : '자동 재생 일시정지'}>
                  {currentDemo.paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
                </button>}
              </div>
              <div className="service-notion-canvas-stage">
                {SERVICES.map((service, index) => (
                  <div
                    className={`service-canvas-panel ${index === activeIndex ? 'is-active' : ''}`}
                    aria-hidden={index !== activeIndex}
                    inert={index !== activeIndex}
                    key={service.id}
                  >
                    <div className={`service-visual service-visual-${service.id}`}>
                      {service.id === 'strategy' ? <StrategyDocuments page={strategyPage} panelId={strategyPanelId} running={strategy.running} />
                        : service.id === 'creative' ? <CreativeStudio page={creative.page} panelId={creativePanelId} running={creative.running} reduced={creative.reduced} />
                        : service.id === 'performance' ? activeIndex === 2 && <PerformanceStudio /> : <SocialStudio active={activeIndex === 3} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
