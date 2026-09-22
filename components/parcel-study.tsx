'use client';

import { useEffect, useRef, useState } from 'react';
import './parcel-study.css';

export function ParcelStudy() {
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
        const { mountParcelScene } = await import('@/lib/parcel-scene');
        if (disposed) return;
        teardown = await mountParcelScene(host);
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
    <section className="parcel-study" id="parcel-study" aria-labelledby="parcel-study-heading">
      <div className="parcel-study-heading">
        <div><p>MATERIAL STUDY · 01</p><h2 id="parcel-study-heading">빛을 담은 작은 상자.</h2></div>
        <span>3D 테스트</span>
      </div>
      <div ref={hostRef} className="parcel-study-stage" tabIndex={0} role="img"
        aria-label="햇빛이 드는 공간의 골판지 상자와 노란 우주기획 테이프. 마우스 또는 방향키로 시점을 움직일 수 있습니다.">
        {status !== 'ready' && <p className="parcel-study-status" role="status">{status === 'failed' ? '이 환경에서는 3D 화면을 표시할 수 없습니다.' : '빛과 질감을 준비하고 있어요.'}</p>}
        <div className="parcel-study-caption" aria-hidden="true"><span>우주기획</span><span>마우스 또는 방향키로 시점을 움직여보세요</span></div>
      </div>
    </section>
  );
}
