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
    // The material study is loaded only as it approaches the viewport.
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      try {
        const { mountTelescopeScene } = await import('@/lib/telescope-scene');
        if (disposed) return;
        teardown = await mountTelescopeScene(host);
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
    <section className="telescope-study" id="telescope-study" aria-labelledby="telescope-study-heading">
      <div className="telescope-study-heading">
        <div><p>OPTICAL STUDY · 02</p><h2 id="telescope-study-heading">우주를 보는 시선.</h2></div>
        <span>3D 테스트</span>
      </div>
      <div ref={hostRef} className="telescope-study-stage" tabIndex={0} role="img"
        aria-label="흰색 경통과 코팅 렌즈, 금속 초점 조절부를 갖춘 천체망원경. 드래그 또는 방향키로 회전할 수 있습니다.">
        {status !== 'ready' && <p className="telescope-study-status" role="status">{status === 'failed' ? '이 환경에서는 3D 화면을 표시할 수 없습니다.' : '빛과 질감을 준비하고 있어요.'}</p>}
        <div className="telescope-study-caption" aria-hidden="true"><span>우주기획</span><span>드래그 · 방향키로 돌려보세요</span></div>
      </div>
    </section>
  );
}
