'use client';

import { useEffect, useRef } from 'react';
import './brand-process.css';

const steps = [
  { word: 'OBSERVE', title: '관찰하다', description: '브랜드, 시장, 경쟁사와 고객의 행동을 깊이 관찰합니다.' },
  { word: 'DISCOVER', title: '발견하다', description: '브랜드가 놓치고 있던 문제와 새로운 가능성을 발견합니다.' },
  { word: 'CONNECT', title: '연결하다', description: '발견한 가능성을 전략, 콘텐츠, 광고와 고객 경험으로 연결합니다.' },
  { word: 'EXPAND', title: '확장하다', description: '실행과 성과를 통해 브랜드가 더 넓은 시장으로 나아가도록 돕습니다.' },
];

export function BrandProcess() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const copies = [...section.querySelectorAll<HTMLElement>('.brand-process-copy')];
    const cards = [...section.querySelectorAll<HTMLElement>('.brand-process-card')];
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    const update = () => {
      raf = 0;
      const viewport = section.querySelector<HTMLElement>('.brand-process-sticky')!.clientHeight;
      const available = section.offsetHeight - viewport;
      const progress = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / Math.max(1, available)));
      // Continuous travel through all four steps, including the final copy's exit.
      const travel = progress * steps.length;
      const active = Math.min(3, Math.round(travel));
      const textTravel = section.querySelector<HTMLElement>('.brand-process-copy-window')!.clientHeight * .9;
      section.dataset.activeStep = steps[active].word.toLowerCase();
      copies.forEach((copy, i) => {
        const distance = i - travel;
        copy.style.setProperty('--copy-y', `${distance * textTravel}px`);
        copy.style.setProperty('--copy-opacity', String(Math.max(0, 1 - Math.abs(distance) * 1.25)));
        // The static reduced-motion layout exposes all four descriptions.
        copy.setAttribute('aria-hidden', String(!motion.matches && i !== active));
      });
      cards.forEach((card, i) => card.classList.toggle('is-active', i === active));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <section ref={ref} className="brand-process" id="brand-process" aria-labelledby="brand-process-heading">
      <h2 className="sr-only" id="brand-process-heading">우주기획이 일하는 방식</h2>
      <div className="brand-process-sticky">
        <p className="brand-process-label">우주기획이 일하는 방식</p>
        <div className="brand-process-copy-window">
          {steps.map((step, i) => (
            <article key={step.word} className="brand-process-copy">
              <p className="brand-process-word"><span>0{i + 1}</span>{step.word}</p>
              <h3>{step.title}</h3>
              <p className="brand-process-description">{step.description}</p>
            </article>
          ))}
        </div>
        <div className="brand-process-gallery" aria-hidden="true">
          {steps.map((step, i) => (
            <div key={step.word} className={`brand-process-card brand-process-card-${i}${i === 0 ? ' is-active' : ''}`}>
              <div className="brand-process-card-float">
                <div className="brand-process-placeholder"><span>0{i + 1}</span></div>
                <div className="brand-process-card-caption"><span>{step.word}</span><span>{step.title}</span></div>
              </div>
            </div>
          ))}
        </div>
        <p className="brand-process-hint" aria-hidden="true">SCROLL TO EXPLORE <span>↓</span></p>
      </div>
    </section>
  );
}
