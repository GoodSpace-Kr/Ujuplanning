'use client';

import { useEffect, useRef, useState } from 'react';
import './telescope-study.css';

export function TelescopeStudy() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let teardown = () => {};
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      try {
        const { mountTelescopeScene } = await import('@/lib/telescope-scene');
        if (disposed) return;
        teardown = mountTelescopeScene(host);
        if (disposed) teardown();
        else setStatus('ready');
      } catch {
        if (!disposed) setStatus('failed');
      }
    }, { rootMargin: '500px' });
    observer.observe(host);
    return () => { disposed = true; observer.disconnect(); teardown(); };
  }, []);

  return (
    <section className={`telescope-study${status === 'failed' ? ' is-unavailable' : ''}`} id="telescope-study" aria-labelledby="telescope-study-heading">
      <div className="telescope-study-sticky">
        <div ref={hostRef} className="telescope-study-stage" role="img"
          aria-label="해 질 무렵 산 정상의 야외 관측 데크. 스크롤하면 무광 망원경의 접안렌즈로 다가가고, 렌즈 속 별들이 화면 전체의 우주로 이어집니다." />
        <header className="telescope-study-heading">
          <p>우주기획</p>
          <h2 id="telescope-study-heading">우주를 보는 시선.</h2>
          <span>스크롤하며 더 가까이 들여다보세요</span>
        </header>
        <div className="telescope-study-ending">
          <p>당신의 브랜드에는,</p>
          <h3>아직 발견하지 못한<br />우주가 있습니다.</h3>
        </div>
        {status !== 'ready' && <p className="telescope-study-status" role="status">{status === 'failed' ? '이 환경에서는 3D 화면을 표시할 수 없습니다.' : '빛과 질감을 준비하고 있어요.'}</p>}
        <div className="telescope-study-scroll" aria-hidden="true"><span />SCROLL TO DISCOVER</div>
      </div>
    </section>
  );
}
