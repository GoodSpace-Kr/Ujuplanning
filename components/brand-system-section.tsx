'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BrandSystemCanvas } from '@/components/brand-system-canvas';

const SYSTEM_STEPS = [
  {
    key: 'chaos',
    eyebrow: 'CHAOS',
    title: ['브랜드의 문제는', '하나씩 따로 오지 않습니다.'],
    body: '브랜드 방향, 콘텐츠, 광고, 채널, 고객 경험은 서로 연결되어 있습니다.',
  },
  {
    key: 'direction',
    eyebrow: 'BRAND DIRECTION',
    title: ['브랜드와 마케팅 방향을', '정리하고 싶을 때'],
    body: '브랜드의 기준점과 마케팅 방향을 정리합니다.',
  },
  {
    key: 'content',
    eyebrow: 'CONTENT',
    title: ['좋은 콘텐츠를', '지속해서 만들고 싶을 때'],
    body: '브랜드를 중심으로 지속 가능한 콘텐츠 흐름을 설계합니다.',
  },
  {
    key: 'performance',
    eyebrow: 'PERFORMANCE',
    title: ['광고 성과와 고객 전환을', '높이고 싶을 때'],
    body: '유입과 콘텐츠를 실제 행동과 전환으로 연결합니다.',
  },
  {
    key: 'channel',
    eyebrow: 'CHANNEL',
    title: ['SNS와 온라인 채널을', '체계적으로 운영하고 싶을 때'],
    body: '흩어진 채널을 하나의 브랜드 흐름으로 연결합니다.',
  },
  {
    key: 'experience',
    eyebrow: 'EXPERIENCE',
    title: ['오프라인 행사와', '브랜드 경험을 만들고 싶을 때'],
    body: '온라인의 메시지를 실제 공간과 고객 경험으로 확장합니다.',
  },
  {
    key: 'system',
    eyebrow: 'UJU BRAND SYSTEM',
    title: ['흩어진 문제를 연결해', '하나의 브랜드 경험을 만듭니다.'],
  },
];

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

export function BrandSystemSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0);
  const [activeStep, setActiveStep] = useState(0);
  const stepNumber = useMemo(
    () => String(activeStep + 1).padStart(2, '0'),
    [activeStep],
  );

  useEffect(() => {
    let frameId = 0;

    const update = () => {
      const section = sectionRef.current;
      if (!section) return;

      const bounds = section.getBoundingClientRect();
      const distance = Math.max(bounds.height - window.innerHeight, 1);
      const progress = clamp(-bounds.top / distance);
      progressRef.current = progress;
      const nextStep = Math.min(
        SYSTEM_STEPS.length - 1,
        Math.floor(progress * SYSTEM_STEPS.length),
      );
      setActiveStep((current) => (current === nextStep ? current : nextStep));
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <section ref={sectionRef} className="brand-system-section">
      <div className="brand-system-sticky">
        <div className="brand-system-backdrop" aria-hidden="true" />

        <div className="brand-system-layout">
          <div className="brand-system-copy" aria-live="polite">
            <div className="brand-system-counter" aria-hidden="true">
              <span>{stepNumber}</span>
              <i />
              <span>07</span>
            </div>

            <div className="brand-system-copy-stack">
              {SYSTEM_STEPS.map((step, index) => {
                const state =
                  index === activeStep
                    ? 'is-active'
                    : index < activeStep
                      ? 'is-before'
                      : 'is-after';

                return (
                  <article
                    key={step.key}
                    className={`brand-system-step ${state} ${
                      step.key === 'system' ? 'is-final' : ''
                    }`}
                    aria-hidden={index !== activeStep}
                  >
                    <p className="brand-system-eyebrow">{step.eyebrow}</p>
                    <h2>
                      {step.title.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </h2>
                    {step.body ? <p className="brand-system-body">{step.body}</p> : null}
                  </article>
                );
              })}
            </div>

            <div className="brand-system-progress" aria-hidden="true">
              {SYSTEM_STEPS.map((step, index) => (
                <span key={step.key} className={index === activeStep ? 'is-active' : ''} />
              ))}
            </div>
          </div>

          <div className="brand-system-visual">
            <BrandSystemCanvas progressRef={progressRef} />
            <div className="brand-system-axis" aria-hidden="true">
              <span>{SYSTEM_STEPS[activeStep].eyebrow}</span>
              <i />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
