'use client';

import { Fragment, useEffect, useId, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { CREATIVE_PAGES, CreativeStudio } from '@/components/creative-studio';
import { PerformanceStudio } from '@/components/performance-studio';
import { SocialStudio } from '@/components/social-studio';
import { StrategyDocuments } from '@/components/strategy-documents';
import { ServiceDemoNavigation, useServiceDemoPlayback } from '@/components/service-demo';
import { activeServiceIndex, serviceCopyPose, serviceEntryPose, servicePageScale, serviceTitleCharacterCount } from '@/lib/services-journey';
import './services-journey.css';

const SERVICES = [
  {
    id: 'strategy',
    headline: ['브랜드와 마케팅', '방향을 정리하고'],
    title: '전략기획',
    description: '브랜드가 나아갈 방향과 시장에서의 기준점을 정리합니다.',
    items: ['브랜드·시장 분석', '마케팅 전략 수립', '캠페인 기획', '브랜드 메시지 설계'],
  },
  {
    id: 'creative',
    headline: ['좋은 콘텐츠를', '지속해서 만들고'],
    title: '영상·사진 제작 & 콘텐츠 크리에이티브',
    description: '브랜드의 메시지를 영상, 이미지, 디자인과 카피로 일관되게 제작합니다.',
    items: ['브랜드 영상', '광고 영상', '숏폼', '제품 촬영', '카드뉴스'],
  },
  {
    id: 'performance',
    headline: ['광고 성과와', '고객 전환을 높이고'],
    title: '디지털 퍼포먼스',
    description: '콘텐츠와 광고를 실제 유입, 행동과 전환으로 연결합니다.',
    items: ['광고 운영', '매체 전략', '소재 기획', '성과 분석', '캠페인 최적화'],
  },
  {
    id: 'social',
    headline: ['SNS와 온라인 채널을', '체계적으로 운영하고'],
    title: 'SNS·바이럴 마케팅',
    description: '흩어진 온라인 채널을 하나의 브랜드 흐름으로 연결하고 지속적으로 운영합니다.',
    items: ['SNS 운영', '블로그 콘텐츠', '숏폼 콘텐츠', '인플루언서 협업', '바이럴 확산'],
  },
] as const;

const INTRO_TITLE_LINES = ['브랜드의 빈 우주를', '발견하기 위해'] as const;
const INTRO_TITLE_LENGTH = INTRO_TITLE_LINES.join('').length;

export function ServicesSection() {
  const introRef = useRef<HTMLDivElement>(null);
  const introContentRef = useRef<HTMLDivElement>(null);
  const introTitleRef = useRef<HTMLHeadingElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const strategyRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const copyRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [strategyMotionActive, setStrategyMotionActive] = useState(false);
  const [typedTitleLength, setTypedTitleLength] = useState(0);
  const creative = useServiceDemoPlayback(strategyRef, activeIndex === 1, CREATIVE_PAGES, 4000);
  const creativePanelId = useId();
  const creativeTitle = CREATIVE_PAGES.find((page) => page.id === creative.page)!.title;
  const currentDemo = activeIndex === 1 ? creative : null;

  const selectService = (index: number) => {
    copyRefs.current[index]?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };

  useEffect(() => {
    let frame = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => {
      frame = 0;
      const intro = introRef.current;
      const introContent = introContentRef.current;
      const introTitle = introTitleRef.current;
      const visual = visualRef.current;
      const page = pageRef.current;
      if (!intro || !introContent || !introTitle || !visual || !page) return;
      const introBounds = intro.getBoundingClientRect();
      const visualBounds = visual.getBoundingClientRect();
      const introProgress = -introBounds.top / Math.max(introBounds.height, 1);
      const entry = serviceEntryPose(
        introProgress,
        window.innerWidth,
        window.innerHeight,
        visualBounds.left,
        visualBounds.top,
        visualBounds.width,
        visualBounds.height,
      );
      const settled = reducedMotion.matches;
      const nextTypedTitleLength = settled ? INTRO_TITLE_LENGTH : serviceTitleCharacterCount(introProgress, INTRO_TITLE_LENGTH);
      setTypedTitleLength((current) => current === nextTypedTitleLength ? current : nextTypedTitleLength);
      const reducedPeek = settled && introBounds.bottom > 0;
      const pose = reducedPeek
        ? serviceEntryPose(0, window.innerWidth, window.innerHeight, visualBounds.left, visualBounds.top, visualBounds.width, visualBounds.height)
        : entry;
      page.style.transform = `translate3d(${(settled && !reducedPeek ? visualBounds.width / 2 : pose.x) - visualBounds.width / 2}px, ${(settled && !reducedPeek ? visualBounds.height / 2 : pose.y) - visualBounds.height / 2}px, 0) translate(-50%, -50%) scale(${settled && !reducedPeek ? servicePageScale(visualBounds.width, visualBounds.height) : pose.scale})`;
      page.style.opacity = String(entry.opacity);
      page.style.visibility = entry.opacity > .001 ? 'visible' : 'hidden';
      page.style.pointerEvents = introBounds.bottom <= 0 ? 'auto' : 'none';
      introContent.style.opacity = String(settled ? 1 : entry.titleOpacity);
      introContent.style.transform = settled ? 'none' : `translate3d(0, ${entry.titleOffset}px, 0)`;
      introTitle.style.transform = settled ? 'none' : `scale(${entry.titleScale})`;

      const compact = window.innerWidth <= 760;
      const visibleCenter = compact
        ? (visual.clientHeight + window.innerHeight) / 2
        : window.innerHeight / 2;
      const centers = copyRefs.current.map((copy) => {
        if (!copy) return Number.POSITIVE_INFINITY;
        const frame = copy.firstElementChild as HTMLElement | null;
        if (!frame) return Number.POSITIVE_INFINITY;
        const readingTop = compact ? visual.clientHeight : 0;
        const readingHeight = window.innerHeight - readingTop;
        const stickyTop = readingTop + Math.max(12, (readingHeight - frame.offsetHeight) / 2);
        const top = `${stickyTop}px`;
        if (frame.style.top !== top) frame.style.top = top;
        const bounds = frame.getBoundingClientRect();
        const center = bounds.top + bounds.height / 2;
        const pose = serviceCopyPose(center, visibleCenter, Math.max(readingHeight, 1));
        copy.style.setProperty('--service-copy-offset', `${pose.offset}px`);
        copy.style.setProperty('--service-copy-scale', String(pose.scale));
        copy.style.setProperty('--service-copy-opacity', String(pose.opacity));
        return center;
      });
      const nextIndex = activeServiceIndex(centers, visibleCenter);
      setActiveIndex((current) => current === nextIndex ? current : nextIndex);
      const nextStrategyMotionActive = introBounds.bottom < window.innerHeight * .35 && nextIndex === 0;
      setStrategyMotionActive((current) => current === nextStrategyMotionActive ? current : nextStrategyMotionActive);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(requestUpdate);
    if (visualRef.current) observer.observe(visualRef.current);
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    reducedMotion.addEventListener('change', requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      reducedMotion.removeEventListener('change', requestUpdate);
    };
  }, []);

  return (
    <section className="services service-journey" id="services" aria-label="우주기획 서비스">
      <div className="service-journey-intro" ref={introRef}>
        <div className="service-journey-intro-content" ref={introContentRef}>
          <p>우주기획</p>
          <h2 id="services-intro-heading" ref={introTitleRef} aria-label={INTRO_TITLE_LINES.join(' ')}>
            {INTRO_TITLE_LINES.map((line, lineIndex) => {
              const offset = lineIndex === 0 ? 0 : INTRO_TITLE_LINES[0].length;
              return <span className="service-journey-typing-line" aria-hidden="true" key={line}>
                {Array.from(line).map((character, characterIndex) => <Fragment key={`${lineIndex}-${characterIndex}`}>
                  {typedTitleLength === offset + characterIndex && <i className="service-journey-typing-caret" />}
                  <span className={`service-journey-typing-character ${typedTitleLength > offset + characterIndex ? 'is-typed' : ''}`}>{character}</span>
                </Fragment>)}
                {lineIndex === INTRO_TITLE_LINES.length - 1 && typedTitleLength === INTRO_TITLE_LENGTH && <i className="service-journey-typing-caret" />}
              </span>;
            })}
          </h2>
        </div>
      </div>
      <div className="service-journey-layout">
        <div className="service-journey-copy-list">
          {SERVICES.map((service, index) => (
            <article className={`service-journey-copy ${activeIndex === index ? 'is-active' : ''}`} id={`service-${service.id}`}
              ref={(node) => { copyRefs.current[index] = node; }} key={service.id}>
              <div className="service-journey-copy-frame">
                <div className="service-journey-copy-content">
                  <div className="service-journey-step" aria-hidden="true"><span>{String(index + 1).padStart(2, '0')}</span><i /><span>04</span></div>
                  <span className="service-kicker">{service.title}</span>
                  <h3>{service.headline.map((line) => <span key={line}>{line}</span>)}</h3>
                  <p>{service.description}</p>
                  <ul className="service-scroll-tags" aria-label={`${service.title} 세부 서비스`}>
                    {service.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="service-journey-visual" ref={visualRef}>
          <div className="service-journey-page" ref={pageRef}>
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
              {activeIndex === 1 && <div className="service-notion-submenu">
                <span className="service-notion-section-label">콘텐츠 제작</span>
                <ServiceDemoNavigation pages={CREATIVE_PAGES} label="콘텐츠 제작 작업" page={creative.page} onSelect={creative.select} panelId={creativePanelId} target={creative.target} phase={creative.phase} running={creative.running} />
              </div>}
              </aside>
              <div className="service-notion-main">
                <div className="service-notion-toolbar">
                  <span aria-hidden="true">{activeIndex === 0 ? '전략기획' : activeIndex === 1 ? '콘텐츠 제작' : '서비스'}</span>
                  <i aria-hidden="true" />
                <strong aria-hidden="true">{activeIndex === 0 ? '전략 통합 대시보드' : activeIndex === 1 ? creativeTitle : SERVICES[activeIndex].title}</strong>
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
                      {service.id === 'strategy' ? <StrategyDocuments active={strategyMotionActive} />
                          : service.id === 'creative' ? <CreativeStudio page={creative.page} panelId={creativePanelId} active={activeIndex === 1} running={creative.running} reduced={creative.reduced} />
                            : service.id === 'performance' ? activeIndex === 2 && <PerformanceStudio /> : <SocialStudio active={activeIndex === 3} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
