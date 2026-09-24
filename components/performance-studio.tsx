'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight, RotateCcw } from 'lucide-react';
import { CAMPAIGN_IMAGES } from './campaign-assets';
import { getPerformanceMotion, PERFORMANCE_DURATION } from './performance-demo';
import './performance-studio.css';

const OPERATIONS = [
  { title: '콘텐츠 제작', detail: '제품 영상 · 사진 · 카드뉴스', at: 200 },
  { title: '광고 운영', detail: '타깃별 집행 · 소재 A/B 테스트', at: 650 },
  { title: '성과 최적화', detail: '반응 좋은 소재에 예산 집중', at: 1100 },
] as const;

const RESULTS = [
  { label: '방문 유입', change: '2배' },
  { label: '구매 전환', change: '3배' },
  { label: '광고 수익률', change: '2배' },
] as const;

function ConversionCurve({ progress }: { progress: number }) {
  const id = useId();
  const curve = 'M0 74 C27 74 53 72 80 70 S133 67 160 63.5 S213 54 240 49.5 S293 40 320 37 S373 26 400 22';
  return <figure className="performance-curve" aria-label="광고 소재 최적화에 따라 구매 전환이 상승하는 예시 그래프">
    <svg viewBox="0 0 420 105" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#719cd8" stopOpacity=".22" />
          <stop offset="100%" stopColor="#719cd8" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-reveal`}><rect width={400 * progress} height="110" /></clipPath>
      </defs>
      <g className="performance-curve-axis" aria-hidden="true">
        {[20, 60, 100].map(y => <path key={y} d={`M10 ${y} H410`} />)}
      </g>
      <g transform="translate(10 0)" aria-hidden="true">
        <path className="performance-curve-baseline" d="M0 74 H400" />
        <g clipPath={`url(#${id}-reveal)`}>
          <path d={`${curve} V100 H0 Z`} fill={`url(#${id}-fill)`} />
          <path className="performance-curve-line" d={curve} />
        </g>
        <circle className="performance-curve-end" cx="400" cy="22" r="3.5" opacity={progress === 1 ? 1 : 0} />
      </g>
    </svg>
    <figcaption><span>광고 시작</span><span>소재 최적화</span><span>성과 상승</span></figcaption>
  </figure>;
}

export function PerformanceStudio() {
  const rootRef = useRef<HTMLElement>(null);
  const elapsedRef = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const [replay, setReplay] = useState(0);
  const [reduced, setReduced] = useState(true);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReduced(motion.matches);
    const onVisibility = () => setVisible(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting && entry.intersectionRatio >= 0.15);
    }, { threshold: [0, 0.15] });
    observer.observe(root);
    motion.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    onMotion();
    onVisibility();
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!inView || !visible || reduced) return;
    let frame = 0;
    let previous = performance.now();
    // Pause the same short sequence when its service or browser tab is hidden.
    const tick = (now: number) => {
      elapsedRef.current = Math.min(PERFORMANCE_DURATION, elapsedRef.current + now - previous);
      previous = now;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current < PERFORMANCE_DURATION) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, visible, reduced, replay]);

  const restart = () => {
    elapsedRef.current = 0;
    setElapsed(0);
    setReplay(value => value + 1);
  };

  const { time, progress, marker, resultMarker, image } = getPerformanceMotion(reduced ? PERFORMANCE_DURATION : elapsed);

  return (
    <section ref={rootRef} className="performance-studio" aria-label="디지털 퍼포먼스 캠페인 예시 기사">
      <article className="performance-article">
        <header className="performance-article-header">
          <h4><mark style={{ '--marker': marker } as CSSProperties}>콘텐츠와 광고 운영이 만나,</mark><br /><mark className="performance-marker-result" style={{ '--marker': resultMarker } as CSSProperties}>구매 전환 <em>3배</em>로</mark></h4>
          {!reduced && <button type="button" onClick={restart} aria-label="성과 흐름 다시 보기" title="성과 흐름 다시 보기">
            <RotateCcw size={14} aria-hidden="true" />
          </button>}
        </header>

        <div className="performance-story">
          <figure className="performance-editorial-photo">
            <div>
              {CAMPAIGN_IMAGES.map((asset, index) => <Image key={asset.src} data-current={index === image} aria-hidden={index !== image} src={asset.src} alt={asset.alt} width={1536} height={1024} unoptimized loading="lazy" draggable={false} />)}
            </div>
            <figcaption>영상·사진·카드뉴스를 광고 소재로</figcaption>
          </figure>
          <ol className="performance-operations" aria-label="콘텐츠에서 성과까지">
            {OPERATIONS.map((operation, index) => (
              <li key={operation.title} data-reached={time >= operation.at}>
                <span className="performance-step-number">0{index + 1}</span>
                <div><h5>{operation.title}</h5><p>{operation.detail}</p></div>
                {index < OPERATIONS.length - 1 && <ArrowDown className="performance-step-arrow" size={12} aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>

        <div className="performance-channels">
          <span>운영 매체</span>
          {[{ name: '네이버', icon: 'naver.png' }, { name: '구글', icon: 'google.png' }, { name: '메타', icon: 'meta.svg' }].map(({ name, icon }, index) => (
            <span key={name} data-reached={time >= 600 + index * 220}><Image src={`/brand-icons/${icon}`} alt="" width={13} height={13} unoptimized />{name}</span>
          ))}
        </div>

        <section className="performance-results" aria-label="광고 운영 전후 예시 성과">
          <div className="performance-results-heading">
            <h5>광고 운영 이후의 변화</h5>
            <span><i /> 구매 전환 추이</span>
          </div>
          <ConversionCurve progress={progress} />
          <dl className="performance-results-grid">
            {RESULTS.map(result => (
              <div key={result.label}>
                <dt>{result.label}</dt>
                <dd className="performance-result-value" data-visible={progress === 1}>
                  <strong>{result.change}</strong><ArrowUpRight size={16} aria-hidden="true" />
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <footer className="performance-article-note">가상의 캠페인 사례이며, 수치는 이해를 돕기 위한 예시입니다.</footer>
      </article>
    </section>
  );
}
