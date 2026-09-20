'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, BarChart3, Check, MousePointer2, Target, Users } from 'lucide-react';
import './performance-studio.css';

function AdPhoto() {
  return <Image src="/creative-product.png" alt="" width={1536} height={1024} unoptimized loading="lazy" draggable={false} />;
}

export function PerformanceStudio() {
  const rootRef = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReduced(motion.matches);
    const onVisibility = () => setVisible(!document.hidden);
    const resize = () => {
      const { width, height } = root.getBoundingClientRect();
      const compact = width < 760;
      root.dataset.compact = String(compact);
      root.style.setProperty('--performance-scale', String(Math.max(0, Math.min((width - 24) / (compact ? 660 : 1080), (height - 36) / (compact ? 900 : 500)))));
    };
    const intersection = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    const sizes = new ResizeObserver(resize);
    intersection.observe(root);
    sizes.observe(root);
    motion.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    onMotion();
    onVisibility();
    resize();
    return () => {
      intersection.disconnect();
      sizes.disconnect();
      motion.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <figure ref={rootRef} className="performance-studio" data-running={inView && visible && !reduced} data-still={reduced}
    aria-label="제품 광고를 세 가지 비율로 제작하고 네이버·구글·메타에 집행한 뒤, 유입·관심·전환을 분석해 광고 문구를 개선하는 캠페인 예시 애니메이션">
    <div className="performance-stage" aria-hidden="true">
      <svg className="performance-connections" viewBox="0 0 1080 500" fill="none">
        {[150, 238, 326].map((y, i) => <g key={y} className={`performance-route performance-route-${i}`}>
          <path d={`M292 248 H326 Q338 248 338 ${y} H560`} className="performance-route-track" />
          <path d={`M292 248 H326 Q338 248 338 ${y} H560`} className="performance-route-signal" pathLength="1" />
        </g>)}
      </svg>
      <svg className="performance-connections performance-connections-mobile" viewBox="0 0 660 900" fill="none">
        {[121, 209, 297].map((y, i) => <g key={y} className={`performance-route performance-route-${i}`}>
          <path d={`M310 240 H394 V${y} H610 V424 H330 V449`} className="performance-route-track" />
          <path d={`M310 240 H394 V${y} H610 V424 H330 V449`} className="performance-route-signal" pathLength="1" />
        </g>)}
      </svg>

      <div className="performance-assets">
        <div className="performance-paper performance-ad-wide">
          <div className="performance-format"><span>브랜드 광고</span><span>16:9</span></div>
          <AdPhoto />
          <p>일상에 스며드는 브랜드</p>
        </div>
        <div className="performance-paper performance-ad-portrait">
          <div className="performance-format"><span>숏폼</span><span>9:16</span></div>
          <AdPhoto />
          <p>나를 닮은<br />새로운 일상</p>
        </div>
        <div className="performance-paper performance-ad-main">
          <div className="performance-heading"><span>우주기획</span><small>FRAGRANCE</small></div>
          <div className="performance-ad-image"><AdPhoto /><span className="performance-product-caption">시그니처 향기</span></div>
          <div className="performance-ad-copy">
            <small>SCENT OF YOUR DAY</small>
            <div className="performance-copy-slot">
              <p className="performance-copy-original"><span>일상을 채우는</span><br /><span>새로운 시선</span></p>
              <p className="performance-copy-improved"><span>당신의 일상에</span><br /><span>어울리는 향</span></p>
            </div>
            <div className="performance-ad-cta">나에게 맞는 향 만나보기 <ArrowRight size={13} /></div>
          </div>
          <div className="performance-footer"><span>우주기획</span><span className="performance-copy-status">메시지 개선 완료</span></div>
        </div>
      </div>

      <div className="performance-media">
        {[{ name: '네이버', icon: 'naver.png' }, { name: '구글', icon: 'google.png' }, { name: '메타', icon: 'meta.svg' }].map(({ name, icon }, i) => <div className={`performance-medium performance-medium-${i}`} key={name}>
          <Image className="performance-medium-icon" src={`/brand-icons/${icon}`} alt="" width={26} height={26} unoptimized />
          <span className="performance-medium-name">{name}</span>
        </div>)}
      </div>

      <div className="performance-paper performance-dashboard">
        <div className="performance-heading"><span><BarChart3 size={16} /> 캠페인 성과</span></div>
        <div className="performance-dashboard-body">
          <div className="performance-metrics">
            {[{ label: '유입', value: '12,480', unit: '방문', Icon: MousePointer2 }, { label: '관심', value: '836', unit: '참여', Icon: Users }, { label: '전환', value: '64', unit: '문의', Icon: Target }].map(({ label, value, unit, Icon }, i) => <div className={`performance-metric performance-metric-${i}`} key={label}>
              <span><Icon size={13} />{label}</span><strong>{value}</strong><small>{unit}</small>
            </div>)}
          </div>
          <div className="performance-chart-title"><span>고객 반응의 흐름</span><small><i />전환 추이</small></div>
          <div className="performance-chart">
            <svg viewBox="0 0 410 140" fill="none">
              {[26, 66, 106].map(y => <path key={y} d={`M4 ${y} H406`} stroke="#e8eef6" />)}
              <path className="performance-chart-line" pathLength="1" d="M5 116 L38 110 L71 113 L104 94 L137 98 L170 76 L203 82 L236 61 L269 58 L294 50" />
              <path className="performance-chart-gain" pathLength="1" d="M294 50 L323 44 L350 30 L377 25 L405 9" />
              <path className="performance-chart-marker" d="M294 8 V124" stroke="#b0c9ef" strokeDasharray="3 4" />
            </svg>
            <span className="performance-chart-note">소재 개선</span>
          </div>
          <div className="performance-chart-axis"><span>집행 시작</span><span>반응 분석</span><span>최적화</span></div>
          <div className="performance-comparison">
            <div className="performance-comparison-title"><span>광고 소재 비교</span><small>참여 반응</small></div>
            <div className="performance-variant performance-variant-a"><span>소재 A</span><div><i /></div><small>기존 문구</small></div>
            <div className="performance-variant performance-variant-b"><span>소재 B</span><div><i /></div><small><Check size={12} />선택</small></div>
          </div>
        </div>
        <div className="performance-footer"><span>우주기획</span><span className="performance-result"><Check size={11} />분석을 다음 실행으로</span></div>
      </div>
    </div>
  </figure>;
}
