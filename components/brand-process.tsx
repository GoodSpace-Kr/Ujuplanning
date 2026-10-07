'use client';

import { useEffect, useRef } from 'react';
import { Binoculars, Compass, Network, Orbit } from 'lucide-react';
import { BRAND_PROCESS_EXPANSION_START, brandProcessIntroDelay, brandProcessIntroPhase, measureBrandProcess } from '@/lib/brand-process-journey';
import { mountProcessExpansion } from '@/lib/process-expansion';
import { TelescopeStudy } from './telescope-study';
import './brand-process.css';

const processIcons = [Binoculars, Compass, Network, Orbit];

const steps = [
  { word: 'OBSERVE', title: '관찰하다' },
  { word: 'DISCOVER', title: '발견하다' },
  { word: 'CONNECT', title: '연결하다' },
  { word: 'EXPAND', title: '확장하다' },
];

export function BrandProcess() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const cards = [...section.querySelectorAll<HTMLElement>('.brand-process-card')];
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let phase: 'intro' | 'moving' | 'mosaic' | 'steps' = 'intro';
    let transitionStart = 0;
    const introDescription = section.querySelector<HTMLElement>('.brand-process-intro p')!;
    const rebaseExpansion = () => {
      const viewport = section.querySelector<HTMLElement>('.brand-process-sticky')!.clientHeight;
      section.style.setProperty('--process-delay', String(brandProcessIntroDelay(-section.getBoundingClientRect().top, viewport)));
    };
    const setPhase = (next: typeof phase) => {
      phase = next;
      section.dataset.phase = next;
      introDescription.setAttribute('aria-hidden', String(next !== 'intro' && !motion.matches));
    };
    const update = () => {
      raf = 0;
      const viewport = section.querySelector<HTMLElement>('.brand-process-sticky')!.clientHeight;
      const offset = -section.getBoundingClientRect().top;
      if (offset < viewport * .06 && phase !== 'intro') {
        transitionStart = 0;
        section.style.removeProperty('--process-delay');
        setPhase('intro');
      } else if (offset >= viewport * BRAND_PROCESS_EXPANSION_START / 100 && phase === 'intro') {
        const expansionStart = parseFloat(getComputedStyle(section).getPropertyValue('--process-expansion-start')) || BRAND_PROCESS_EXPANSION_START;
        // Direct navigation to the film should retain its destination.
        if (motion.matches || offset >= viewport * (expansionStart + 100) / 100) setPhase('steps');
        else {
          transitionStart = performance.now();
          setPhase('moving');
        }
      }
      // Keep expansion at the current scroll position until all tiles have settled.
      // The next forward scroll can expand the image without a text-reading interval.
      if (phase === 'moving' || phase === 'mosaic') {
        rebaseExpansion();
        const next = brandProcessIntroPhase(performance.now() - transitionStart);
        if (next !== phase) setPhase(next);
      }
      const journey = measureBrandProcess(section);
      section.style.setProperty('--expand-progress', String(journey.expansion));
      section.toggleAttribute('data-expanding', journey.expansion > 0);
      section.toggleAttribute('data-film', journey.expansion >= 1);
      section.querySelector('.brand-process-gallery')!.setAttribute('aria-hidden', String(!motion.matches && journey.expansion < 1));
      cards.forEach((card, i) => {
        card.setAttribute('aria-hidden', String(i !== 3 || (!motion.matches && journey.expansion < 1)));
      });
      if (phase === 'moving' || phase === 'mosaic') raf = requestAnimationFrame(update);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    const stopExpansion = mountProcessExpansion(section);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    return () => {
      stopExpansion();
      cancelAnimationFrame(raf);
      section.style.removeProperty('--process-delay');
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <section ref={ref} className="brand-process" data-phase="intro" id="brand-process" aria-labelledby="brand-process-heading">
      <span id="telescope-study" className="brand-process-sequence-anchor" aria-hidden="true" />
      <div className="brand-process-sticky">
        <header className="brand-process-intro">
          <h2 id="brand-process-heading">우주기획의 <span>4가지 과정</span></h2>
          <p>브랜드와 시장을 관찰하고, 아직 발견하지 못한 가능성을 찾습니다.<br />
            전략과 실행을 연결해, 브랜드가 더 넓은 세계로 나아가도록 돕습니다.</p>
        </header>
        <div className="brand-process-gallery" aria-hidden="true">
          <div className="brand-process-edge brand-process-edge-left" aria-hidden="true"><span /><span /><span /></div>
          <div className="brand-process-edge brand-process-edge-right" aria-hidden="true"><span /><span /><span /></div>
          {steps.flatMap((step, i) => {
            const Icon = processIcons[i];
            return ['top', 'bottom'].map(position => (
              <div key={`${step.word}-${position}`} className={`brand-process-tile brand-process-tile-${i} brand-process-tile-${position}`} aria-hidden="true">
                <span className="brand-process-tile-word">{position === 'top' ? step.title : step.word}</span>
                <Icon className="brand-process-tile-icon" strokeWidth={1.3} />
                <span className="brand-process-tile-number">0{i + 1}</span>
              </div>
            ));
          })}
          {steps.map((step, i) => (
            <div key={step.word} className={`brand-process-card brand-process-card-${i}`}>
              <div className="brand-process-card-float">
                <div className="brand-process-placeholder">
                  {i === 3 ? <TelescopeStudy embedded /> : (
                    <img className="brand-process-image" src={`/assets/brand-process/${step.word.toLowerCase()}.webp`} alt="" loading="lazy" decoding="async" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="brand-process-hint" aria-hidden="true">SCROLL TO EXPLORE <span>↓</span></p>
      </div>
    </section>
  );
}
