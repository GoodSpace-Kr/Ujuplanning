'use client';

import { useEffect, useRef, useState } from 'react';
import { measureBrandProcess } from '@/lib/brand-process-journey';
import './telescope-study.css';

export function TelescopeStudy({ embedded = false }: { embedded?: boolean }) {
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
        const { mountTelescopeSequence } = await import('@/lib/telescope-sequence');
        if (disposed) return;
        const process = embedded ? host.closest<HTMLElement>('.brand-process') : null;
        teardown = mountTelescopeSequence(host, status => { if (!disposed) setStatus(status); }, process ? () => {
          if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const gallery = process.querySelector<HTMLElement>('.brand-process-gallery')!;
            return Math.max(0, Math.min(1, -gallery.getBoundingClientRect().top / Math.max(1, gallery.clientHeight - host.clientHeight)));
          }
          return measureBrandProcess(process).film;
        } : undefined);
        if (disposed) teardown();
      } catch {
        if (!disposed) setStatus('failed');
      }
    }, { rootMargin: '500px' });
    observer.observe(host);
    return () => { disposed = true; observer.disconnect(); teardown(); };
  }, [embedded]);

  return (
    <section className={`telescope-study${embedded ? ' telescope-study-embedded' : ''}${status === 'ready' ? ' is-ready' : ''}`} id={embedded ? undefined : 'telescope-study'} aria-labelledby="telescope-study-heading">
      <div className="telescope-study-sticky">
        <div ref={hostRef} className="telescope-study-stage" role="img"
          aria-label="노을빛 창가의 망원경. 스크롤하면 접안렌즈로 천천히 다가가고, 렌즈 너머 별이 가득한 우주가 펼쳐집니다.">
          <picture className="telescope-study-poster" aria-hidden="true">
            <source media="(max-width: 700px)" srcSet="/assets/telescope-sequence/mobile/0000.webp" />
            <img src="/assets/telescope-sequence/desktop/0000.webp" width="1920" height="1080" alt="" loading="lazy" decoding="async" />
          </picture>
        </div>
        <h2 className="sr-only" id="telescope-study-heading">우주를 보는 시선.</h2>
        {status !== 'ready' && <p className="sr-only" role="status">{status === 'failed' ? '장면을 불러오지 못했어요. 새로고침해 주세요.' : '장면을 준비하고 있어요.'}</p>}
        <div className="telescope-study-scroll" aria-hidden="true"><span />SCROLL TO DISCOVER</div>
      </div>
    </section>
  );
}
